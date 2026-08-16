import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Maximize2 } from "lucide-react";
import { useMoa, uid } from "@/lib/moa/store";
import { Orb, ORB_STATE_LABEL } from "@/components/moa/Orb";
import { CompactOrb } from "@/components/moa/CompactOrb";
import { ChatSurface } from "@/components/moa/ChatSurface";
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

/** Local-time greeting. Never hard-coded. */
function greeting(d = new Date()) {
  const h = d.getHours();
  if (h >= 5 && h < 12) return "Good morning";
  if (h >= 12 && h < 17) return "Good afternoon";
  if (h >= 17 && h < 22) return "Good evening";
  return "Good night";
}

function Home() {
  const { state, update, orbState, online, active } = useMoa();

  const conversation =
    state.conversations.find((c) => c.id === state.activeConversationId) ?? state.conversations[0];

  // Once the first message is sent the hero orb shrinks into the draggable
  // compact orb and the conversation takes the whole surface.
  const started = (conversation?.messages.length ?? 0) > 0;

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
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {started ? (
        <CompactOrb />
      ) : (
        <section className="moa-rise flex shrink-0 flex-col items-center pt-4 text-center transition-all duration-500 ease-out">
          <Orb interactive px={168} className="transition-all duration-500 ease-out" />
          <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            {state.identity.name} · {online ? ORB_STATE_LABEL[orbState] : "Offline"}
          </p>
          {/* Greeting only exists once MOA is awake. */}
          {active && (
            <h1 className="moa-rise mt-3 font-display text-2xl font-semibold sm:text-3xl">
              {greeting()}, {state.user.name.split(" ")[0]}
            </h1>
          )}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <Button size="sm" variant="ghost" className="gap-2" onClick={newConversation}>
              <Plus className="size-3.5" /> New conversation
            </Button>
            <Button variant="ghost" size="sm" className="gap-2" asChild>
              <Link to="/chat/full">
                <Maximize2 className="size-3.5" /> Full screen
              </Link>
            </Button>
          </div>
        </section>
      )}

      <section
        aria-label="Conversation with MOA"
        className={cn("flex min-h-0 flex-1 flex-col", started && "pt-1")}
      >
        <div className="min-h-0 flex-1">
          <ChatSurface fill />
        </div>
      </section>
    </div>
  );
}
