import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createDefaultState } from "./defaults";
import type { MoaState, OrbState } from "./types";

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
      user: { ...base.user, ...parsed.user },
      identity: { ...base.identity, ...parsed.identity },
      appearance: { ...base.appearance, ...parsed.appearance },
      personality: { ...base.personality, ...parsed.personality },
      model: { ...base.model, ...parsed.model },
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
}

const MoaContext = createContext<MoaContextValue | null>(null);

export function MoaProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MoaState>(() => createDefaultState());
  const [hydrated, setHydrated] = useState(false);
  const [orbState, setOrbState] = useState<OrbState>("idle");
  const [online, setOnline] = useState(true);

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

  const value = useMemo<MoaContextValue>(
    () => ({ state, hydrated, update, reset, orbState, setOrbState, online }),
    [state, hydrated, update, reset, orbState, online],
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
