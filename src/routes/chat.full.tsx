import { createFileRoute, Link } from "@tanstack/react-router";
import { Minimize2 } from "lucide-react";
import { ChatSurface } from "@/components/moa/ChatSurface";
import { Orb } from "@/components/moa/Orb";
import { useMoa } from "@/lib/moa/store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/chat/full")({
  head: () => ({
    meta: [
      { title: "Full-screen chat — MOA" },
      { name: "description", content: "Distraction-free full-screen conversation with MOA." },
      { property: "og:title", content: "Full-screen chat — MOA" },
      { property: "og:description", content: "Distraction-free conversation with MOA." },
    ],
  }),
  component: FullChat,
});

function FullChat() {
  const { state } = useMoa();
  const conversation =
    state.conversations.find((c) => c.id === state.activeConversationId) ?? state.conversations[0];

  return (
    <div className="flex h-[100dvh] flex-col">
      <header className="flex shrink-0 items-center gap-3 border-b border-border/40 px-3 py-2">
        <Orb size="xs" interactive showAura={false} />
        <span className="min-w-0 flex-1 truncate text-sm">
          {conversation?.title ?? "Conversation"}
        </span>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="Exit full screen" asChild>
          <Link to="/chat">
            <Minimize2 className="size-4" />
          </Link>
        </Button>
      </header>
      <div className="min-h-0 flex-1 px-3">
        <ChatSurface fill />
      </div>
    </div>
  );
}
