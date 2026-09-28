import { useState } from "react";
import MainLayout from "./layouts/MainLayout";
import "./styles/App.css"
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
const [clientsLoading, setClientsLoading] = useState(true) //clients "cargando"
const [clientsError, setClientsError] = useState<string | null>(null)
const [saveMessage, setSaveMessage] = useState<string | null>(null);
//
useEffect(() => {
  const loadClients = async () => {
    const { data, error } = await supabase
      .from("clientes")
      .select("*, apps(id, name)")
      .eq("active", true) //filtra los clientes activos

    if (error) {
      console.log(error)
      setClientsError("No se pudieron cargar los clientes")
      setClientsLoading(false)
      
      return
    }

    const clientsWithApps = data as ClientWithApp[]
    if (data) {
      setClients(clientsWithApps)
    }
    setClientsLoading(false)
  }

  loadClients()
}, [])

//async porq esperamos que se comunique con SB
const createClientndCallbck = async (
  newClient: NewClient,
  callback: {
    scheduled_at: string
    notes?: string
  }
) => {

  //Creamos el cliente
  const { data: clientData, error: clientError } = await supabase
    .from("clientes")
    .insert(newClient)
    .select()
    .single()

  if (clientError) {
    console.log("CLIENT ERROR:", clientError)
    return false
  }

  //Creamos el callback usando el id del cliente recién creado
  const scheduledAt = new Date(
    callback.scheduled_at
  ).toISOString()

  const { data: callbackData, error: callbackError } = await supabase
    .from("callbacks")
    .insert({
      client_id: clientData.id,
      scheduled_at: scheduledAt,
      notes: callback.notes || null,
      status: "pending",
      call_result: null,
      next_reminder_at: null
    })
    .select()
    .single()

  if (callbackError) {
    console.log("CALLBACK ERROR:", callbackError)
    return false
  }

  // Actualizar clientes en React
  setClients([
    ...clients,
    {
      ...clientData,
      apps: null
    }
  ])

  //Actualizar callbacks en React
  setCallbacks([
    ...callbacks,{
      ...(callbackData as Callback),
      clientes: {
        id: clientData.id,
        name: clientData.name,
        phone: clientData.phone,
        source: clientData.source,
        apps: null
      }
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
          return false
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
      return false
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
const [callbacksLoading, setCallbacksLoading] = useState(true)
const [callbacksError, setCallbacksError] = useState<string | null>(null)

useEffect(() => {
  const loadCallbacks = async () => {
    setCallbacksLoading(true)
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
      setCallbacksError("No se pudieron cargar los callbacks")
      setCallbacksLoading(false)
      return false
    }

    setCallbacks(data as CallbackWithClient[])
    console.log("Callbacks:", data)

    setCallbacksLoading(false)
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
    return false;
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
    return false;
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
        return false; //evita que se cree un nuevo cb si el cb original no pudo act
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
        return false;
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
const handleSnooze = async (
  callbackSnooze: CallbackWithClient,
  minutes: number
) => {
  const reminderAt = new Date();

  reminderAt.setMinutes(
    reminderAt.getMinutes() + minutes
  );

  const reminderAtISO = reminderAt.toISOString();
    console.log("REMINDER:", reminderAtISO);

  const {error} = await supabase
  .from("callbacks")
  .update({
    next_reminder_at: reminderAtISO
  })
  .eq("id", callbackSnooze.id)
  if(error){
    console.log("snooze:", error);
    return false;
  }
  console.log("SNOOZE UPDATED");
  setCallbacks(
    callbacks.map((currentCallback) => {
      if (currentCallback.id === callbackSnooze.id) {
        return {
          ...currentCallback,
          next_reminder_at: reminderAtISO
        };
      }

      return currentCallback;
    })
  );
};
const handleCustomSnooze = async (
  callbackSnooze: CallbackWithClient,
  customReminderAt: string
) => {
  const reminderAtISO = new Date(
    customReminderAt
  ).toISOString();

  const { error } = await supabase
    .from("callbacks")
    .update({
      next_reminder_at: reminderAtISO
    })
    .eq("id", callbackSnooze.id);

  if (error) {
    console.log("CUSTOM SNOOZE ERROR:", error);
    return false;
  }

  setCallbacks(
    callbacks.map((currentCallback) => {
      if (currentCallback.id === callbackSnooze.id) {
        return {
          ...currentCallback,
          next_reminder_at: reminderAtISO
        };
      }

      return currentCallback;
    })
  );
};

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
    return false;
  }

  // Buscamos la información del cliente para completar CallbackWithClient
  const { data: clientData, error: clientError } = await supabase
    .from("clientes")
    .select(`
      id,
      name,
      phone,
      source,
      apps (
        id,
        name
      )
    `)
    .eq("id", newCallback.client_id)
    .single();

  if (clientError) {
    console.log(clientError);
    return false;
  }

  setCallbacks([
    ...callbacks,
    {
      ...(data as Callback),
      clientes: {
        ...clientData,
          apps: clientData.apps[0] ?? null //toma el primer elemento[0] si no existe null
      }
    }
  ]);
};

const handleSaveCallbackNotes = async (
  callback: CallbackWithClient,
  notes: string
) => {
  const { error } = await supabase
    .from("callbacks")
    .update({
      notes: notes || null
    })
    .eq("id", callback.id)

  if (error) {
    console.log("SAVE NOTES ERROR:", error)
    return false;
  }

  setCallbacks(
    callbacks.map((currentCallback) => {
      if (currentCallback.id === callback.id) {
        return {
          ...currentCallback,
          notes: notes || null
        }
      }

      return currentCallback
    })
  )
}
//
const handleSaveCallback = async (
    callback: CallbackWithClient,
    notes: string,
    callResult: "accepted" | "rescheduled" | "declined" | null,
    snoozeAt: string | null,
    rescheduleAt: string
): Promise<boolean> => {

    // Accepted / Declined
    if (callResult === "accepted" || callResult === "declined") {

        const { error } = await supabase
            .from("callbacks")
            .update({
                status: "completed",
                call_result: callResult,
                next_reminder_at: null,
                notes: notes || null
            })
            .eq("id", callback.id);

        if (error) {
            console.log("SAVE CALLBACK ERROR:", error);
            return false;
        }

        setCallbacks(
            callbacks.map((currentCallback) => {

                if (currentCallback.id === callback.id) {
                    return {
                        ...currentCallback,
                        status: "completed",
                        call_result: callResult,
                        next_reminder_at: null,
                        notes: notes || null
                    };
                }

                return currentCallback;
            })
        );

        return true;
    }

    // Reschedule
    if (
        callResult === "rescheduled" &&
        rescheduleAt
    ) {

        // Completar callback actual
        const { error: updateError } = await supabase
            .from("callbacks")
            .update({
                status: "completed",
                call_result: "rescheduled",
                next_reminder_at: null,
                notes: notes || null
            })
            .eq("id", callback.id);

        if (updateError) {
            console.log(
                "RESCHEDULE UPDATE ERROR:",
                updateError
            );
            return false;
        }

        // Crear nuevo callback
        const { data: newCallback, error: insertError } =
            await supabase
                .from("callbacks")
                .insert({
                    client_id: callback.client_id,
                    scheduled_at: new Date(
                        rescheduleAt
                    ).toISOString(),
                    status: "pending",
                    notes: null,
                    call_result: null,
                    next_reminder_at: null
                })
                .select(`
                    *,
                    clientes (
                        id,
                        name,
                        phone
                    )
                `)
                .single();

        if (insertError) {
            console.log(
                "RESCHEDULE INSERT ERROR:",
                insertError
            );
            return false;
        }

        // Actualizar estado local
        setCallbacks(
            callbacks
                .map((currentCallback) => {

                    if (currentCallback.id === callback.id) {
                        return {
                            ...currentCallback,
                            status: "completed" as const,
                            call_result: "rescheduled" as const,
                            next_reminder_at: null,
                            notes: notes || null
                        };
                    }

                    return currentCallback;
                })
                .concat(newCallback as CallbackWithClient)
        );

        return true;
    }

    // Snooze
    if (snoozeAt) {

        const { error } = await supabase
            .from("callbacks")
            .update({
                next_reminder_at: snoozeAt,
                notes: notes || null
            })
            .eq("id", callback.id);

        if (error) {
            console.log(
                "SNOOZE CALLBACK ERROR:",
                error
            );
            return false;
        }

        setCallbacks(
            callbacks.map((currentCallback) => {

                if (currentCallback.id === callback.id) {
                    return {
                        ...currentCallback,
                        next_reminder_at: snoozeAt,
                        notes: notes || null
                    };
                }

                return currentCallback;
            })
        );

        return true; 
    }
    console.log("SAVE DEBUG:", {
    callResult,
    snoozeAt,
    rescheduleAt
});

    console.log("NO CALLBACK ACTION SELECTED");
    return false
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
    <div className="clients-page">

      <div className="clients-form-column">
  <ClientForm
    onCreateClientndCallbck={createClientndCallbck}
    editingClient={editingClient}
    onUpdateClient={updateClient}
  />
</div>

<div className="clients-list-column">
  {clientsLoading ? (
    <p>Loading clients list...</p>)
    : clientsError ? (
      <p>{clientsError}</p>
    ) : clients.length === 0 ? (
      <p>No clients found</p>
    ) :(
  <ClientList
    clients={clients}
    onDeleteClient={deleteClient}
    onEditClient={startEditing}
    onCallbackClient={startCallback}
  />
  )}

  {callbackClient && (
    <CallbacksForm
      client={callbackClient}
      onAddCallback={addCallback}
    />
  )}
</div>

    </div>
  }
/>

        <Route
          path="/callbacks"
          element={
          <>
            <Callbacks
              callbacks={callbacks}
              callbacksLoading={callbacksLoading}
              callbacksError={callbacksError}
              handleCancel={handleCancel}
              handleCompleteCallback={handleCompleteCallback}
              handleReschedule={handleReschedule}
              handleSnooze={handleSnooze}
              handleCustomSnooze={handleCustomSnooze}
              handleSaveCallbackNotes={handleSaveCallbackNotes}
              handleSaveCallback={handleSaveCallback}
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