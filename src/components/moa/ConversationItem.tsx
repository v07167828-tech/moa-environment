import { useRef, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  Eraser,
  FolderInput,
  FolderMinus,
  MoreVertical,
  Pencil,
  Pin,
  PinOff,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMoa } from "@/lib/moa/store";
import type { Conversation } from "@/lib/moa/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const fmtStamp = (t: number) => {
  const d = new Date(t);
  const sameDay = d.toDateString() === new Date().toDateString();
  return sameDay
    ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString([], { day: "2-digit", month: "short" });
};

/**
 * One conversation row with its full action set.
 *
 * The same component is used in the navigation drawer, the Chats page and
 * inside a Project — a chat keeps every one of its own controls even when it
 * belongs to a personal project.
 */
export function ConversationItem({
  c,
  onOpen,
  dense = false,
  showProject = true,
}: {
  c: Conversation;
  onOpen?: () => void;
  dense?: boolean;
  showProject?: boolean;
}) {
  const { state, update } = useMoa();
  const [menuOpen, setMenuOpen] = useState(false);
  const pressRef = useRef<number | null>(null);
  const project = state.chatProjects.find((p) => p.id === c.projectId);
  const last = c.messages[c.messages.length - 1];

  const patch = (fn: (t: Conversation) => void) =>
    update((s) => {
      const t = s.conversations.find((x) => x.id === c.id);
      if (t) fn(t);
      return s;
    });

  const startPress = () => {
    pressRef.current = window.setTimeout(() => setMenuOpen(true), 450);
  };
  const endPress = () => {
    if (pressRef.current) window.clearTimeout(pressRef.current);
    pressRef.current = null;
  };

  return (
    <div
      className={cn(
        "group flex items-center gap-1.5 rounded-xl px-2.5 text-sm transition-colors",
        dense ? "py-2" : "py-2.5",
        c.id === state.activeConversationId ? "bg-accent" : "hover:bg-accent/60",
      )}
    >
      <button
        type="button"
        className="min-w-0 flex-1 text-left"
        onTouchStart={startPress}
        onTouchEnd={endPress}
        onTouchMove={endPress}
        onContextMenu={(e) => {
          e.preventDefault();
          setMenuOpen(true);
        }}
        onClick={() => {
          update((s) => {
            s.activeConversationId = c.id;
            return s;
          });
          onOpen?.();
        }}
      >
        <span className="flex items-center gap-1.5">
          {c.pinned && <Pin className="size-3 shrink-0 text-primary" aria-hidden />}
          <span className="min-w-0 flex-1 truncate">{c.title}</span>
          <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
            {fmtStamp(c.updatedAt)}
          </span>
        </span>
        {!dense && (
          <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
            {last ? `${last.role === "user" ? "You: " : ""}${last.content}` : "No messages yet"}
          </span>
        )}
        {showProject && (project || c.archived) && (
          <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {project ? project.name : ""}
            {project && c.archived ? " · " : ""}
            {c.archived ? "archived" : ""}
          </span>
        )}
      </button>

      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
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
        <DropdownMenuContent align="end" className="w-56">
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

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <FolderInput className="size-4" /> {project ? "Change project" : "Add to project"}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-52">
              <DropdownMenuLabel className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Personal projects
              </DropdownMenuLabel>
              {state.chatProjects.length === 0 && (
                <DropdownMenuItem disabled>No projects yet</DropdownMenuItem>
              )}
              {state.chatProjects.map((p) => (
                <DropdownMenuItem
                  key={p.id}
                  onSelect={() => {
                    patch((t) => void (t.projectId = p.id));
                    toast.success(`Moved to ${p.name}`);
                  }}
                >
                  {p.name}
                  {p.id === c.projectId ? " ✓" : ""}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => {
                  const name = window.prompt("New project name");
                  if (!name?.trim()) return;
                  const id = `cp-${Math.random().toString(36).slice(2, 9)}`;
                  update((s) => {
                    s.chatProjects.unshift({
                      id,
                      name: name.trim(),
                      description: "",
                      colour: "#4cc9f0",
                      instructions: "",
                      createdAt: Date.now(),
                      updatedAt: Date.now(),
                    });
                    const t = s.conversations.find((x) => x.id === c.id);
                    if (t) t.projectId = id;
                    return s;
                  });
                }}
              >
                New project…
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {project && (
            <DropdownMenuItem
              onSelect={() => {
                patch((t) => void (t.projectId = null));
                toast.info(`Removed from ${project.name}`);
              }}
            >
              <FolderMinus className="size-4" /> Remove from project
            </DropdownMenuItem>
          )}

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
