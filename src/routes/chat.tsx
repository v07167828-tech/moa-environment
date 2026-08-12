import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pin, PinOff, Plus, Search, Trash2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMoa, uid } from "@/lib/moa/store";
import { PageHeader } from "@/components/moa/PageHeader";
import { ChatSurface } from "@/components/moa/ChatSurface";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Conversations — MOA" },
      { name: "description", content: "Browse, search, pin and manage every MOA conversation." },
      { property: "og:title", content: "Conversations — MOA" },
      { property: "og:description", content: "Browse, search, pin and manage MOA conversations." },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const { state, update } = useMoa();
  const [q, setQ] = useState("");

  const list = state.conversations
    .filter((c) => c.title.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt);

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
    <div>
      <PageHeader
        title="Conversations"
        status="PROTOTYPE"
        description="Conversations persist locally per user. Responses require a model provider."
        actions={
          <Button className="gap-2" onClick={newConversation}>
            <Plus className="size-4" /> New
          </Button>
        }
      />
      <div className="grid gap-5 lg:grid-cols-[19rem_1fr]">
        <aside className="moa-panel h-fit p-3">
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search conversations"
              aria-label="Search conversations"
              className="pl-9"
            />
          </div>
          <ul className="max-h-[52vh] space-y-1 overflow-y-auto">
            {list.map((c) => (
              <li key={c.id}>
                <div
                  className={cn(
                    "group flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm",
                    c.id === state.activeConversationId ? "bg-accent" : "hover:bg-accent/60",
                  )}
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() =>
                      update((s) => {
                        s.activeConversationId = c.id;
                        return s;
                      })
                    }
                  >
                    <span className="block truncate">{c.title}</span>
                    <span className="block text-[11px] text-muted-foreground">
                      {new Date(c.updatedAt).toLocaleDateString()} · {c.messages.length} messages
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label={c.pinned ? "Unpin" : "Pin"}
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() =>
                      update((s) => {
                        const t = s.conversations.find((x) => x.id === c.id);
                        if (t) t.pinned = !t.pinned;
                        return s;
                      })
                    }
                  >
                    {c.pinned ? <PinOff className="size-3.5" /> : <Pin className="size-3.5" />}
                  </button>
                  <button
                    type="button"
                    aria-label="Rename"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      const name = window.prompt("Rename conversation", c.title);
                      if (!name) return;
                      update((s) => {
                        const t = s.conversations.find((x) => x.id === c.id);
                        if (t) t.title = name;
                        return s;
                      });
                    }}
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Delete conversation"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() =>
                      update((s) => {
                        s.conversations = s.conversations.filter((x) => x.id !== c.id);
                        if (s.activeConversationId === c.id)
                          s.activeConversationId = s.conversations[0]?.id ?? null;
                        return s;
                      })
                    }
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </li>
            ))}
            {list.length === 0 && (
              <li className="px-2 py-6 text-center text-sm text-muted-foreground">
                No conversations match.
              </li>
            )}
          </ul>
        </aside>
        <section className="moa-panel p-4">
          <ChatSurface />
        </section>
      </div>
    </div>
  );
}
