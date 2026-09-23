import { useState } from "react";
import MainLayout from "./layouts/MainLayout";
import "./App.css";
import { useEffect } from "react";
import { Routes } from "react-router-dom";
import { Route } from "react-router-dom";
import ClientList from "./components/ClientList";
import ClientForm from "./components/ClientForm";
import DashboardSummary from "./components/DashboardSummary";
import Callbacks from "./pages/Callbacks";
import CallbacksForm from "./components/CallbacksForm";
import type {
  Client,
  Callback,
  NewCallback,
  NewClient,
  ClientWithApp,
  CallbackWithClient
} from "./types";
import { supabase } from "./lib/supabase";

function App() {
//refactori
const [clients, setClients] = useState<ClientWithApp[]>([])
//
useEffect(() => {
  const loadClients = async () => {
    const { data, error } = await supabase
      .from("clientes")
      .select("*, apps(id, name)")
      .eq("active", true) //filtra los clientes activos

    if (error) {
      console.log(error)
      return
    }

    const clientsWithApps = data as ClientWithApp[]
    if (data) {
      setClients(clientsWithApps)
    }
  }

  loadClients()
}, [])

//async porq esperamos que se comunique con SB
const addClient = async (newClient: NewClient) =>{
  console.log("Cliente que voy a insertar:", newClient)

//insertamos newC en la tabla clientes
//error: informacion del error
const { data,error } = await supabase
      .from("clientes")
      .insert(newClient)
      .select()//registro nuevo
      .single()//como esperamos un solo registro, lo convierte en un objeto en vez de un array

      if (error) {
  console.log(error)
  return
  //return porq si insert falla no queremos continuar como si funcionara
}

setClients([
  ...clients,
  {
    ...data,
    apps: null
  }
])
}

//soft delete: desactiva el cliente en vez de eliminarlo
const deleteClient = async (clientToDelete: Client) => {
  const { error } = await supabase
      .from("clientes")
      .update({ active: false })
      .eq("id", clientToDelete.id)

      if (error) {
          console.log(error)
          return
      }

  setClients(
    clients.filter(
      (currentClient) => clientToDelete.id !== currentClient.id
    )
  )
}

const [editingClient, setEditingClient] = useState<Client | null>(null)

const startEditing = (client: Client) => {
    console.log(client)
  setEditingClient(client)
}

//cliente al que le vamos a crear un callback
const [callbackClient, setCallbackClient] = useState<Client | null>(null)

const startCallback = (client: Client) => {
  setCallbackClient(client)
}

const updateClient = async (updatedClient: Client) => {
    const { data,error } = await supabase
    .from ("clientes")
    .update(updatedClient)
    .eq("id", updatedClient.id)
    .select()
    .single()

    console.log("Update data:", data)
    console.log("Update error:", error)

    if(error){
      console.log(error)
      return
    }

    setClients(
      clients.map((currentClient) => {
        if (currentClient.id === updatedClient.id) {
          return {
            ...updatedClient,
            apps: currentClient.apps
          }
        }

        return currentClient
      })
    )
}


//callbacks ahora vienen desde Supabase
const [callbacks, setCallbacks] = useState<CallbackWithClient[]>([])

useEffect(() => {
  const loadCallbacks = async () => {
    const { data, error } = await supabase
      .from("callbacks")
      //sb devuelve=>:
      .select(`*,
        clientes (
      id,
      name,
      phone,
      source,
      apps (
      id,
      name
      )
    )`
  )
      .order("scheduled_at", { ascending: true })

    if (error) {
      console.log(error)
      return
    }

    setCallbacks(data as CallbackWithClient[])
    console.log("Callbacks:", data)
  }

  loadCallbacks()
}, [])

//actualiza el estado del callback en Supabase
const handleCancel = async (callbackCancel: Callback) => {
  const { error } = await supabase
    .from("callbacks")
    .update({
      status: "cancelled",
      call_result: null
    })
    .eq("id", callbackCancel.id)

  if (error) {
    console.log(error)
    return
  }

  setCallbacks(
    callbacks.map((currentCallback) => {
      if (currentCallback.id === callbackCancel.id) {
        return {
          ...currentCallback,
          status: "cancelled",
          call_result: null
        }
      }

      return currentCallback
    })
  )
}

//marca un cb como complt y guarda el resultado de la llmd
const handleCompleteCallback = async (
  callbackComplete: CallbackWithClient,
  callResult: "accepted" | "declined"
) => {
  const { error } = await supabase
    .from("callbacks")
    .update({
      status: "completed",
      call_result: callResult,
      next_reminder_at: null
    })
    .eq("id", callbackComplete.id)

  if (error) {
    console.log(error)
    return
  }
  //modificar el rct
  setCallbacks(
    //recorre los cb hasta encontrar el que acabamos de modi
    callbacks.map((currentCallback) => {
      if (currentCallback.id === callbackComplete.id) {
        return {
          ...currentCallback,
          status: "completed",
          call_result: callResult,
          next_reminder_at: null
        }
      }
      
      return currentCallback
    })
  ) 
}

const handleReschedule = async (
  callbackReschedule: CallbackWithClient,
  newScheduledAt: string
) => {
    const scheduledAt = new Date(
      newScheduledAt
    ).toISOString();

    const { error } = await supabase
      .from("callbacks")
      .update({
        status: "completed",
        call_result: "rescheduled",
        next_reminder_at: null
      })
      .eq("id", callbackReschedule.id);
      if(error){
        console.log(error)
        return; //evita que se cree un nuevo cb si el cb original no pudo act
      }
      const { data, error: newCallbackError } = await supabase
        .from ("callbacks")
        .insert({
          scheduled_at: scheduledAt,
          status: "pending",
          call_result: null,
          next_reminder_at: null,
          client_id: callbackReschedule.client_id
        })
        .select()
        .single();

      if (newCallbackError) {
        console.log(newCallbackError);
        return;
      }
      setCallbacks(
        callbacks.map((currentCallback) => {
          if (currentCallback.id === callbackReschedule.id) {
            return {
              ...currentCallback,
              status: "completed" as const,
              call_result: "rescheduled" as const,
              next_reminder_at: null
            };
          }
          return currentCallback;
        }).concat(data as CallbackWithClient)
);
}

//recibe el callback, y se anade al final
const addCallback = async (newCallback: NewCallback) => {

  const scheduledAt = new Date(
    newCallback.scheduled_at
  ).toISOString();

  const { data, error } = await supabase
    .from("callbacks")
    .insert({
      ...newCallback,
      scheduled_at: scheduledAt,
      status: "pending",
      call_result: null,
      next_reminder_at: null
    })
    .select()
    .single();

  if (error) {
    console.log(error);
    return;
  }

  setCallbacks([
    ...callbacks,
    data as CallbackWithClient
  ]);
};


  return (
    <>
      <Routes>
        <Route element={<MainLayout />}>

        <Route
          path="/"
          element={
            <DashboardSummary
              callbacks={callbacks}
            />
          }
        />

        <Route
          path="/clients"
          element={
          <>
            <ClientForm
              onAddClient={addClient}
              editingClient={editingClient}
              onUpdateClient={updateClient}
            />

            <ClientList
              clients={clients}
              onDeleteClient={deleteClient}
              onEditClient={startEditing}
              onCallbackClient={startCallback}
            />

            //si hay un cliente seleccionado para callback, mostramos el formulario
            {callbackClient && (
              <CallbacksForm
                client={callbackClient}
                onAddCallback={addCallback}
              />
            )}
          </>
          }
        />

        <Route
          path="/callbacks"
          element={
          <>
            <Callbacks
              callbacks={callbacks}
              handleCancel={handleCancel}
              handleCompleteCallback={handleCompleteCallback}
              handleReschedule={handleReschedule}
            />
          </>
          }
        />

        </Route>
      </Routes>
    </>
  )
}


export default App