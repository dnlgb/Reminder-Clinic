import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Notification, NotificationType } from "../types";
import { supabase } from "../lib/supabase";
import { sileo } from "sileo";
import notificationSoundUrl from "../assets/esthetix.mp3";

type DueCallback = {
  id: string;
  scheduled_at: string;
  status: string;
  next_reminder_at: string | null;
  clientes: { name: string | null } | null;
};

type UserNotificationSnapshot = {
  userId: string | undefined;
  items: Notification[];
};

const POLL_INTERVAL_MS = 30_000;
const TOAST_DURATION_MS = 4_000;

export function useNotifications(userId: string | undefined) {
  const [notificationSnapshot, setNotificationSnapshot] = useState<UserNotificationSnapshot>({
    userId,
    items: [],
  });
  const sessionGeneration = useRef(0);
  const knownNotificationIds = useRef(new Set<string>());
  const hasInitialNotificationSnapshot = useRef(false);
  const toastQueue = useRef<Notification[]>([]);
  const toastActive = useRef(false);
  const toastTimeout = useRef<number | null>(null);
  const notificationAudio = useRef<HTMLAudioElement | null>(null);
  const pendingNotificationSound = useRef(false);
  const showNextToastRef = useRef<() => void>(() => {});

  useLayoutEffect(() => {
    const generation = ++sessionGeneration.current;
    return () => {
      sessionGeneration.current = generation + 1;
    };
  }, [userId]);

  const showNextToast = useCallback(() => {
    // Keep queued alerts until the page is visible so they can be shown on return.
    if (toastActive.current || document.visibilityState !== "visible") return;
    const notification = toastQueue.current.shift();
    if (!notification) return;

    if (pendingNotificationSound.current) {
      pendingNotificationSound.current = false;
      const audio = notificationAudio.current;
      if (audio) {
        try {
          audio.currentTime = 0;
          void audio.play().catch((error: unknown) => {
            if (error instanceof DOMException && error.name === "NotAllowedError") {
              console.info("El navegador bloqueó la reproducción automática del sonido.");
              return;
            }
            console.error("No se pudo reproducir el sonido de notificación", error);
          });
        } catch (error) {
          console.error("No se pudo reproducir el sonido de notificación", error);
        }
      }
    }

    toastActive.current = true;
    sileo.show({
      type: "info",
      title: notification.title,
      description: notification.message,
      duration: TOAST_DURATION_MS,
      position: "top-right",
      roundness: 14,
    });
    // Sileo uses one default toast ID; queue distinct notifications so each
    // gets its own full, automatically dismissed display.
    toastTimeout.current = window.setTimeout(() => {
      toastActive.current = false;
      toastTimeout.current = null;
      showNextToastRef.current();
    }, TOAST_DURATION_MS + 300);
  }, []);

  useEffect(() => {
    const audio = new Audio(notificationSoundUrl);
    audio.preload = "auto";
    notificationAudio.current = audio;
    showNextToastRef.current = showNextToast;

    return () => {
      audio.pause();
      notificationAudio.current = null;
    };
  }, [showNextToast]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!userId) return false;
    const generation = sessionGeneration.current;
    const readAt = new Date().toISOString();
    const { error } = await supabase
      .from("notifications")
      .update({ read_at: readAt })
      .eq("id", notificationId)
      .eq("user_id", userId)
      .is("read_at", null);
    if (generation !== sessionGeneration.current) return false;
    if (error) {
      console.error("No se pudo marcar la notificación como leída", error);
      return false;
    }
    setNotificationSnapshot((current) => generation === sessionGeneration.current && current.userId === userId
      ? {
          ...current,
          items: current.items.map((item) => item.id === notificationId ? { ...item, read_at: readAt } : item),
        }
      : current
    );
    return true;
  }, [userId]);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return false;
    const generation = sessionGeneration.current;
    const readAt = new Date().toISOString();
    const { error } = await supabase
      .from("notifications")
      .update({ read_at: readAt })
      .eq("user_id", userId)
      .is("read_at", null);
    if (generation !== sessionGeneration.current) return false;
    if (error) {
      console.error("No se pudieron marcar todas como leídas", error);
      return false;
    }
    setNotificationSnapshot((current) => generation === sessionGeneration.current && current.userId === userId
      ? {
          ...current,
          items: current.items.map((item) => item.read_at ? item : { ...item, read_at: readAt }),
        }
      : current
    );
    return true;
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const generation = sessionGeneration.current;
    let stopped = false;
    let running = false;
    const isCurrentSession = () => !stopped && generation === sessionGeneration.current;
    knownNotificationIds.current = new Set();
    hasInitialNotificationSnapshot.current = false;
    toastQueue.current = [];
    toastActive.current = false;
    pendingNotificationSound.current = false;
    if (toastTimeout.current !== null) {
      window.clearTimeout(toastTimeout.current);
      toastTimeout.current = null;
    }

    const loadNotifications = async (isInitialSnapshot = false) => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (!isCurrentSession()) return;
      if (error) {
        console.error("No se pudieron cargar las notificaciones", error);
        return;
      }
      const loadedNotifications = (data ?? []) as Notification[];

      if (isInitialSnapshot || !hasInitialNotificationSnapshot.current) {
        knownNotificationIds.current = new Set(loadedNotifications.map((item) => item.id));
        hasInitialNotificationSnapshot.current = true;
      } else {
        let receivedNewNotifications = false;
        for (const notification of loadedNotifications) {
          if (knownNotificationIds.current.has(notification.id)) continue;
          // Mark seen before showing the toast so overlapping realtime and polling
          // fetches cannot display the same notification more than once.
          knownNotificationIds.current.add(notification.id);
          toastQueue.current.push(notification);
          receivedNewNotifications = true;
        }

        if (receivedNewNotifications) {
          pendingNotificationSound.current = true;
        }
        showNextToast();
      }

      setNotificationSnapshot((current) => isCurrentSession()
        ? { userId, items: loadedNotifications }
        : current
      );
    };

    const poll = async () => {
      if (running || !isCurrentSession()) return;
      running = true;
      try {
        const { data, error } = await supabase
          .from("callbacks")
          .select("id, scheduled_at, status, next_reminder_at, clientes(name)")
          .eq("status", "pending");

        if (!isCurrentSession()) return;
        if (error) {
          console.error("No se pudieron revisar los callbacks", error);
        } else if (data) {
          const now = Date.now();
          const callbacks = data as unknown as DueCallback[];
          for (const callback of callbacks) {
            if (!isCurrentSession()) break;
            const clientName = callback.clientes?.name ?? "Client";
            const scheduledTime = new Date(callback.scheduled_at).getTime();

            if (callback.next_reminder_at) {
              const snoozeTime = new Date(callback.next_reminder_at).getTime();
              if (Number.isFinite(snoozeTime) && snoozeTime <= now) {
                const type: NotificationType = "snooze";
                const eventKey = `${type}:${callback.id}:${new Date(snoozeTime).toISOString()}`;
                const { error: notificationError } = await supabase.from("notifications").upsert({
                  user_id: userId,
                  callback_id: callback.id,
                  type,
                  title: "Snoozed callback is due",
                  message: `Follow up with ${clientName}.`,
                  event_key: eventKey,
                }, { onConflict: "event_key", ignoreDuplicates: true });
                if (!isCurrentSession()) break;
                if (notificationError) {
                  console.error("No se pudo guardar el recordatorio", notificationError);
                }
              }
            }

            if (Number.isFinite(scheduledTime) && scheduledTime <= now) {
              const eventKey = `overdue:${callback.id}:${new Date(scheduledTime).toISOString()}`;
              const { error: notificationError } = await supabase.from("notifications").upsert({
                user_id: userId,
                callback_id: callback.id,
                type: "overdue",
                title: "Overdue callback",
                message: `${clientName}'s callback is still pending.`,
                event_key: eventKey,
              }, { onConflict: "event_key", ignoreDuplicates: true });
              if (!isCurrentSession()) break;
              if (notificationError) {
                console.error("No se pudo guardar el aviso de callback vencido", notificationError);
              }
            }
          }
        }

        if (isCurrentSession()) await loadNotifications();
      } catch (error) {
        console.error("No se pudieron procesar las notificaciones", error);
      } finally {
        running = false;
      }
    };

    const initialize = async () => {
      // Existing history establishes the baseline and must not trigger toasts.
      await loadNotifications(true);
      if (isCurrentSession()) void poll();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      if (!isCurrentSession()) return;
      showNextToast();
      void poll();
    };

    void initialize();
    const interval = window.setInterval(() => void poll(), POLL_INTERVAL_MS);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` }, () => {
        if (isCurrentSession() && hasInitialNotificationSnapshot.current) void loadNotifications();
      })
      .subscribe((status, error) => {
        if (!isCurrentSession()) return;
        if (status === "SUBSCRIBED") {
          if (hasInitialNotificationSnapshot.current) void poll();
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.error("Se interrumpió la suscripción de notificaciones", status, error);
        }
      });

    return () => {
      stopped = true;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      toastQueue.current = [];
      toastActive.current = false;
      pendingNotificationSound.current = false;
      if (toastTimeout.current !== null) {
        window.clearTimeout(toastTimeout.current);
        toastTimeout.current = null;
      }
      void supabase.removeChannel(channel);
    };
  }, [userId, showNextToast]);

  const currentNotifications = notificationSnapshot.userId === userId ? notificationSnapshot.items : [];
  const unreadCount = currentNotifications.reduce((count, item) => count + (item.read_at ? 0 : 1), 0);
  return { notifications: currentNotifications, unreadCount, markAsRead, markAllAsRead };
}
