import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Archive,
  ArchiveRestore,
  Eraser,
  Maximize2,
  MoreVertical,
  Pencil,
  Pin,
  PinOff,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMoa, uid } from "@/lib/moa/store";
import type { Conversation } from "@/lib/moa/types";
import { PageHeader } from "@/components/moa/PageHeader";
import { ChatSurface } from "@/components/moa/ChatSurface";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

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

const DAY = 86_400_000;

/** Buckets by real updatedAt timestamps — no synthetic data anywhere. */
function bucketOf(t: number) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  if (t >= startOfToday) return "Today";
  if (t >= startOfToday - DAY) return "Yesterday";
  if (t >= startOfToday - 7 * DAY) return "Previous 7 days";
  if (t >= startOfToday - 30 * DAY) return "Previous 30 days";
  return new Date(t).toLocaleDateString([], { month: "long", year: "numeric" });
}

const ORDER = ["Pinned", "Today", "Yesterday", "Previous 7 days", "Previous 30 days"];

const fmtStamp = (t: number) => {
  const d = new Date(t);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  return sameDay
    ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString([], { day: "2-digit", month: "short" });
};

function ConversationRow({ c }: { c: Conversation }) {
  const { state, update } = useMoa();
  const activeId = state.activeConversationId;
  const last = c.messages[c.messages.length - 1];

  const patch = (fn: (t: Conversation) => void) =>
    update((s) => {
      const t = s.conversations.find((x) => x.id === c.id);
      if (t) fn(t);
      return s;
    });

  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm",
        c.id === activeId ? "bg-accent" : "hover:bg-accent/60",
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
        <span className="flex items-center gap-1.5">
          {c.pinned && <Pin className="size-3 shrink-0 text-primary" aria-hidden />}
          <span className="min-w-0 flex-1 truncate">{c.title}</span>
          <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
            {fmtStamp(c.updatedAt)}
          </span>
        </span>
        <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
          {last ? `${last.role === "user" ? "You: " : ""}${last.content}` : "No messages yet"}
        </span>
        <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {c.messages.length} message{c.messages.length === 1 ? "" : "s"}
          {c.archived ? " · archived" : ""}
        </span>
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 rounded-full"
            aria-label={`Actions for ${c.title}`}
          >
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onSelect={() => {
              const name = window.prompt("Rename conversation", c.title);
              if (name?.trim()) patch((t) => void (t.title = name.trim()));
            }}
          >
            <Pencil className="size-4" /> Rename
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => patch((t) => void (t.pinned = !t.pinned))}>
            {c.pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
            {c.pinned ? "Unpin" : "Pin"}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => patch((t) => void (t.archived = !t.archived))}>
            {c.archived ? <ArchiveRestore className="size-4" /> : <Archive className="size-4" />}
            {c.archived ? "Unarchive" : "Archive"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              patch((t) => {
                t.messages = [];
                t.updatedAt = Date.now();
              });
              toast.success("Conversation cleared");
            }}
          >
            <Eraser className="size-4" /> Clear messages
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() =>
              update((s) => {
                s.conversations = s.conversations.filter((x) => x.id !== c.id);
                if (s.activeConversationId === c.id)
                  s.activeConversationId = s.conversations[0]?.id ?? null;
                return s;
              })
            }
          >
            <Trash2 className="size-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ChatPage() {
  const { state, update } = useMoa();
  const [q, setQ] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const matches = state.conversations.filter((c) => {
    if (!showArchived && c.archived) return false;
    if (!q.trim()) return true;
    const needle = q.toLowerCase();
    return (
      c.title.toLowerCase().includes(needle) ||
      c.messages.some((m) => m.content.toLowerCase().includes(needle))
    );
  });

  const groups = new Map<string, Conversation[]>();
  for (const c of [...matches].sort((a, b) => b.updatedAt - a.updatedAt)) {
    const key = c.pinned ? "Pinned" : bucketOf(c.updatedAt);
    groups.set(key, [...(groups.get(key) ?? []), c]);
  }
  const keys = [...groups.keys()].sort((a, b) => {
    const ia = ORDER.indexOf(a);
    const ib = ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return 0;
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

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

  const archivedCount = state.conversations.filter((c) => c.archived).length;

  return (
    <div>
      <PageHeader
        title="Conversations"
        status="PROTOTYPE"
        description="Conversations persist locally per user. Responses require a model provider."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full" aria-label="Full-screen chat" asChild>
              <Link to="/chat/full">
                <Maximize2 className="size-4" />
              </Link>
            </Button>
            <Button className="gap-2" onClick={newConversation}>
              <Plus className="size-4" /> New
            </Button>
          </div>
        }
      />
      <div className="grid gap-5 lg:grid-cols-[20rem_1fr]">
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

          <div className="max-h-[58vh] space-y-4 overflow-y-auto pr-1">
            {keys.map((k) => (
              <div key={k}>
                <p className="mb-1 px-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {k}
                </p>
                <ul className="space-y-1">
                  {groups.get(k)!.map((c) => (
                    <li key={c.id}>
                      <ConversationRow c={c} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {matches.length === 0 && (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                No conversations match.
              </p>
            )}
          </div>

          {archivedCount > 0 && (
            <button
              type="button"
              className="mt-3 w-full rounded-lg px-2 py-2 text-left text-xs text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              onClick={() => setShowArchived((v) => !v)}
            >
              {showArchived ? "Hide" : "Show"} archived ({archivedCount})
            </button>
          )}
        </aside>

        <section className="moa-panel flex h-[70dvh] min-h-0 flex-col p-4">
          <ChatSurface fill />
        </section>
      </div>
    </div>
  );
}
