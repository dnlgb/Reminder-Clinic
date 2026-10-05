import { useEffect, useLayoutEffect, useState } from "react";

import MainLayout from "./layouts/MainLayout";
import "./styles/App.css";

import { Form, Route, Routes } from "react-router-dom";
import { Toaster } from "sileo";
import "sileo/styles.css";

import ClientList from "./components/ClientList";
import ClientForm from "./components/ClientForm";
import DashboardSummary from "./components/DashboardSummary";
import Callbacks from "./pages/Callbacks";
import Login from "./components/Login";
import ClientDetails from "./components/ClientDetails";
import { useNotifications } from "./hooks/useNotifications";

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

  const [editingClient, setEditingClient] = useState<{
    userId: string
    client: Client
    callback: CallbackWithClient | null
} | null>(null)
  

  const [callbacks, setCallbacks] = useState<CallbackWithClient[]>([]);
  const [callbacksLoading, setCallbacksLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<ClientWithApp | null>(null);
  const [callbacksError, setCallbacksError] = useState<string | null>(null);
  const userId = session?.user?.id as string | undefined;
  const editingClientForUser = editingClient?.userId === userId
    ? editingClient
    : null;
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications(userId);

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

  // Discard client-specific UI state before the next session is painted.
  useLayoutEffect(() => {
    setEditingClient(null);
    setSelectedClient(null);
    setClients([]);
    setCallbacks([]);
    setClientsError(null);
    setCallbacksError(null);
  }, [userId]);

  // Carga únicamente los clientes cuando existe una sesión activa.
  // RLS se encarga de limitar los resultados al usuario autenticado.
  useEffect(() => {
    if (!userId) {
      setClients([]);
      setClientsLoading(false);
      return;
    }

    let active = true;
    const loadClients = async () => {
      setClientsLoading(true);
      setClientsError(null);

      const { data, error } = await supabase
        .from("clientes")
        .select("*, apps(id, name)")
        .eq("active", true);

      if (error) {
        console.log(error);
        if (active) {
          setClientsError("No se pudieron cargar los clientes");
          setClientsLoading(false);
        }
        return;
      }

      if (active) {
        setClients(data as ClientWithApp[]);
        setClientsLoading(false);
      }
    };

    loadClients();
    return () => {
      active = false;
    };
  }, [userId]);

  // Carga los callbacks asociados a los clientes del usuario.
  // La relación con clientes y apps permite mostrar toda la información
  // necesaria en la interfaz sin hacer consultas separadas por callback.
  useEffect(() => {
    if (!userId) {
      setCallbacks([]);
      setCallbacksLoading(false);
      return;
    }

    let active = true;
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
        if (active) {
          setCallbacksError("No se pudieron cargar los callbacks");
          setCallbacksLoading(false);
        }
        return;
      }

      if (active) {
        setCallbacks(data as CallbackWithClient[]);
        setCallbacksLoading(false);
      }
    };

    loadCallbacks();
    return () => {
      active = false;
    };
  }, [userId]);

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
      .select(`
        *,
        apps (
            id,
            name
        )
    `)
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
      ...currentClients,{
          ...clientData,
        apps: clientData.apps ?? null,
    }]);

    setCallbacks((currentCallbacks) => [
      ...currentCallbacks,
      {
        ...(callbackData as Callback),
        clientes: {
          id: clientData.id,
          name: clientData.name,
          phone: clientData.phone,
          source: clientData.source,
          apps: clientData.apps,
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

//ordenamos el cb de client por fecha para tomar el 1ero y edit
  const startEditing = (client: Client) => {
    const clientCallbacks = callbacks
        .filter((callback) => callback.client_id === client.id)
        .filter((callback) => callback.status !== "completed")
        .sort(
            (a, b) =>
                new Date(a.scheduled_at).getTime() -
                new Date(b.scheduled_at).getTime()
        )

    setEditingClient({
        userId: userId ?? "",
        client,
        callback: clientCallbacks[0] ?? null
    })
  };

  const cancelEditing = () => {
    setEditingClient(null);
  };


  const selectClient = (client: ClientWithApp) => {
    setSelectedClient(client);
};
  // Actualiza únicamente los campos editables del cliente.
  // No modificamos user_id, id ni otros datos controlados por la base de datos.
  const updateClient = async (updatedClient: {
    client: Client
    callback: {
        id: string
        scheduled_at: string
        notes: string | null
    } | null
}) => {
    const { error } = await supabase
        .from("clientes")
        .update({
            name: updatedClient.client.name,
            phone: updatedClient.client.phone,
            source: updatedClient.client.source,
            active: updatedClient.client.active,
        })
        .eq("id", updatedClient.client.id)

    if (error) {
        console.log(error)
        return false
    }

    if (updatedClient.callback) {
        const { error: callbackError } = await supabase
            .from("callbacks")
            .update({
                scheduled_at: new Date(
                    updatedClient.callback.scheduled_at
                ).toISOString(),
                notes: updatedClient.callback.notes,
            })
            .eq("id", updatedClient.callback.id)

        if (callbackError) {
            console.log(callbackError)
            return false
        }
    }

    setClients((currentClients) =>
        currentClients.map((currentClient) =>
            currentClient.id === updatedClient.client.id
                ? {
                    ...updatedClient.client,
                    apps: currentClient.apps,
                }
                : currentClient
        )
    )

    setCallbacks((currentCallbacks) =>
        currentCallbacks.map((currentCallback) =>
            updatedClient.callback &&
            currentCallback.id === updatedClient.callback.id
                ? {
                    ...currentCallback,
                    scheduled_at: new Date(
                        updatedClient.callback.scheduled_at
                    ).toISOString(),
                    notes: updatedClient.callback.notes,
                }
                : currentCallback
        )
    )

    return true
}
  
  const deleteCallback = async (callback: CallbackWithClient) => {
        const {error} = await supabase
          .from("callbacks")
          .delete()
          .eq("id", callback.id)

        if(error) {
          console.log(error)
          return false
        }

        setCallbacks((currentCallbacks) =>
          currentCallbacks.filter(
            (currentCallback) => currentCallback.id !== callback.id
        )
    )

    return true
  }


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
    <>
    <Toaster position="top-right" offset={16} theme="light" />
    <Routes>
      <Route element={<MainLayout />}>
        <Route
          path="/"
          element={
            <DashboardSummary
              callbacks={callbacks}
              notifications={notifications}
              unreadCount={unreadCount}
              markAsRead={markAsRead}
              markAllAsRead={markAllAsRead}
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
                  key={userId ?? "signed-out"}
                  editingClient={editingClientForUser}
                  onUpdateClient={updateClient}
                  onCancelEditing={cancelEditing}
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
                    key={userId ?? "signed-out"}
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
              deleteCallback={deleteCallback}
              handleSaveCallback={handleSaveCallback}
            />
          }
        />
      </Route>
    </Routes>
    </>
  );
}

export default App;
