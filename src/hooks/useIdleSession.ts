import { useCallback, useEffect, useRef, useState } from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import {
  clearExpiredSessionToken,
  getExpiredSessionStorageKey,
  getLastActivityStorageKey,
  INACTIVITY_LIMIT_MS,
  readExpiredSessionToken,
  readLastActivity,
  writeExpiredSessionToken,
  writeLastActivity,
} from "../lib/sessionInactivity";

export function useIdleSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const currentSession = useRef<Session | null>(null);

  const expireSession = useCallback((expiredSession: Session) => {
    const { user, access_token: token } = expiredSession;
    if (readExpiredSessionToken(user.id) !== token) {
      writeExpiredSessionToken(user.id, token);
    }
    currentSession.current = null;
    setSession(null);
    setAuthLoading(true);

    void (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (
          data.session?.user.id === user.id &&
          data.session.access_token === token &&
          readExpiredSessionToken(user.id) === token
        ) {
          await supabase.auth.signOut({ scope: "local" });
        }
      } finally {
        if (readExpiredSessionToken(user.id) === token) setAuthLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    let active = true;

    const handleAuthState = (event: AuthChangeEvent, nextSession: Session | null) => {
      if (!active) return;

      if (!nextSession) {
        const userId = currentSession.current?.user.id;
        currentSession.current = null;
        if (userId && !readExpiredSessionToken(userId)) {
          window.localStorage.removeItem(getLastActivityStorageKey(userId));
        }
        setSession(null);
        setAuthLoading(false);
        return;
      }

      const userId = nextSession.user.id;
      const expiredToken = readExpiredSessionToken(userId);
      if (expiredToken) {
        if (event === "SIGNED_IN" && expiredToken !== nextSession.access_token) {
          clearExpiredSessionToken(userId);
        } else {
          if (event === "TOKEN_REFRESHED" && expiredToken !== nextSession.access_token) {
            writeExpiredSessionToken(userId, nextSession.access_token);
          }
          expireSession(nextSession);
          return;
        }
      }

      const previousSession = currentSession.current;
      const newSignIn = event === "SIGNED_IN" && (
        !previousSession ||
        previousSession.user.id !== userId ||
        previousSession.access_token !== nextSession.access_token
      );
      let lastActivity = readLastActivity(userId);

      if (newSignIn || lastActivity === null) {
        if (!newSignIn && event !== "INITIAL_SESSION") {
          expireSession(nextSession);
          return;
        }
        lastActivity = Date.now();
        writeLastActivity(userId, lastActivity);
      }

      if (Date.now() - lastActivity >= INACTIVITY_LIMIT_MS) {
        expireSession(nextSession);
        return;
      }

      currentSession.current = nextSession;
      setSession(nextSession);
      setAuthLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthState);
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [expireSession]);

  useEffect(() => {
    if (!session) return;

    const { user } = session;
    let timer: number | undefined;
    let lastPointerMoveWrite = 0;
    const controller = new AbortController();
    const { signal } = controller;
    const activityKey = getLastActivityStorageKey(user.id);
    const expiredKey = getExpiredSessionStorageKey(user.id);

    const expireCurrentSession = () => {
      const current = currentSession.current;
      if (current?.user.id === user.id) expireSession(current);
    };

    const check = () => {
      if (timer !== undefined) window.clearTimeout(timer);
      if (currentSession.current?.user.id !== user.id) return;
      if (readExpiredSessionToken(user.id) === currentSession.current.access_token) {
        expireCurrentSession();
        return;
      }

      const lastActivity = readLastActivity(user.id);
      if (lastActivity === null || Date.now() - lastActivity >= INACTIVITY_LIMIT_MS) {
        expireCurrentSession();
      } else {
        timer = window.setTimeout(check, INACTIVITY_LIMIT_MS - (Date.now() - lastActivity));
      }
    };

    const recordActivity = () => {
      if (currentSession.current?.access_token !== session.access_token) return;
      const lastActivity = readLastActivity(user.id);
      const now = Date.now();
      if (lastActivity === null || now - lastActivity >= INACTIVITY_LIMIT_MS) {
        expireCurrentSession();
        return;
      }
      writeLastActivity(user.id, now);
      check();
    };

    const recordPointerMove = () => {
      const now = Date.now();
      if (now - lastPointerMoveWrite < 500) return;
      lastPointerMoveWrite = now;
      recordActivity();
    };

    const checkOnStorage = (event: StorageEvent) => {
      if (event.key !== activityKey && event.key !== expiredKey) return;
      check();
    };
    const checkOnReturn = () => check();

    check();
    window.addEventListener("pointermove", recordPointerMove, { passive: true, signal });
    window.addEventListener("pointerdown", recordActivity, { passive: true, signal });
    window.addEventListener("keydown", recordActivity, { signal });
    window.addEventListener("touchstart", recordActivity, { passive: true, signal });
    window.addEventListener("wheel", recordActivity, { passive: true, signal });
    window.addEventListener("focus", checkOnReturn, { signal });
    window.addEventListener("pageshow", checkOnReturn, { signal });
    window.addEventListener("storage", checkOnStorage, { signal });
    document.addEventListener("visibilitychange", checkOnReturn, { signal });

    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
      controller.abort();
    };
  }, [session, expireSession]);

  return { session, authLoading };
}
