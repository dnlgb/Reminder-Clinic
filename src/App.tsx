import { useEffect, useState } from "react";

import MainLayout from "./layouts/MainLayout";
import "./styles/App.css";

import { Route, Routes } from "react-router-dom";

import ClientList from "./components/ClientList";
import ClientForm from "./components/ClientForm";
import DashboardSummary from "./components/DashboardSummary";
import Callbacks from "./pages/Callbacks";
import CallbacksForm from "./components/CallbacksForm";
import Login from "./components/Login";

import type {
  Client,
  Callback,
  NewCallback,
  NewClient,
  ClientWithApp,
  CallbackWithClient,
} from "./types";

import { supabase } from "./lib/supabase";

function App() {
  // =========================
  // AUTH
  // =========================

  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // =========================
  // CLIENTS
  // =========================

  const [clients, setClients] = useState<ClientWithApp[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [clientsError, setClientsError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [callbackClient, setCallbackClient] = useState<Client | null>(null);

  // =========================
  // CALLBACKS
  // =========================

  const [callbacks, setCallbacks] = useState<CallbackWithClient[]>([]);
  const [callbacksLoading, setCallbacksLoading] = useState(true);
  const [callbacksError, setCallbacksError] = useState<string | null>(null);

  // =========================
  // AUTH SESSION
  // =========================

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

  // =========================
  // LOAD CLIENTS
  // =========================

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

      const clientsWithApps = data as ClientWithApp[];

      setClients(clientsWithApps);
      setClientsLoading(false);
    };

    loadClients();
  }, [session]);

  // =========================
  // CREATE CLIENT + CALLBACK
  // =========================

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
      console.log("No authenticated user");
      return false;
    }

    // Crear cliente
    const { data: clientData, error: clientError } = await supabase
      .from("clientes")
      .insert({
        ...newClient,
        user_id: user.id,
      })
      .select()
      .single();

    if (clientError) {
      console.log("CLIENT ERROR:", clientError);
      return false;
    }

    // Crear primer callback
    const scheduledAt = new Date(
      callback.scheduled_at
    ).toISOString();

    const { data: callbackData, error: callbackError } =
      await supabase
        .from("callbacks")
        .insert({
          client_id: clientData.id,
          scheduled_at: scheduledAt,
          notes: callback.notes || null,
          status: "pending",
          call_result: null,
          next_reminder_at: null,
        })
        .select()
        .single();

    if (callbackError) {
      console.log("CALLBACK ERROR:", callbackError);
      return false;
    }

    // Actualizar clientes localmente
    setClients((currentClients) => [
      ...currentClients,
      {
        ...clientData,
        apps: null,
      },
    ]);

    // Actualizar callbacks localmente
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

  // =========================
  // DELETE CLIENT
  // =========================

  const deleteClient = async (clientToDelete: Client) => {
    const { error } = await supabase
      .from("clientes")
      .update({
        active: false,
      })
      .eq("id", clientToDelete.id);

    if (error) {
      console.log(error);
      return false;
    }

    setClients((currentClients) =>
      currentClients.filter(
        (currentClient) =>
          currentClient.id !== clientToDelete.id
      )
    );

    return true;
  };

  // =========================
  // EDIT CLIENT
  // =========================

  const startEditing = (client: Client) => {
    setEditingClient(client);
  };

  // =========================
  // CREATE CALLBACK FROM CLIENT
  // =========================

  const startCallback = (client: Client) => {
    setCallbackClient(client);
  };

  // =========================
  // UPDATE CLIENT
  // =========================

  const updateClient = async (updatedClient: Client) => {
    const { data, error } = await supabase
      .from("clientes")
      .update({
        name: updatedClient.name,
        phone: updatedClient.phone,
        source: updatedClient.source,
        active: updatedClient.active,
      })
      .eq("id", updatedClient.id)
      .select()
      .single();

    if (error) {
      console.log(error);
      return false;
    }

    setClients((currentClients) =>
      currentClients.map((currentClient) => {
        if (currentClient.id === updatedClient.id) {
          return {
            ...updatedClient,
            apps: currentClient.apps,
          };
        }

        return currentClient;
      })
    );

    return true;
  };

  // =========================
  // LOAD CALLBACKS
  // =========================

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
        .order("scheduled_at", {
          ascending: true,
        });

      if (error) {
        console.log(error);
        setCallbacksError(
          "No se pudieron cargar los callbacks"
        );
        setCallbacksLoading(false);
        return;
      }

      setCallbacks(data as CallbackWithClient[]);
      setCallbacksLoading(false);
    };

    loadCallbacks();
  }, [session]);

  // =========================
  // CANCEL CALLBACK
  // =========================

  const handleCancel = async (
    callbackCancel: Callback
  ) => {
    const { error } = await supabase
      .from("callbacks")
      .update({
        status: "cancelled",
        call_result: null,
      })
      .eq("id", callbackCancel.id);

    if (error) {
      console.log(error);
      return false;
    }

    setCallbacks((currentCallbacks) =>
      currentCallbacks.map((currentCallback) => {
        if (currentCallback.id === callbackCancel.id) {
          return {
            ...currentCallback,
            status: "cancelled",
            call_result: null,
          };
        }

        return currentCallback;
      })
    );

    return true;
  };

  // =========================
  // COMPLETE CALLBACK
  // =========================

  const handleCompleteCallback = async (
    callbackComplete: CallbackWithClient,
    callResult: "accepted" | "declined"
  ) => {
    const { error } = await supabase
      .from("callbacks")
      .update({
        status: "completed",
        call_result: callResult,
        next_reminder_at: null,
      })
      .eq("id", callbackComplete.id);

    if (error) {
      console.log(error);
      return false;
    }

    setCallbacks((currentCallbacks) =>
      currentCallbacks.map((currentCallback) => {
        if (currentCallback.id === callbackComplete.id) {
          return {
            ...currentCallback,
            status: "completed",
            call_result: callResult,
            next_reminder_at: null,
          };
        }

        return currentCallback;
      })
    );

    return true;
  };

  // =========================
  // RESCHEDULE CALLBACK
  // =========================

  const handleReschedule = async (
    callbackReschedule: CallbackWithClient,
    newScheduledAt: string
  ) => {
    const scheduledAt = new Date(
      newScheduledAt
    ).toISOString();

    // Completar callback anterior
    const { error } = await supabase
      .from("callbacks")
      .update({
        status: "completed",
        call_result: "rescheduled",
        next_reminder_at: null,
      })
      .eq("id", callbackReschedule.id);

    if (error) {
      console.log(error);
      return false;
    }

    // Crear nuevo callback
    const {
      data: newCallback,
      error: newCallbackError,
    } = await supabase
      .from("callbacks")
      .insert({
        scheduled_at: scheduledAt,
        status: "pending",
        call_result: null,
        next_reminder_at: null,
        client_id: callbackReschedule.client_id,
      })
      .select()
      .single();

    if (newCallbackError) {
      console.log(newCallbackError);
      return false;
    }

    setCallbacks((currentCallbacks) => [
      ...currentCallbacks.map((currentCallback) => {
        if (
          currentCallback.id === callbackReschedule.id
        ) {
          return {
            ...currentCallback,
            status: "completed" as const,
            call_result: "rescheduled" as const,
            next_reminder_at: null,
          };
        }

        return currentCallback;
      }),
      {
        ...(newCallback as Callback),
        clientes: callbackReschedule.clientes,
      },
    ]);

    return true;
  };

  // =========================
  // SNOOZE
  // =========================

  const handleSnooze = async (
    callbackSnooze: CallbackWithClient,
    minutes: number
  ) => {
    const reminderAt = new Date();

    reminderAt.setMinutes(
      reminderAt.getMinutes() + minutes
    );

    const reminderAtISO =
      reminderAt.toISOString();

    const { error } = await supabase
      .from("callbacks")
      .update({
        next_reminder_at: reminderAtISO,
      })
      .eq("id", callbackSnooze.id);

    if (error) {
      console.log("SNOOZE ERROR:", error);
      return false;
    }

    setCallbacks((currentCallbacks) =>
      currentCallbacks.map((currentCallback) => {
        if (currentCallback.id === callbackSnooze.id) {
          return {
            ...currentCallback,
            next_reminder_at: reminderAtISO,
          };
        }

        return currentCallback;
      })
    );

    return true;
  };

  // =========================
  // CUSTOM SNOOZE
  // =========================

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
        next_reminder_at: reminderAtISO,
      })
      .eq("id", callbackSnooze.id);

    if (error) {
      console.log(
        "CUSTOM SNOOZE ERROR:",
        error
      );
      return false;
    }

    setCallbacks((currentCallbacks) =>
      currentCallbacks.map((currentCallback) => {
        if (currentCallback.id === callbackSnooze.id) {
          return {
            ...currentCallback,
            next_reminder_at: reminderAtISO,
          };
        }

        return currentCallback;
      })
    );

    return true;
  };

  // =========================
  // ADD CALLBACK
  // =========================

  const addCallback = async (
    newCallback: NewCallback
  ) => {
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
        next_reminder_at: null,
      })
      .select()
      .single();

    if (error) {
      console.log(error);
      return false;
    }

    // Obtener información del cliente
    const {
      data: clientData,
      error: clientError,
    } = await supabase
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

    setCallbacks((currentCallbacks) => [
      ...currentCallbacks,
      {
        ...(data as Callback),
        clientes: {
          ...clientData,
          apps: clientData.apps[0] ?? null,
        },
      },
    ]);

    return true;
  };

  // =========================
  // SAVE CALLBACK NOTES
  // =========================

  const handleSaveCallbackNotes = async (
    callback: CallbackWithClient,
    notes: string
  ) => {
    const { error } = await supabase
      .from("callbacks")
      .update({
        notes: notes || null,
      })
      .eq("id", callback.id);

    if (error) {
      console.log(
        "SAVE NOTES ERROR:",
        error
      );
      return false;
    }

    setCallbacks((currentCallbacks) =>
      currentCallbacks.map((currentCallback) => {
        if (currentCallback.id === callback.id) {
          return {
            ...currentCallback,
            notes: notes || null,
          };
        }

        return currentCallback;
      })
    );

    return true;
  };

  // =========================
  // SAVE CALLBACK
  // =========================

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
    // -------------------------
    // ACCEPTED / DECLINED
    // -------------------------

    if (
      callResult === "accepted" ||
      callResult === "declined"
    ) {
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
        console.log(
          "SAVE CALLBACK ERROR:",
          error
        );
        return false;
      }

      setCallbacks((currentCallbacks) =>
        currentCallbacks.map((currentCallback) => {
          if (currentCallback.id === callback.id) {
            return {
              ...currentCallback,
              status: "completed",
              call_result: callResult,
              next_reminder_at: null,
              notes: notes || null,
            };
          }

          return currentCallback;
        })
      );

      return true;
    }

    // -------------------------
    // RESCHEDULE
    // -------------------------

    if (
      callResult === "rescheduled" &&
      rescheduleAt
    ) {
      // Completar callback actual
      const {
        error: updateError,
      } = await supabase
        .from("callbacks")
        .update({
          status: "completed",
          call_result: "rescheduled",
          next_reminder_at: null,
          notes: notes || null,
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
      const {
        data: newCallback,
        error: insertError,
      } = await supabase
        .from("callbacks")
        .insert({
          client_id: callback.client_id,
          scheduled_at: new Date(
            rescheduleAt
          ).toISOString(),
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

      setCallbacks((currentCallbacks) => [
        ...currentCallbacks.map((currentCallback) => {
          if (currentCallback.id === callback.id) {
            return {
              ...currentCallback,
              status: "completed" as const,
              call_result: "rescheduled" as const,
              next_reminder_at: null,
              notes: notes || null,
            };
          }

          return currentCallback;
        }),
        newCallback as CallbackWithClient,
      ]);

      return true;
    }

    // -------------------------
    // SNOOZE
    // -------------------------

    if (snoozeAt) {
      const { error } = await supabase
        .from("callbacks")
        .update({
          next_reminder_at: snoozeAt,
          notes: notes || null,
        })
        .eq("id", callback.id);

      if (error) {
        console.log(
          "SNOOZE CALLBACK ERROR:",
          error
        );
        return false;
      }

      setCallbacks((currentCallbacks) =>
        currentCallbacks.map((currentCallback) => {
          if (currentCallback.id === callback.id) {
            return {
              ...currentCallback,
              next_reminder_at: snoozeAt,
              notes: notes || null,
            };
          }

          return currentCallback;
        })
      );

      return true;
    }

    return false;
  };

  // =========================
  // AUTH RENDERING
  // =========================

  if (authLoading) {
    return <p>Cargando...</p>;
  }

  if (!session) {
    return <Login />;
  }

  // =========================
  // APP
  // =========================

  return (
    <>
      <Routes>
        <Route element={<MainLayout />}>
          {/* =========================
              DASHBOARD
          ========================= */}

          <Route
            path="/"
            element={
              <DashboardSummary
                callbacks={callbacks}
              />
            }
          />

          {/* =========================
              CLIENTS
          ========================= */}

          <Route
            path="/clients"
            element={
              <div className="clients-page">
                <div className="clients-form-column">
                  <ClientForm
                    onCreateClientndCallbck={
                      createClientndCallbck
                    }
                    editingClient={editingClient}
                    onUpdateClient={updateClient}
                  />
                </div>

                <div className="clients-list-column">
                  {clientsLoading ? (
                    <p>
                      Loading clients list...
                    </p>
                  ) : clientsError ? (
                    <p>{clientsError}</p>
                  ) : clients.length === 0 ? (
                    <p>No clients found</p>
                  ) : (
                    <ClientList
                      clients={clients}
                      onDeleteClient={
                        deleteClient
                      }
                      onEditClient={
                        startEditing
                      }
                      onCallbackClient={
                        startCallback
                      }
                    />
                  )}

                  {callbackClient && (
                    <CallbacksForm
                      client={callbackClient}
                      onAddCallback={
                        addCallback
                      }
                    />
                  )}
                </div>
              </div>
            }
          />

          {/* =========================
              CALLBACKS
          ========================= */}

          <Route
            path="/callbacks"
            element={
              <>
                <Callbacks
                  callbacks={callbacks}
                  callbacksLoading={
                    callbacksLoading
                  }
                  callbacksError={
                    callbacksError
                  }
                  handleCancel={
                    handleCancel
                  }
                  handleCompleteCallback={
                    handleCompleteCallback
                  }
                  handleReschedule={
                    handleReschedule
                  }
                  handleSnooze={
                    handleSnooze
                  }
                  handleCustomSnooze={
                    handleCustomSnooze
                  }
                  handleSaveCallbackNotes={
                    handleSaveCallbackNotes
                  }
                  handleSaveCallback={
                    handleSaveCallback
                  }
                />
              </>
            }
          />
        </Route>
      </Routes>
    </>
  );
}

export default App;