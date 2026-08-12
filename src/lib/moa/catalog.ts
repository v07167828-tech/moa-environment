import type { CapabilityStatus } from "./types";

export interface SkillDefinition {
  id: string;
  name: string;
  icon: string;
  route?: string;
  description: string;
  status: CapabilityStatus;
  /** what must exist in the environment before this skill can really run */
  requires: string[];
  permissions: string[];
}

/**
 * Single source of truth for MOA capabilities.
 * Status here is the honest state of the prototype - never upgrade a status
 * unless a real provider integration exists behind it.
 */
export const SKILLS: SkillDefinition[] = [
  {
    id: "chat",
    name: "Chat",
    icon: "MessageSquare",
    route: "/",
    description: "Conversational surface with history, drafts, attachments and tool traces.",
    status: "PROTOTYPE",
    requires: ["Model provider"],
    permissions: [],
  },
  {
    id: "memory",
    name: "Memory",
    icon: "Brain",
    route: "/memory",
    description: "What MOA remembers about you, under your explicit approval.",
    status: "IMPLEMENTED",
    requires: [],
    permissions: ["memory.write"],
  },
  {
    id: "knowledge",
    name: "Knowledge",
    icon: "Library",
    route: "/knowledge",
    description: "Sources MOA can retrieve from: documents, notes, sites.",
    status: "PROTOTYPE",
    requires: ["Embedding provider", "Vector store"],
    permissions: ["files.read"],
  },
  {
    id: "files",
    name: "Files",
    icon: "FolderOpen",
    route: "/files",
    description: "Upload, inspect and manage the artefacts MOA works with.",
    status: "PROTOTYPE",
    requires: ["Object storage"],
    permissions: ["files.read", "files.write"],
  },
  {
    id: "web",
    name: "Web",
    icon: "Globe",
    route: "/web",
    description: "Search and read the open internet.",
    status: "NOT CONFIGURED",
    requires: ["Search API key"],
    permissions: ["web.access"],
  },
  {
    id: "maps",
    name: "Maps",
    icon: "Map",
    route: "/maps",
    description: "Places, directions and navigation assistance.",
    status: "NOT CONFIGURED",
    requires: ["Maps provider", "Location permission"],
    permissions: ["location"],
  },
  {
    id: "voice",
    name: "Voice",
    icon: "Mic",
    route: "/voice",
    description: "Speech in, speech out.",
    status: "NOT CONFIGURED",
    requires: ["STT provider", "TTS provider", "Microphone permission"],
    permissions: ["microphone"],
  },
  {
    id: "email",
    name: "Email",
    icon: "Mail",
    route: "/email",
    description: "Read, triage, compose and send from authorised mailboxes.",
    status: "NOT CONFIGURED",
    requires: ["Mail account authorisation"],
    permissions: ["email.read", "email.send"],
  },
  {
    id: "numbers",
    name: "Numbers",
    icon: "Hash",
    route: "/numbers",
    description: "Provisioned numbers and SMS workflows through legitimate providers.",
    status: "NOT CONFIGURED",
    requires: ["Telephony provider account", "Identity verification"],
    permissions: ["numbers.manage"],
  },
  {
    id: "communications",
    name: "Communications",
    icon: "Radio",
    route: "/communications",
    description: "Messaging channels and contact reach across authorised services.",
    status: "NOT CONFIGURED",
    requires: ["Channel provider authorisation"],
    permissions: ["comms.send"],
  },
  {
    id: "code",
    name: "Code",
    icon: "Code2",
    route: "/code",
    description: "Generate, explain, edit and debug code.",
    status: "PROTOTYPE",
    requires: ["Model provider", "Execution sandbox"],
    permissions: ["code.execute"],
  },
  {
    id: "builder",
    name: "Builder",
    icon: "Hammer",
    route: "/builder",
    description: "Plan, generate, test and review whole projects before approval.",
    status: "PROTOTYPE",
    requires: ["Model provider", "Repository access", "CI runner"],
    permissions: ["builder.files"],
  },
  {
    id: "planner",
    name: "Planner",
    icon: "ListChecks",
    route: "/planner",
    description: "Goal decomposition, tool selection, execution and correction.",
    status: "PROTOTYPE",
    requires: ["Model provider", "Tool runtime"],
    permissions: [],
  },
  {
    id: "devices",
    name: "Devices",
    icon: "MonitorSmartphone",
    route: "/devices",
    description: "Future device and computer control surface.",
    status: "PLANNED",
    requires: ["Device agent", "Pairing service"],
    permissions: ["device.control"],
  },
];

export const skillById = (id: string) => SKILLS.find((s) => s.id === id);

export const MODELS = [
  {
    id: "moa-general",
    name: "MOA General",
    type: "general chat",
    availability: "NOT CONFIGURED" as CapabilityStatus,
    note: "Default conversational model. Requires a model provider key.",
  },
  {
    id: "moa-reason",
    name: "MOA Reasoner",
    type: "reasoning",
    availability: "NOT CONFIGURED" as CapabilityStatus,
    note: "Long-horizon planning and multi-step problems.",
  },
  {
    id: "moa-code",
    name: "MOA Coder",
    type: "coding",
    availability: "NOT CONFIGURED" as CapabilityStatus,
    note: "Code generation and repair for Builder.",
  },
  {
    id: "moa-vision",
    name: "MOA Vision",
    type: "vision",
    availability: "NOT CONFIGURED" as CapabilityStatus,
    note: "Images, screenshots and UI reconstruction.",
  },
  {
    id: "moa-local",
    name: "MOA Local",
    type: "local / offline",
    availability: "PLANNED" as CapabilityStatus,
    note: "On-device fallback so MOA keeps an identity without the cloud.",
  },
];
