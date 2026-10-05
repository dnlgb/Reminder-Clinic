import { useCallback, useEffect, useRef, useState } from "react";
import type { Notification, NotificationType } from "../types";
import { supabase } from "../lib/supabase";
import { sileo } from "sileo";

type DueCallback = {
  id: string;
  scheduled_at: string;
  status: string;
  next_reminder_at: string | null;
  clientes: { name: string | null } | null;
};

const POLL_INTERVAL_MS = 30_000;
const TOAST_DURATION_MS = 4_000;

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const knownNotificationIds = useRef(new Set<string>());
  const hasInitialNotificationSnapshot = useRef(false);
  const toastQueue = useRef<Notification[]>([]);
  const toastActive = useRef(false);
  const toastTimeout = useRef<number | null>(null);

  const showNextToast = useCallback(() => {
    if (toastActive.current) return;
    const notification = toastQueue.current.shift();
    if (!notification) return;

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
      showNextToast();
    }, TOAST_DURATION_MS + 300);
  }, []);

  const loadNotifications = useCallback(async (isInitialSnapshot = false) => {
    if (!userId) {
      setNotifications([]);
      return;
    }
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("No se pudieron cargar las notificaciones", error);
      return;
    }
    const loadedNotifications = (data ?? []) as Notification[];

    if (isInitialSnapshot || !hasInitialNotificationSnapshot.current) {
      knownNotificationIds.current = new Set(loadedNotifications.map((item) => item.id));
      hasInitialNotificationSnapshot.current = true;
    } else {
      for (const notification of loadedNotifications) {
        if (knownNotificationIds.current.has(notification.id)) continue;
        // Mark seen before showing the toast so overlapping realtime and polling
        // fetches cannot display the same notification more than once.
        knownNotificationIds.current.add(notification.id);
        toastQueue.current.push(notification);
      }
      showNextToast();
    }

    setNotifications(loadedNotifications);
  }, [userId, showNextToast]);

  const markAsRead = useCallback(async (notificationId: string) => {
    const readAt = new Date().toISOString();
    const { error } = await supabase
      .from("notifications")
      .update({ read_at: readAt })
      .eq("id", notificationId)
      .is("read_at", null);
    if (error) {
      console.error("No se pudo marcar la notificación como leída", error);
      return false;
    }
    setNotifications((current) => current.map((item) =>
      item.id === notificationId ? { ...item, read_at: readAt } : item
    ));
    return true;
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return false;
    const readAt = new Date().toISOString();
    const { error } = await supabase
      .from("notifications")
      .update({ read_at: readAt })
      .eq("user_id", userId)
      .is("read_at", null);
    if (error) {
      console.error("No se pudieron marcar todas como leídas", error);
      return false;
    }
    setNotifications((current) => current.map((item) =>
      item.read_at ? item : { ...item, read_at: readAt }
    ));
    return true;
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      return;
    }

    let stopped = false;
    let running = false;
    knownNotificationIds.current = new Set();
    hasInitialNotificationSnapshot.current = false;
    toastQueue.current = [];
    toastActive.current = false;
    if (toastTimeout.current !== null) {
      window.clearTimeout(toastTimeout.current);
      toastTimeout.current = null;
    }

    const poll = async () => {
      if (running || stopped) return;
      running = true;
      const { data, error } = await supabase
        .from("callbacks")
        .select("id, scheduled_at, status, next_reminder_at, clientes(name)")
        .eq("status", "pending");

      if (!error && data) {
        const now = Date.now();
        const callbacks = data as unknown as DueCallback[];
        for (const callback of callbacks) {
          const clientName = callback.clientes?.name ?? "Client";
          const scheduledTime = new Date(callback.scheduled_at).getTime();

          if (callback.next_reminder_at) {
            const reminderTime = new Date(callback.next_reminder_at).getTime();
            if (Number.isFinite(reminderTime) && reminderTime <= now) {
              const isSnooze = reminderTime > scheduledTime;
              const type: NotificationType = isSnooze ? "snooze" : "reminder";
              const eventKey = `${type}:${callback.id}:${new Date(reminderTime).toISOString()}`;
              await supabase.from("notifications").upsert({
                user_id: userId,
                callback_id: callback.id,
                type,
                title: isSnooze ? "Snoozed callback is due" : "Callback reminder",
                message: `Follow up with ${clientName}.`,
                event_key: eventKey,
              }, { onConflict: "event_key", ignoreDuplicates: true });
            }
          }

          if (Number.isFinite(scheduledTime) && scheduledTime <= now) {
            const eventKey = `overdue:${callback.id}:${new Date(scheduledTime).toISOString()}`;
            await supabase.from("notifications").upsert({
              user_id: userId,
              callback_id: callback.id,
              type: "overdue",
              title: "Overdue callback",
              message: `${clientName}'s callback is still pending.`,
              event_key: eventKey,
            }, { onConflict: "event_key", ignoreDuplicates: true });
          }
        }
      } else if (error) {
        console.error("No se pudieron revisar los callbacks", error);
      }

      if (!stopped) await loadNotifications();
      running = false;
    };

    const initialize = async () => {
      // Existing history establishes the baseline and must not trigger toasts.
      await loadNotifications(true);
      if (!stopped) void poll();
    };

    void initialize();
    const interval = window.setInterval(() => void poll(), POLL_INTERVAL_MS);
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` }, () => {
        void loadNotifications();
      })
      .subscribe();

    return () => {
      stopped = true;
      window.clearInterval(interval);
      toastQueue.current = [];
      toastActive.current = false;
      if (toastTimeout.current !== null) {
        window.clearTimeout(toastTimeout.current);
        toastTimeout.current = null;
      }
      void supabase.removeChannel(channel);
    };
  }, [userId, loadNotifications]);

  const unreadCount = notifications.reduce((count, item) => count + (item.read_at ? 0 : 1), 0);
  return { notifications, unreadCount, markAsRead, markAllAsRead };
}
