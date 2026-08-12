import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, Brain, FolderOpen, Hammer, Library, MessageSquare } from "lucide-react";
import { useMoa } from "@/lib/moa/store";
import { PageHeader } from "@/components/moa/PageHeader";
import { StatusBadge } from "@/components/moa/Status";
import { Orb } from "@/components/moa/Orb";
import { SKILLS, MODELS } from "@/lib/moa/catalog";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — MOA" },
      {
        name: "description",
        content: "MOA control centre: status, model, memory, knowledge, services and recent activity.",
      },
      { property: "og:title", content: "Dashboard — MOA" },
      { property: "og:description", content: "The control centre for your MOA environment." },
    ],
  }),
  component: Dashboard,
});

function Stat({
  icon: Icon,
  label,
  value,
  to,
}: {
  icon: typeof Brain;
  label: string;
  value: string;
  to: string;
}) {
  return (
    <Link to={to} className="moa-panel moa-rise flex items-center gap-3 p-4 hover:border-primary/40">
      <span className="grid size-10 place-items-center rounded-lg bg-accent/60 text-primary">
        <Icon className="size-4" aria-hidden />
      </span>
      <span>
        <span className="block font-display text-xl font-semibold">{value}</span>
        <span className="block text-xs text-muted-foreground">{label}</span>
      </span>
    </Link>
  );
}

function Dashboard() {
  const { state, orbState, online } = useMoa();
  const model = MODELS.find((m) => m.id === state.model.activeId);
  const enabled = state.skills.filter((s) => s.enabled).length;
  const connected = state.accounts.filter((a) => a.status === "connected").length;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        status="PROTOTYPE"
        description="A single view of what MOA is, what it knows, and what it can currently reach."
      />

      <section className="moa-panel moa-rise mb-5 flex flex-col items-center gap-4 p-5 sm:flex-row sm:items-center">
        <Orb size="md" />
        <div className="flex-1 text-center sm:text-left">
          <p className="font-display text-lg font-semibold">
            {state.identity.name} · {online ? orbState : "offline"}
          </p>
          <p className="text-sm text-muted-foreground">
            Active model: {model?.name ?? "none"} ({model?.type}) — routing{" "}
            {state.model.autoRouting ? "auto" : "manual"}
          </p>
        </div>
        <StatusBadge status={model?.availability ?? "NOT CONFIGURED"} />
      </section>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat icon={MessageSquare} label="Conversations" value={String(state.conversations.length)} to="/chat" />
        <Stat icon={Brain} label="Memories" value={String(state.memories.length)} to="/memory" />
        <Stat icon={Library} label="Sources" value={String(state.knowledge.length)} to="/knowledge" />
        <Stat icon={FolderOpen} label="Files" value={String(state.files.length)} to="/files" />
        <Stat icon={Hammer} label="Projects" value={String(state.builderProjects.length)} to="/builder" />
        <Stat icon={Activity} label="Skills on" value={`${enabled}/${SKILLS.length}`} to="/skills" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="moa-panel p-4">
          <h2 className="mb-3 font-display text-base font-semibold">Service status</h2>
          <ul className="space-y-2">
            {state.accounts.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 text-sm">
                <span>{a.provider}</span>
                <StatusBadge status={a.status === "connected" ? "CONFIGURED" : "NOT CONFIGURED"} />
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            {connected} of {state.accounts.length} services authorised.
          </p>
        </section>

        <section className="moa-panel p-4">
          <h2 className="mb-3 font-display text-base font-semibold">Skill availability</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {SKILLS.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate">{s.name}</span>
                <StatusBadge status={s.status} />
              </li>
            ))}
          </ul>
        </section>

        <section className="moa-panel p-4">
          <h2 className="mb-3 font-display text-base font-semibold">Recent conversations</h2>
          <ul className="space-y-2">
            {state.conversations.slice(0, 5).map((c) => (
              <li key={c.id}>
                <Link to="/chat" className="flex items-center justify-between gap-3 text-sm hover:text-primary">
                  <span className="truncate">{c.title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(c.updatedAt).toLocaleDateString()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="moa-panel p-4">
          <h2 className="mb-3 font-display text-base font-semibold">Builder projects</h2>
          <ul className="space-y-2">
            {state.builderProjects.map((p) => (
              <li key={p.id}>
                <Link
                  to="/builder/$projectId"
                  params={{ projectId: p.id }}
                  className="flex items-center justify-between gap-3 text-sm hover:text-primary"
                >
                  <span className="truncate">{p.name}</span>
                  <span className="font-mono text-[10px] uppercase text-muted-foreground">
                    {p.status}
                  </span>
                </Link>
              </li>
            ))}
            {state.builderProjects.length === 0 && (
              <li className="text-sm text-muted-foreground">No projects yet.</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
