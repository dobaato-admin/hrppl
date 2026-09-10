import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/rbac";

export type { AppRole };

const ROLE_REFRESH_EVENT = "auth:refresh-roles";

export interface AuthState {
  user: User | null;
  session: Session | null;
  roles: AppRole[];
  loading: boolean;
  rolesLoaded: boolean;
}

const initialState: AuthState = {
  user: null,
  session: null,
  roles: [],
  loading: true,
  rolesLoaded: false,
};

let authState: AuthState = initialState;
let initialized = false;
let roleRequestId = 0;
/**
 * Which user the roles currently in `authState` belong to.
 *
 * Tracked separately from `authState.user` because `onAuthStateChange` sets the
 * user *before* calling `refreshRoles`, so by then the two always agree and
 * cannot be used to tell a genuine account change from a revalidation.
 */
let rolesForUserId: string | null = null;
let roleRefreshHandler: (() => void) | null = null;
let focusHandler: (() => void) | null = null;
let visibilityHandler: (() => void) | null = null;
let unsubscribeAuth: (() => void) | null = null;
const listeners = new Set<(state: AuthState) => void>();

async function fetchRoles(userId: string): Promise<AppRole[]> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  if (error) {
    console.error("[useAuth] failed to load roles", error);
    return [];
  }

  return (data ?? []).map((row) => row.role as AppRole);
}

function emit() {
  for (const listener of listeners) listener(authState);
}

function setAuthState(next: Partial<AuthState>) {
  authState = { ...authState, ...next };
  emit();
}

async function refreshRoles(nextUserId?: string | null) {
  const requestId = ++roleRequestId;

  if (!nextUserId) {
    rolesForUserId = null;
    setAuthState({ roles: [], rolesLoaded: true, loading: false });
    return;
  }

  // ---------------------------------------------------------------------
  // A revalidation must not tear the page down.
  // ---------------------------------------------------------------------
  //
  // This used to open with an unconditional `setAuthState({ rolesLoaded: false })`.
  // `AdminGate` renders `if (!rolesLoaded) return <div>Loading…</div>`, so every
  // role refresh unmounted the whole page beneath it — and with it any open
  // modal and everything typed into it.
  //
  // That fires more often than it sounds. Supabase emits SIGNED_IN when it
  // recovers a session on tab focus, `requestRoleRefresh()` is called after
  // several flows, and each one silently discarded a half-filled form. It was
  // reported as "switching tabs loses my data", which is the symptom rather
  // than the cause.
  //
  // So: only blank the roles when we do not already hold a trustworthy answer
  // for THIS user. When we do, refetch quietly and swap the result in. The
  // window where stale roles are shown is one request long, and the roles are
  // a UI hint — `rbac.ts` is not the security boundary; RLS and the server-fn
  // guards are, and they re-check on every call.
  const haveRolesForThisUser = rolesForUserId === nextUserId && authState.rolesLoaded;
  if (!haveRolesForThisUser) setAuthState({ rolesLoaded: false });

  const nextRoles = await fetchRoles(nextUserId);
  if (requestId !== roleRequestId) return;
  rolesForUserId = nextUserId;
  setAuthState({ roles: nextRoles, rolesLoaded: true, loading: false });
}

function ensureAuthStore() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  const failOpen = window.setTimeout(() => {
    setAuthState({ loading: false, rolesLoaded: true });
  }, 4000);

  const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
    const previousUserId = authState.user?.id ?? null;
    const nextUserId = session?.user?.id ?? null;
    const shouldRefreshRoles =
      previousUserId !== nextUserId ||
      event === "SIGNED_IN" ||
      event === "USER_UPDATED" ||
      !authState.rolesLoaded;

    setAuthState({ session, user: session?.user ?? null });

    if (!nextUserId) {
      void refreshRoles(null);
      return;
    }

    if (shouldRefreshRoles) {
      window.setTimeout(() => {
        void refreshRoles(nextUserId);
      }, 0);
    } else {
      setAuthState({ loading: false });
    }
  });

  unsubscribeAuth = () => sub.subscription.unsubscribe();

  void supabase.auth.getSession().then(({ data }) => {
    setAuthState({ session: data.session, user: data.session?.user ?? null });
    void refreshRoles(data.session?.user?.id ?? null);
  }).finally(() => {
    window.clearTimeout(failOpen);
    if (!authState.rolesLoaded) {
      setAuthState({ loading: false });
    }
  });

  roleRefreshHandler = () => {
    void refreshRoles(authState.user?.id ?? null);
  };

  window.addEventListener(ROLE_REFRESH_EVENT, roleRefreshHandler);
}

export function requestRoleRefresh() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ROLE_REFRESH_EVENT));
  }
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>(authState);

  useEffect(() => {
    ensureAuthStore();
    setState(authState);
    const listener = (next: AuthState) => setState(next);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0 && typeof window !== "undefined") {
        if (roleRefreshHandler) window.removeEventListener(ROLE_REFRESH_EVENT, roleRefreshHandler);
        unsubscribeAuth?.();
        roleRefreshHandler = null;
        focusHandler = null;
        visibilityHandler = null;
        unsubscribeAuth = null;
        rolesForUserId = null;
        initialized = false;
      }
    };
  }, []);

  return state;
}
