import type { ConnectorDefinition, ConnectorState } from "./types";

/**
 * MOA connector architecture.
 *
 *   Connector  = an authenticated bridge to an external service.
 *   Tool       = one concrete operation exposed by a connector.
 *   Skill      = a higher-level capability that orchestrates tools (see catalog.ts).
 *   Permission = whether a user/role may invoke a tool (see MoaState.permissions
 *                and lib/moa/authz.ts).
 *
 * This registry is declarative on purpose: adding a connector means adding an
 * entry here plus a real authorisation integration point — no UI rewrite, and
 * no service hard-coded into a component.
 *
 * SECURITY: credentials/tokens are never modelled in client state. This file
 * only names which credentials a connector expects so the manager can render
 * an honest "not configured" state. Real values must live in a server-side
 * secret store and only ever be read inside server handlers.
 */
export const CONNECTORS: ConnectorDefinition[] = [
  {
    id: "model",
    name: "Model provider",
    area: "model",
    description: "The language model MOA reasons and replies with.",
    auth: "api_key",
    credentials: ["MODEL_PROVIDER_API_KEY"],
    skills: ["chat", "planner", "code", "builder"],
    docsNote: "Until a key exists server-side, MOA answers with an explicit unavailable state.",
    tools: [
      {
        id: "model.complete",
        name: "Generate response",
        description: "Produce an assistant response for a conversation.",
        permission: "model.invoke",
        roles: ["head", "member"],
      },
      {
        id: "model.embed",
        name: "Embed text",
        description: "Create vectors for knowledge retrieval.",
        permission: "model.invoke",
        roles: ["head", "member"],
      },
    ],
  },
  {
    id: "web",
    name: "Web search",
    area: "web",
    description: "Search the open internet and read pages.",
    auth: "api_key",
    credentials: ["SEARCH_API_KEY"],
    skills: ["web"],
    docsNote: "Requires a search provider key. MOA never bypasses paywalls or CAPTCHA.",
    tools: [
      { id: "web.search", name: "Search", description: "Run a web query.", permission: "web.access", roles: ["head", "member"] },
      { id: "web.fetch", name: "Read page", description: "Fetch and extract a URL.", permission: "web.access", roles: ["head", "member"] },
    ],
  },
  {
    id: "maps",
    name: "Maps provider",
    area: "maps",
    description: "Places, geocoding and directions.",
    auth: "api_key",
    credentials: ["MAPS_API_KEY"],
    skills: ["maps"],
    docsNote: "Device location is a separate user permission and is never read implicitly.",
    tools: [
      { id: "maps.places", name: "Find places", description: "Search nearby places.", permission: "location", roles: ["head", "member"] },
      { id: "maps.directions", name: "Directions", description: "Route between two points.", permission: "location", roles: ["head", "member"] },
    ],
  },
  {
    id: "voice",
    name: "Speech provider",
    area: "voice",
    description: "Speech-to-text and text-to-speech for MOA's voice.",
    auth: "api_key",
    credentials: ["STT_API_KEY", "TTS_API_KEY"],
    skills: ["voice"],
    docsNote: "Recorded audio stays local until a speech provider is authorised.",
    tools: [
      { id: "voice.transcribe", name: "Transcribe", description: "Convert recorded audio to text.", permission: "microphone", roles: ["head", "member"] },
      { id: "voice.speak", name: "Speak", description: "Read a MOA response aloud.", permission: "microphone", roles: ["head", "member"] },
    ],
  },
  {
    id: "storage",
    name: "Object storage",
    area: "files",
    description: "Durable storage for files and knowledge sources.",
    auth: "api_key",
    credentials: ["STORAGE_ENDPOINT", "STORAGE_ACCESS_KEY"],
    skills: ["files", "knowledge"],
    docsNote: "Without storage, uploads exist only in this browser.",
    tools: [
      { id: "files.put", name: "Store file", description: "Upload a file for MOA.", permission: "files.write", roles: ["head", "member"] },
      { id: "files.get", name: "Read file", description: "Read a stored file.", permission: "files.read", roles: ["head", "member"] },
      { id: "files.delete", name: "Delete file", description: "Remove a stored file.", permission: "files.write", roles: ["head"], destructive: true },
    ],
  },
  {
    id: "email",
    name: "Mail account",
    area: "email",
    description: "Read, triage and send from an authorised mailbox.",
    auth: "oauth2",
    credentials: ["MAIL_OAUTH_CLIENT_ID", "MAIL_OAUTH_CLIENT_SECRET"],
    skills: ["email"],
    docsNote: "Needs a per-user OAuth consent flow; sending is a separate permission.",
    tools: [
      { id: "email.list", name: "List mail", description: "Read recent messages.", permission: "email.read", roles: ["head", "member"] },
      { id: "email.send", name: "Send mail", description: "Send on your behalf.", permission: "email.send", roles: ["head"], destructive: true },
    ],
  },
  {
    id: "telephony",
    name: "Telephony provider",
    area: "numbers",
    description: "Provisioned numbers, SMS and voice calls.",
    auth: "api_key",
    credentials: ["TELEPHONY_ACCOUNT_SID", "TELEPHONY_AUTH_TOKEN"],
    skills: ["numbers", "communications"],
    docsNote: "Provider identity verification is required. MOA will not bypass it.",
    tools: [
      { id: "numbers.provision", name: "Provision number", description: "Acquire a number.", permission: "numbers.manage", roles: ["head"], destructive: true },
      { id: "comms.sms", name: "Send SMS", description: "Send a text message.", permission: "comms.send", roles: ["head"], destructive: true },
    ],
  },
  {
    id: "repo",
    name: "Repository / CI",
    area: "code",
    description: "Source control and test execution for Builder.",
    auth: "oauth2",
    credentials: ["REPO_OAUTH_TOKEN"],
    skills: ["code", "builder"],
    docsNote: "Builder proposes changes locally until a repository is authorised.",
    tools: [
      { id: "code.read", name: "Read repository", description: "Read project files.", permission: "builder.files", roles: ["head", "member"] },
      { id: "code.run", name: "Run tests", description: "Execute the test suite in a sandbox.", permission: "code.execute", roles: ["head"] },
      { id: "code.commit", name: "Commit changes", description: "Write approved changes.", permission: "code.execute", roles: ["head"], destructive: true },
    ],
  },
  {
    id: "devices",
    name: "Device agent",
    area: "devices",
    description: "Paired devices MOA can act on.",
    auth: "device",
    credentials: ["DEVICE_PAIRING_SECRET"],
    skills: ["devices"],
    docsNote: "Pairing service does not exist yet; every device shows as unavailable.",
    tools: [
      { id: "device.notify", name: "Notify device", description: "Push a notification.", permission: "device.control", roles: ["head"] },
    ],
  },
];

export const connectorById = (id: string) => CONNECTORS.find((c) => c.id === id);

export const connectorsForArea = (area: ConnectorDefinition["area"]) =>
  CONNECTORS.filter((c) => c.area === area);

export const connectorsForSkill = (skillId: string) =>
  CONNECTORS.filter((c) => c.skills.includes(skillId));

export const defaultConnectorStates = (): ConnectorState[] =>
  CONNECTORS.map((c) => ({
    id: c.id,
    enabled: true,
    status: "not configured",
    account: null,
    credentialsPresent: false,
    lastCheckedAt: null,
  }));

export const allToolPermissions = () =>
  Array.from(new Set(CONNECTORS.flatMap((c) => c.tools.map((t) => t.permission))));
