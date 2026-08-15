import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Brain, Hammer, ListChecks, Library, Plus, Maximize2 } from "lucide-react";
import { useMoa, uid } from "@/lib/moa/store";
import { Orb, ORB_STATE_LABEL } from "@/components/moa/Orb";
import { ChatSurface } from "@/components/moa/ChatSurface";
import { StatusBadge } from "@/components/moa/Status";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  const [composing, setComposing] = useState(false);

  const conversation =
    state.conversations.find((c) => c.id === state.activeConversationId) ?? state.conversations[0];

  // The hero recedes once the conversation is live or the composer is focused,
  // so the input never sits below the fold on mobile.
  const condensed = composing || (conversation?.messages.length ?? 0) > 0;

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
    <div className="flex h-[calc(100dvh-8rem)] min-h-0 flex-col gap-3">
      <section
        className={cn(
          "moa-rise flex shrink-0 flex-col items-center text-center transition-all duration-500 ease-out",
          condensed ? "pt-0" : "pt-2",
        )}
      >
        <Orb interactive px={condensed ? 76 : 172} />
        <p
          className={cn(
            "font-mono uppercase tracking-[0.22em] text-muted-foreground transition-all duration-500",
            condensed ? "mt-2 text-[10px]" : "mt-5 text-[11px]",
          )}
        >
          {state.identity.name} · {online ? ORB_STATE_LABEL[orbState] : "Offline"}
        </p>
        <h1
          className={cn(
            "font-display font-semibold transition-all duration-500",
            condensed ? "mt-1 text-base" : "mt-2 text-2xl sm:text-3xl",
          )}
        >
          {greeting()}, {state.user.name.split(" ")[0]}
        </h1>

        {/* Quick actions only in the spacious dormant hero. */}
        <div
          className={cn(
            "flex flex-wrap items-center justify-center gap-2 overflow-hidden transition-all duration-500",
            condensed ? "mt-0 max-h-0 opacity-0" : "mt-4 max-h-24 opacity-100",
          )}
        >
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

      {/* Compact secondary status strip — counts live here, not in the hero. */}
      <div className="flex shrink-0 flex-wrap items-center justify-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        <Link to="/memory" className="hover:text-foreground">
          {state.memories.filter((m) => m.approved).length} memories
        </Link>
        <span aria-hidden>·</span>
        <Link to="/knowledge" className="hover:text-foreground">
          {state.knowledge.length} knowledge
        </Link>
        <span aria-hidden>·</span>
        <Link to="/builder" className="hover:text-foreground">
          {state.builderProjects.length} projects
        </Link>
        <span aria-hidden>·</span>
        <Link to="/chat" className="hover:text-foreground">
          {state.conversations.length} chats
        </Link>
      </div>

      <section aria-label="Conversation with MOA" className="flex min-h-0 flex-1 flex-col">
        <div className="mb-1.5 flex shrink-0 items-center justify-between gap-2">
          <h2 className="min-w-0 truncate font-display text-sm font-medium text-muted-foreground">
            {conversation?.title ?? "Conversation"}
          </h2>
          <div className="flex shrink-0 items-center gap-1.5">
            <StatusBadge status="PROTOTYPE" />
            <Button variant="ghost" size="icon" className="rounded-full" aria-label="Full-screen chat" asChild>
              <Link to="/chat/full">
                <Maximize2 className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="min-h-0 flex-1">
          <ChatSurface fill onFocusChange={(f) => f && setComposing(true)} />
        </div>
      </section>
    </div>
  );
}
