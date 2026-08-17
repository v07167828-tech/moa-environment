export type CapabilityStatus =
  | "IMPLEMENTED"
  | "CONFIGURED"
  | "NOT CONFIGURED"
  | "UNAVAILABLE"
  | "PLANNED"
  | "PROTOTYPE";

export type OrbState =
  | "dormant"
  | "idle"
  | "listening"
  | "thinking"
  | "speaking"
  | "error"
  | "offline";

export type ActivationPhase = "dormant" | "emerging" | "active" | "absorbing";

export interface LocationState {
  /** User-controlled: nothing is read from the device unless this is true. */
  sharing: boolean;
  permission: "unknown" | "prompt" | "granted" | "denied" | "unsupported";
  last: { lat: number; lng: number; accuracy: number; at: number } | null;
  /** Opt-in visibility of your live position to other MOA users. */
  shareWithPeople: boolean;
}

export type MessageRole = "user" | "moa" | "tool" | "system";

export interface Attachment {
  id: string;
  name: string;
  size: number;
  kind: "image" | "pdf" | "document" | "spreadsheet" | "video" | "audio" | "other";
  status: "uploading" | "processing" | "ready" | "failed" | "unavailable";
  note?: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: number;
  attachments?: Attachment[];
  toolName?: string;
  status?: "ok" | "unavailable" | "error";
  edited?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  draft?: string;
  archived?: boolean;
  /** Personal conversation project this chat belongs to (never a Builder project). */
  projectId?: string | null;
}

export interface MemoryItem {
  id: string;
  content: string;
  category: "identity" | "preference" | "project" | "relationship" | "routine" | "other";
  tags: string[];
  importance: 1 | 2 | 3;
  pinned: boolean;
  source: "user" | "proposed";
  approved: boolean;
  createdAt: number;
}

export interface KnowledgeSource {
  id: string;
  title: string;
  type: "document" | "pdf" | "note" | "website";
  location: string;
  status: "ready" | "processing" | "failed" | "unavailable";
  addedAt: number;
  chunks: number;
  summary?: string;
}

export interface StoredFile {
  id: string;
  name: string;
  size: number;
  kind: Attachment["kind"];
  status: Attachment["status"];
  addedAt: number;
  note?: string;
}

export interface BuilderTask {
  id: string;
  title: string;
  stage: "understand" | "decompose" | "architecture" | "generate" | "test" | "review" | "approve";
  status: "pending" | "running" | "done" | "failed" | "blocked";
  detail?: string;
}

export interface BuilderFile {
  path: string;
  language: string;
  content: string;
  change: "added" | "modified" | "unchanged";
}

export interface BuilderProject {
  id: string;
  name: string;
  description: string;
  technology: string;
  status: "draft" | "planning" | "generating" | "review" | "approved" | "failed";
  buildStatus: "not started" | "passing" | "failing";
  testStatus: "not run" | "passing" | "failing";
  createdAt: number;
  updatedAt: number;
  tasks: BuilderTask[];
  files: BuilderFile[];
  logs: { at: number; level: "info" | "warn" | "error"; text: string }[];
  proposal?: {
    summary: string;
    rationale: string;
    files: string[];
    decision: "pending" | "approved" | "rejected";
  };
}

export interface PlannerRun {
  id: string;
  goal: string;
  createdAt: number;
  status: "planning" | "executing" | "blocked" | "done";
  steps: {
    id: string;
    title: string;
    tool?: string;
    status: "pending" | "running" | "done" | "failed" | "blocked";
    result?: string;
  }[];
}

export interface Appearance {
  theme: "dark" | "light" | "system";
  backgroundMode: "solid" | "gradient" | "image";
  solidColor: string;
  gradientFrom: string;
  gradientTo: string;
  gradientAngle: number;
  imageUrl: string | null;
  imageFit: "cover" | "contain";
  imagePositionX: number;
  imagePositionY: number;
  imageOpacity: number;
  imageBlur: number;
  preset: "default" | "midnight" | "aurora" | "minimal" | "glass" | "custom";
  transparency: number;
  density: "compact" | "comfortable" | "spacious";
  fontSize: number;
  bubbleStyle: "bubble" | "flat";
  animations: boolean;
  glow: boolean;
  reducedMotion: boolean;
}

export interface MoaIdentity {
  mode: "orb" | "picture";
  pictureUrl: string | null;
  shape: "circle" | "squircle" | "square";
  zoom: number;
  offsetX: number;
  offsetY: number;
  name: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  /** Assigned by the account system, not self-declared. */
  role: MoaRole;
}

export interface Personality {
  notes: string;
  tone: "warm" | "neutral" | "direct" | "playful";
  verbosity: number;
  formality: number;
  proactivity: number;
  style: string;
  emojis: boolean;
}

export interface Permission {
  id: string;
  skill: string;
  label: string;
  description: string;
  granted: boolean;
  requiresProvider: boolean;
}

export interface ConnectedAccount {
  id: string;
  provider: string;
  category: "email" | "messaging" | "numbers" | "storage" | "maps" | "model";
  account: string | null;
  status: "connected" | "disconnected" | "error" | "not configured";
  scopes: string[];
}

export interface DeviceLink {
  id: string;
  name: string;
  kind: "phone" | "desktop" | "tablet" | "iot";
  status: "unavailable" | "pairing" | "linked";
  actions: string[];
}

export interface SkillState {
  id: string;
  enabled: boolean;
}

export interface MoaState {
  version: number;
  user: UserProfile;
  identity: MoaIdentity;
  appearance: Appearance;
  personality: Personality;
  conversations: Conversation[];
  chatProjects: ChatProject[];
  activeConversationId: string | null;
  memories: MemoryItem[];
  knowledge: KnowledgeSource[];
  files: StoredFile[];
  builderProjects: BuilderProject[];
  plannerRuns: PlannerRun[];
  permissions: Permission[];
  accounts: ConnectedAccount[];
  devices: DeviceLink[];
  skills: SkillState[];
  model: {
    activeId: string;
    autoRouting: boolean;
  };
  connectors: ConnectorState[];
  constitution: Constitution;
  location: LocationState;
  lookups: { id: string; number: string; at: number; result: string }[];
}

/* ------------------------------------------------------------------ *
 * Roles and authorisation
 * ------------------------------------------------------------------ */

/** Head is the owner of this MOA instance. Roles come from the account
 *  record, never from anything the user can type into a prompt. */
export type MoaRole = "head" | "member" | "guest";

/* ------------------------------------------------------------------ *
 * Personal conversation projects (NOT Builder projects)
 * ------------------------------------------------------------------ */

export interface ChatProject {
  id: string;
  name: string;
  description: string;
  colour: string;
  instructions: string;
  createdAt: number;
  updatedAt: number;
}

/* ------------------------------------------------------------------ *
 * Connector / Tool architecture
 * ------------------------------------------------------------------ */

export type ConnectorAuthKind = "oauth2" | "api_key" | "device" | "none";

export type ConnectorStatus =
  | "not configured"
  | "awaiting authorisation"
  | "connected"
  | "error"
  | "disabled";

export interface ConnectorToolDefinition {
  id: string;
  name: string;
  description: string;
  /** Permission id (see MoaState.permissions) required to invoke this tool. */
  permission: string;
  /** Roles allowed to invoke it, enforced in the authorisation layer. */
  roles: MoaRole[];
  destructive?: boolean;
}

export interface ConnectorDefinition {
  id: string;
  name: string;
  /** Capability area this connector serves. */
  area: "web" | "maps" | "voice" | "files" | "email" | "numbers" | "code" | "model" | "devices";
  description: string;
  auth: ConnectorAuthKind;
  /** Names of credentials the integration point expects; values NEVER live in state. */
  credentials: string[];
  tools: ConnectorToolDefinition[];
  /** Skill ids (see catalog) that orchestrate this connector. */
  skills: string[];
  docsNote: string;
}

/** Per-user runtime state for a connector. No secrets are ever stored here. */
export interface ConnectorState {
  id: string;
  enabled: boolean;
  status: ConnectorStatus;
  /** Display-only account label returned by a real authorisation flow. */
  account: string | null;
  /** True only when a real credential exists in the server-side vault. */
  credentialsPresent: boolean;
  lastCheckedAt: number | null;
  error?: string;
}

/* ------------------------------------------------------------------ *
 * Head Command / Constitution
 * ------------------------------------------------------------------ */

export interface ConstitutionRule {
  id: string;
  text: string;
  kind: "law" | "principle" | "rule";
  locked: boolean;
  createdAt: number;
}

export interface Constitution {
  /** Account id of the Head. Compared against the authenticated user id. */
  headUserId: string;
  rules: ConstitutionRule[];
  updatedAt: number;
}
