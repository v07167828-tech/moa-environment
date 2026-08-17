import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createDefaultState } from "./defaults";
import type { ActivationPhase, MoaState, OrbState } from "./types";

/**
 * Prototype persistence layer.
 *
 * Everything is namespaced per user id so no two users share state on one
 * device. This module is the ONLY place that touches storage - swapping it for
 * a server-backed repository later should not require touching any UI.
 */
const STORAGE_PREFIX = "moa:v1:";
const CURRENT_USER_KEY = "moa:v1:current-user";

function storageKey(userId: string) {
  return `${STORAGE_PREFIX}${userId}`;
}

function loadState(): MoaState {
  const base = createDefaultState();
  if (typeof window === "undefined") return base;
  try {
    const userId = window.localStorage.getItem(CURRENT_USER_KEY) ?? base.user.id;
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<MoaState>;
    return {
      ...base,
      ...parsed,
      // role is never taken from stored/user-supplied data blindly; a real
      // backend must assert it from the authenticated session.
      user: { ...base.user, ...parsed.user, role: parsed.user?.role ?? base.user.role },
      identity: { ...base.identity, ...parsed.identity },
      appearance: { ...base.appearance, ...parsed.appearance },
      personality: { ...base.personality, ...parsed.personality },
      model: { ...base.model, ...parsed.model },
      // Newer schema slices: fall back to defaults so older saved state loads.
      chatProjects: parsed.chatProjects ?? base.chatProjects,
      connectors: base.connectors.map(
        (c) => parsed.connectors?.find((p) => p.id === c.id) ?? c,
      ),
      constitution: { ...base.constitution, ...parsed.constitution },
      location: { ...base.location, ...parsed.location },
    };
  } catch {
    return base;
  }
}

interface MoaContextValue {
  state: MoaState;
  hydrated: boolean;
  update: (fn: (draft: MoaState) => MoaState) => void;
  reset: () => void;
  orbState: OrbState;
  setOrbState: (s: OrbState) => void;
  online: boolean;
  /** Session-only. MOA always boots dormant; never persisted. */
  active: boolean;
  phase: ActivationPhase;
  toggleActive: () => void;
  /** Explicit, user-triggered geolocation request. Never called implicitly. */
  requestLocation: () => Promise<void>;
  setLocationSharing: (on: boolean) => void;
}

const MoaContext = createContext<MoaContextValue | null>(null);

export function MoaProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MoaState>(() => createDefaultState());
  const [hydrated, setHydrated] = useState(false);
  const [orbState, setOrbState] = useState<OrbState>("idle");
  const [online, setOnline] = useState(true);
  // Activation is deliberately NOT persisted: MOA is dormant on every entry.
  const [phase, setPhase] = useState<ActivationPhase>("dormant");
  const watchRef = useRef<number | null>(null);

  const active = phase === "active" || phase === "emerging";

  const toggleActive = useCallback(() => {
    setPhase((p) => {
      if (p === "dormant") {
        window.setTimeout(() => setPhase((cur) => (cur === "emerging" ? "active" : cur)), 900);
        return "emerging";
      }
      if (p === "active" || p === "emerging") {
        window.setTimeout(() => setPhase((cur) => (cur === "absorbing" ? "dormant" : cur)), 700);
        return "absorbing";
      }
      return p;
    });
  }, []);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(CURRENT_USER_KEY, state.user.id);
      window.localStorage.setItem(storageKey(state.user.id), JSON.stringify(state));
    } catch {
      /* quota or private mode - prototype continues in memory */
    }
  }, [state, hydrated]);

  const update = useCallback((fn: (draft: MoaState) => MoaState) => {
    setState((prev) => fn(structuredClone(prev)));
  }, []);

  const reset = useCallback(() => {
    const fresh = createDefaultState();
    setState(fresh);
  }, []);

  const setLocationSharing = useCallback(
    (on: boolean) => {
      update((s) => {
        s.location.sharing = on;
        if (!on) {
          s.location.last = null;
          s.location.shareWithPeople = false;
        }
        return s;
      });
      if (!on && watchRef.current !== null) {
        navigator.geolocation?.clearWatch(watchRef.current);
        watchRef.current = null;
      }
    },
    [update],
  );

  const requestLocation = useCallback(async () => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      update((s) => {
        s.location.permission = "unsupported";
        return s;
      });
      return;
    }
    await new Promise<void>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          update((s) => {
            s.location.permission = "granted";
            s.location.sharing = true;
            s.location.last = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
              at: Date.now(),
            };
            return s;
          });
          resolve();
        },
        () => {
          update((s) => {
            s.location.permission = "denied";
            return s;
          });
          resolve();
        },
        { enableHighAccuracy: true, timeout: 10_000 },
      );
    });
  }, [update]);

  // Live updates only while the user keeps sharing switched on.
  useEffect(() => {
    if (!hydrated) return;
    if (!state.location.sharing || typeof navigator === "undefined" || !navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (pos) =>
        update((s) => {
          s.location.last = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            at: Date.now(),
          };
          return s;
        }),
      () => undefined,
      { enableHighAccuracy: true, maximumAge: 15_000 },
    );
    watchRef.current = id;
    return () => {
      navigator.geolocation.clearWatch(id);
      watchRef.current = null;
    };
  }, [hydrated, state.location.sharing, update]);

  const value = useMemo<MoaContextValue>(
    () => ({
      state,
      hydrated,
      update,
      reset,
      orbState,
      setOrbState,
      online,
      active,
      phase,
      toggleActive,
      requestLocation,
      setLocationSharing,
    }),
    [
      state,
      hydrated,
      update,
      reset,
      orbState,
      online,
      active,
      phase,
      toggleActive,
      requestLocation,
      setLocationSharing,
    ],
  );

  return <MoaContext.Provider value={value}>{children}</MoaContext.Provider>;
}

export function useMoa() {
  const ctx = useContext(MoaContext);
  if (!ctx) throw new Error("useMoa must be used inside <MoaProvider>");
  return ctx;
}

export const uid = (prefix = "id") =>
  `${prefix}-${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;
