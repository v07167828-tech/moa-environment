import { createFileRoute, Link } from "@tanstack/react-router";
import { Brain, Hammer, ListChecks, Library, Plus } from "lucide-react";
import { useMoa, uid } from "@/lib/moa/store";
import { Orb, ORB_STATE_LABEL } from "@/components/moa/Orb";
import { ChatSurface } from "@/components/moa/ChatSurface";
import { StatusBadge } from "@/components/moa/Status";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MOA — Your personal AI environment" },
      {
        name: "description",
        content:
          "MOA home: talk to your assistant, see its state, and jump into memory, knowledge, planner or builder.",
      },
      { property: "og:title", content: "MOA — Your personal AI environment" },
      {
        property: "og:description",
        content: "Talk to MOA and move between memory, knowledge, skills and the builder workspace.",
      },
    ],
  }),
  component: Home,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

const QUICK = [
  { to: "/memory", label: "Memory", icon: Brain },
  { to: "/knowledge", label: "Knowledge", icon: Library },
  { to: "/planner", label: "Planner", icon: ListChecks },
  { to: "/builder", label: "Builder", icon: Hammer },
] as const;

function Home() {
  const { state, update, orbState, online } = useMoa();

  const newConversation = () =>
    update((s) => {
      const id = uid("c");
      s.conversations.unshift({
        id,
        title: "New conversation",
        pinned: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
        draft: "",
      });
      s.activeConversationId = id;
      return s;
    });

  return (
    <div className="space-y-6">
      <section className="moa-rise flex flex-col items-center pt-2 text-center">
        <Orb size="xl" />
        <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          {state.identity.name} · {online ? ORB_STATE_LABEL[orbState] : "Offline"}
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
          {greeting()}, {state.user.name.split(" ")[0]}
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {state.memories.filter((m) => m.approved).length} memories ·{" "}
          {state.knowledge.length} knowledge sources · {state.builderProjects.length} builder
          project{state.builderProjects.length === 1 ? "" : "s"}
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <Button size="sm" variant="secondary" className="gap-2" onClick={newConversation}>
            <Plus className="size-3.5" /> New conversation
          </Button>
          {QUICK.map((q) => (
            <Button key={q.to} size="sm" variant="ghost" className="gap-2" asChild>
              <Link to={q.to}>
                <q.icon className="size-3.5" />
                {q.label}
              </Link>
            </Button>
          ))}
        </div>
      </section>

      <section aria-label="Conversation with MOA">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-sm font-medium text-muted-foreground">
            {state.conversations.find((c) => c.id === state.activeConversationId)?.title ??
              "Conversation"}
          </h2>
          <StatusBadge status="PROTOTYPE" />
        </div>
        <ChatSurface />
      </section>
    </div>
  );
}
