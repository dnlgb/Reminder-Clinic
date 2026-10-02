import { useEffect, useState } from "react";

import MainLayout from "./layouts/MainLayout";
import "./styles/App.css";

import { Route, Routes } from "react-router-dom";

import ClientList from "./components/ClientList";
import ClientForm from "./components/ClientForm";
import DashboardSummary from "./components/DashboardSummary";
import Callbacks from "./pages/Callbacks";
import Login from "./components/Login";
import ClientDetails from "./components/ClientDetails";

import type {
  Client,
  Callback,
  NewClient,
  ClientWithApp,
  CallbackWithClient,
} from "./types";

import { supabase } from "./lib/supabase";

function App() {
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [clients, setClients] = useState<ClientWithApp[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [clientsError, setClientsError] = useState<string | null>(null);

  const [editingClient, setEditingClient] = useState<Client | null>(null);
  

  const [callbacks, setCallbacks] = useState<CallbackWithClient[]>([]);
  const [callbacksLoading, setCallbacksLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<ClientWithApp | null>(null);
  const [callbacksError, setCallbacksError] = useState<string | null>(null);

  // Obtiene la sesión actual y mantiene el estado sincronizado
  // cuando el usuario inicia o cierra sesión.
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();

      setSession(data.session);
      setAuthLoading(false);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Carga únicamente los clientes cuando existe una sesión activa.
  // RLS se encarga de limitar los resultados al usuario autenticado.
  useEffect(() => {
    if (!session) {
      setClients([]);
      return;
    }

    const loadClients = async () => {
      setClientsLoading(true);
      setClientsError(null);

      const { data, error } = await supabase
        .from("clientes")
        .select("*, apps(id, name)")
        .eq("active", true);

      if (error) {
        console.log(error);
        setClientsError("No se pudieron cargar los clientes");
        setClientsLoading(false);
        return;
      }

      setClients(data as ClientWithApp[]);
      setClientsLoading(false);
    };

    loadClients();
  }, [session]);

  // Carga los callbacks asociados a los clientes del usuario.
  // La relación con clientes y apps permite mostrar toda la información
  // necesaria en la interfaz sin hacer consultas separadas por callback.
  useEffect(() => {
    if (!session) {
      setCallbacks([]);
      return;
    }

    const loadCallbacks = async () => {
      setCallbacksLoading(true);
      setCallbacksError(null);

      const { data, error } = await supabase
        .from("callbacks")
        .select(`
          *,
          clientes (
            id,
            name,
            phone,
            source,
            apps (
              id,
              name
            )
          )
        `)
        .order("scheduled_at", { ascending: true });

      if (error) {
        console.log(error);
        setCallbacksError("No se pudieron cargar los callbacks");
        setCallbacksLoading(false);
        return;
      }

      setCallbacks(data as CallbackWithClient[]);
      setCallbacksLoading(false);
    };

    loadCallbacks();
  }, [session]);

  // Crea un cliente y su primer callback en una misma acción.
  // El callback necesita el ID generado por Supabase al crear el cliente.
  const createClientndCallbck = async (
    newClient: NewClient,
    callback: {
      scheduled_at: string;
      notes?: string;
    }
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    const { data: clientData, error: clientError } = await supabase
      .from("clientes")
      .insert({
        ...newClient,
        user_id: user.id,
      })
      .select()
      .single();

    if (clientError) {
      console.log(clientError);
      return false;
    }

    const { data: callbackData, error: callbackError } = await supabase
      .from("callbacks")
      .insert({
        client_id: clientData.id,
        scheduled_at: new Date(callback.scheduled_at).toISOString(),
        notes: callback.notes || null,
        status: "pending",
        call_result: null,
        next_reminder_at: null,
      })
      .select()
      .single();

    if (callbackError) {
      console.log(callbackError);
      return false;
    }

    // Actualizamos el estado local para que la interfaz refleje
    // los nuevos registros sin tener que recargar toda la página.
    setClients((currentClients) => [
      ...currentClients,
      {
        ...clientData,
        apps: null,
      },
    ]);

    setCallbacks((currentCallbacks) => [
      ...currentCallbacks,
      {
        ...(callbackData as Callback),
        clientes: {
          id: clientData.id,
          name: clientData.name,
          phone: clientData.phone,
          source: clientData.source,
          apps: null,
        },
      },
    ]);

    return true;
  };

  // En lugar de eliminar físicamente al cliente, lo marcamos como inactivo.
  // Esto conserva su información en la base de datos.
  const deleteClient = async (client: Client) => {
    const { error } = await supabase
      .from("clientes")
      .update({ active: false })
      .eq("id", client.id);

    if (error) {
      console.log(error);
      return false;
    }

    setClients((currentClients) =>
      currentClients.filter(
        (currentClient) => currentClient.id !== client.id
      )
    );

    return true;
  };

  // Guarda temporalmente el cliente que se está editando
  // para pasarlo al formulario correspondiente.
  const startEditing = (client: Client) => {
    setEditingClient(client);
  };


  const selectClient = (client: ClientWithApp) => {
    setSelectedClient(client);
};
  // Actualiza únicamente los campos editables del cliente.
  // No modificamos user_id, id ni otros datos controlados por la base de datos.
  const updateClient = async (updatedClient: Client) => {
    const { error } = await supabase
      .from("clientes")
      .update({
        name: updatedClient.name,
        phone: updatedClient.phone,
        source: updatedClient.source,
        active: updatedClient.active,
      })
      .eq("id", updatedClient.id);

    if (error) {
      console.log(error);
      return false;
    }

    setClients((currentClients) =>
      currentClients.map((currentClient) =>
        currentClient.id === updatedClient.id
          ? {
              ...updatedClient,
              apps: currentClient.apps,
            }
          : currentClient
      )
    );

    return true;
  };


  // Maneja las diferentes acciones que pueden ocurrir al guardar un callback:
// finalizarlo, reagendarlo o posponer su recordatorio.
  const handleSaveCallback = async (
    callback: CallbackWithClient,
    notes: string,
    callResult:
      | "accepted"
      | "rescheduled"
      | "declined"
      | null,
    snoozeAt: string | null,
    rescheduleAt: string
  ): Promise<boolean> => {
    // Una respuesta aceptada o rechazada termina el callback actual.
    if (callResult === "accepted" || callResult === "declined") {
      const { error } = await supabase
        .from("callbacks")
        .update({
          status: "completed",
          call_result: callResult,
          next_reminder_at: null,
          notes: notes || null,
        })
        .eq("id", callback.id);

      if (error) {
        console.log(error);
        return false;
      }

      setCallbacks((currentCallbacks) =>
        currentCallbacks.map((currentCallback) =>
          currentCallback.id === callback.id
            ? {
                ...currentCallback,
                status: "completed",
                call_result: callResult,
                next_reminder_at: null,
                notes: notes || null,
              }
            : currentCallback
        )
      );

      return true;
    }

    // Rescheduler requiere cerrar el callback actual y crear uno nuevo
    // manteniendo la relación con el mismo cliente.
    if (callResult === "rescheduled" && rescheduleAt) {
      const { error: updateError } = await supabase
        .from("callbacks")
        .update({
          status: "completed",
          call_result: "rescheduled",
          next_reminder_at: null,
          notes: notes || null,
        })
        .eq("id", callback.id);

      if (updateError) {
        console.log(updateError);
        return false;
      }

      const {
        data: newCallback,
        error: insertError,
      } = await supabase
        .from("callbacks")
        .insert({
          client_id: callback.client_id,
          scheduled_at: new Date(rescheduleAt).toISOString(),
          status: "pending",
          notes: null,
          call_result: null,
          next_reminder_at: null,
        })
        .select(`
          *,
          clientes (
            id,
            name,
            phone,
            source,
            apps (
              id,
              name
            )
          )
        `)
        .single();

      if (insertError) {
        console.log(insertError);
        return false;
      }

      setCallbacks((currentCallbacks) => [
        ...currentCallbacks.map((currentCallback) =>
          currentCallback.id === callback.id
            ? {
                ...currentCallback,
                status: "completed" as const,
                call_result: "rescheduled" as const,
                next_reminder_at: null,
                notes: notes || null,
              }
            : currentCallback
        ),
        newCallback as CallbackWithClient,
      ]);

      return true;
    }

    // El snooze no crea otro callback.
    // Solo lo modifica cuándo debe volver a recordarse el callback actual.
    if (snoozeAt) {
      const { error } = await supabase
        .from("callbacks")
        .update({
          next_reminder_at: snoozeAt,
          notes: notes || null,
        })
        .eq("id", callback.id);

      if (error) {
        console.log(error);
        return false;
      }

      setCallbacks((currentCallbacks) =>
        currentCallbacks.map((currentCallback) =>
          currentCallback.id === callback.id
            ? {
                ...currentCallback,
                next_reminder_at: snoozeAt,
                notes: notes || null,
              }
            : currentCallback
        )
      );

      return true;
    }

    return false;
  };

  if (authLoading) {
    return <p>Loading...</p>;
  }

  if (!session) {
    return <Login />;
  }

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route
          path="/"
          element={<DashboardSummary callbacks={callbacks} />}
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
                  <p>Loading clients list...</p>
                ) : clientsError ? (
                  <p>{clientsError}</p>
                ) : clients.length === 0 ? (
                  <p>No clients found</p>
                ) : (
                  <ClientList
                    clients={clients}
                    onDeleteClient={deleteClient}
                    onEditClient={startEditing}
                    onSelectClient={selectClient}
                  />
                )}
                
                {selectedClient && (
                  
                    <ClientDetails
                        client={selectedClient}
                        callbacks={callbacks}
                        onClose={() => setSelectedClient(null)}
                    />
                    )}
              </div>
            </div>
          }
        />

        <Route
          path="/callbacks"
          element={
            <Callbacks
              callbacks={callbacks}
              callbacksLoading={callbacksLoading}
              callbacksError={callbacksError}
              handleSaveCallback={handleSaveCallback}
            />
          }
        />
      </Route>
    </Routes>
  );
}

export default App;