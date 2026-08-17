import { CONNECTORS } from "./connectors";
import type { MoaRole, MoaState } from "./types";

/**
 * Authorisation layer.
 *
 * Every gate in the UI must call through here, and the SAME checks must be
 * re-run server-side once a real backend exists — hiding a control in the
 * client is presentation, not security.
 *
 * A role is a property of the authenticated account. Nothing a user types
 * (in chat or in a form) can grant it.
 */

export const ROLE_LABEL: Record<MoaRole, string> = {
  head: "Head",
  member: "Member",
  guest: "Guest",
};

/** The Head is the account that owns this MOA instance. */
export function isHead(state: MoaState): boolean {
  return state.user.role === "head" && state.user.id === state.constitution.headUserId;
}

export interface AuthzResult {
  allowed: boolean;
  reason?: string;
}

const deny = (reason: string): AuthzResult => ({ allowed: false, reason });

/** Head Command / Constitution is restricted to the authenticated Head. */
export function canAccessHeadCommand(state: MoaState): AuthzResult {
  if (!isHead(state)) return deny("Restricted to the Head account of this MOA instance.");
  return { allowed: true };
}

export function canEditConstitution(state: MoaState): AuthzResult {
  return canAccessHeadCommand(state);
}

/** Connector management (authorising credentials) is a Head-level action. */
export function canManageConnector(state: MoaState): AuthzResult {
  if (!isHead(state)) return deny("Only the Head can authorise or revoke connectors.");
  return { allowed: true };
}

/**
 * Can this user invoke a specific connector tool right now?
 * Checks, in order: tool exists → role → permission granted → connector
 * enabled → real credentials present.
 */
export function canInvokeTool(state: MoaState, toolId: string): AuthzResult {
  const connector = CONNECTORS.find((c) => c.tools.some((t) => t.id === toolId));
  const tool = connector?.tools.find((t) => t.id === toolId);
  if (!connector || !tool) return deny("Unknown tool.");

  if (!tool.roles.includes(state.user.role))
    return deny(`Requires the ${tool.roles.map((r) => ROLE_LABEL[r]).join(" or ")} role.`);

  const permission = state.permissions.find((p) => p.id === tool.permission);
  if (permission && !permission.granted) return deny(`Permission "${permission.label}" is not granted.`);

  const runtime = state.connectors.find((c) => c.id === connector.id);
  if (!runtime || !runtime.enabled) return deny(`${connector.name} is disabled.`);
  if (!runtime.credentialsPresent || runtime.status !== "connected")
    return deny(`${connector.name} is not connected.`);

  return { allowed: true };
}

/** Honest summary used by capability surfaces so nothing claims to work. */
export function connectorReadiness(state: MoaState, connectorId: string) {
  const definition = CONNECTORS.find((c) => c.id === connectorId);
  const runtime = state.connectors.find((c) => c.id === connectorId);
  return {
    definition,
    runtime,
    ready: Boolean(runtime?.enabled && runtime.credentialsPresent && runtime.status === "connected"),
  };
}
