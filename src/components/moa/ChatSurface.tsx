import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUp,
  Check,
  Copy,
  FileText,
  Image as ImageIcon,
  Link2,
  Camera,
  Mic,
  Paperclip,
  Pencil,
  Plus,
  RefreshCw,
  Share2,
  Sparkles,
  Trash2,
  Wrench,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMoa, uid } from "@/lib/moa/store";
import type { Attachment, Conversation, Message } from "@/lib/moa/types";
import { Orb } from "./Orb";
import { StatusBadge } from "./Status";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

function kindOf(name: string): Attachment["kind"] {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) return "image";
  if (ext === "pdf") return "pdf";
  if (["xls", "xlsx", "csv"].includes(ext)) return "spreadsheet";
  if (["doc", "docx", "txt", "md"].includes(ext)) return "document";
  if (["mp4", "mov", "webm"].includes(ext)) return "video";
  if (["mp3", "wav", "m4a"].includes(ext)) return "audio";
  return "other";
}

const fmtSize = (b: number) =>
  b > 1_000_000 ? `${(b / 1_000_000).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1000))} KB`;

const fmtTime = (t: number) =>
  new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="my-2 overflow-hidden rounded-lg border border-border bg-background/70">
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          code
        </span>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground"
          aria-label="Copy code"
          onClick={() => {
            navigator.clipboard?.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
          }}
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-xs leading-relaxed">{code}</pre>
    </div>
  );
}

function MessageBody({ content }: { content: string }) {
  const parts = useMemo(() => content.split(/```/g), [content]);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <CodeBlock key={i} code={part.replace(/^\w*\n/, "")} />
        ) : (
          <p key={i} className="whitespace-pre-wrap text-[0.95em] leading-relaxed">
            {part}
          </p>
        ),
      )}
    </>
  );
}

function ActionButton({
  label,
  icon: Icon,
  onClick,
  destructive = false,
}: {
  label: string;
  icon: typeof Copy;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex min-h-8 items-center gap-1 rounded-full border border-border/60 bg-surface/50 px-2.5 py-1 text-[11px] transition-colors hover:bg-accent hover:text-accent-foreground",
        destructive && "hover:border-destructive/50 hover:bg-destructive/15 hover:text-destructive",
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function MessageRow({
  message,
  onEdit,
  onDelete,
  onRegenerate,
}: {
  message: Message;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onRegenerate: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [value, setValue] = useState(message.content);
  const pressRef = useRef<number | null>(null);
  const { state } = useMoa();
  const flat = state.appearance.bubbleStyle === "flat";

  if (message.role === "system" || message.role === "tool") {
    const isTool = message.role === "tool";
    return (
      <div className="moa-rise flex justify-center py-1">
        <div className="flex max-w-full items-center gap-2 rounded-full border border-border bg-surface/50 px-3 py-1.5 text-xs text-muted-foreground">
          {isTool ? (
            <Wrench className="size-3.5" aria-hidden />
          ) : (
            <Sparkles className="size-3.5" aria-hidden />
          )}
          <span className="truncate">
            {isTool && message.toolName ? `${message.toolName}: ` : ""}
            {message.content}
          </span>
          {message.status === "unavailable" && <StatusBadge status="NOT CONFIGURED" />}
        </div>
      </div>
    );
  }

  const isUser = message.role === "user";

  const copy = () => {
    navigator.clipboard?.writeText(message.content);
    toast.success("Copied");
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: message.content });
        return;
      } catch {
        /* dismissed */
      }
    }
    copy();
    toast.info("Sharing unavailable — copied instead");
  };

  const startPress = () => {
    pressRef.current = window.setTimeout(() => setMenuOpen(true), 480);
  };
  const endPress = () => {
    if (pressRef.current) window.clearTimeout(pressRef.current);
    pressRef.current = null;
  };

  return (
    <div className={cn("moa-rise group flex gap-2.5", isUser ? "justify-end" : "justify-start")}>
      {!isUser && <Orb size="xs" showAura={false} className="mt-1" />}
      <div className={cn("max-w-[86%] sm:max-w-[72%]", isUser && "text-right")}>
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <div
              role="button"
              tabIndex={0}
              aria-label="Message actions"
              onTouchStart={startPress}
              onTouchEnd={endPress}
              onTouchMove={endPress}
              onContextMenu={(e) => {
                e.preventDefault();
                setMenuOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setMenuOpen(true);
                }
              }}
              className={cn(
                "inline-block w-full cursor-default px-4 py-3 text-left",
                flat ? "rounded-lg border border-border bg-transparent" : "rounded-2xl",
                !flat && isUser && "border border-primary/25 bg-primary/15",
                !flat && !isUser && "moa-panel",
              )}
            >
              {editing ? (
                <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                  <Textarea value={value} onChange={(e) => setValue(e.target.value)} rows={3} />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        onEdit(message.id, value);
                        setEditing(false);
                      }}
                    >
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <MessageBody content={message.content} />
              )}
              {message.attachments && message.attachments.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {message.attachments.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5 text-xs"
                    >
                      {a.kind === "image" ? (
                        <ImageIcon className="size-3.5" aria-hidden />
                      ) : (
                        <FileText className="size-3.5" aria-hidden />
                      )}
                      <span className="truncate">{a.name}</span>
                      <span className="text-muted-foreground">{fmtSize(a.size)}</span>
                      <span className="ml-auto font-mono text-[10px] uppercase text-muted-foreground">
                        {a.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isUser ? "end" : "start"} className="w-48">
            <DropdownMenuItem onSelect={copy}>
              <Copy className="size-4" /> Copy
            </DropdownMenuItem>
            {isUser && (
              <DropdownMenuItem onSelect={() => setEditing(true)}>
                <Pencil className="size-4" /> Edit
              </DropdownMenuItem>
            )}
            {!isUser && (
              <DropdownMenuItem onSelect={onRegenerate}>
                <RefreshCw className="size-4" /> Regenerate
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onSelect={() => void share()}>
              <Share2 className="size-4" /> Share
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => onDelete(message.id)}
            >
              <Trash2 className="size-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* Always-visible action row — long-press stays as an extra shortcut. */}
        <div
          className={cn(
            "mt-1.5 flex flex-wrap items-center gap-1 px-0.5 text-[11px] text-muted-foreground",
            isUser && "justify-end",
          )}
        >
          <ActionButton label="Copy" icon={Copy} onClick={copy} />
          <ActionButton label="Share" icon={Share2} onClick={() => void share()} />
          {isUser && (
            <ActionButton label="Edit" icon={Pencil} onClick={() => setEditing(true)} />
          )}
          {!isUser && (
            <ActionButton label="Regenerate" icon={RefreshCw} onClick={onRegenerate} />
          )}
          <ActionButton
            label="Delete"
            icon={Trash2}
            destructive
            onClick={() => onDelete(message.id)}
          />
          <span className="ml-1 whitespace-nowrap">
            {fmtTime(message.createdAt)}
            {message.edited ? " · edited" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ChatSurface({
  compact = false,
  fill = false,
  onFocusChange,
}: {
  compact?: boolean;
  /** Fills its parent (used by full-screen chat). */
  fill?: boolean;
  /** Fires when the composer gains/loses focus so hosts can shrink the hero. */
  onFocusChange?: (focused: boolean) => void;
}) {
  const { state, update, setOrbState, active } = useMoa();
  const [pending, setPending] = useState<Attachment[]>([]);
  const [thinking, setThinking] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const conversation: Conversation | undefined =
    state.conversations.find((c) => c.id === state.activeConversationId) ?? state.conversations[0];

  const draft = conversation?.draft ?? "";

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [conversation?.messages.length, thinking]);

  const setDraft = (value: string) =>
    update((s) => {
      const c = s.conversations.find((x) => x.id === conversation?.id);
      if (c) c.draft = value;
      return s;
    });

  const appendMessages = (msgs: Message[]) =>
    update((s) => {
      const c = s.conversations.find((x) => x.id === conversation?.id);
      if (!c) return s;
      c.messages.push(...msgs);
      c.updatedAt = Date.now();
      if (c.title.startsWith("New conversation")) {
        const first = msgs.find((m) => m.role === "user");
        if (first && first.content) c.title = first.content.slice(0, 42);
      }
      return s;
    });

  const send = () => {
    if (!conversation || (!draft.trim() && pending.length === 0)) return;
    const userMsg: Message = {
      id: uid("m"),
      role: "user",
      content: draft.trim(),
      createdAt: Date.now(),
      ...(pending.length ? { attachments: pending } : {}),
    };
    appendMessages([userMsg]);
    setPending([]);
    setDraft("");

    if (!active) {
      appendMessages([
        {
          id: uid("m"),
          role: "system",
          content:
            "MOA is dormant. Your message was not processed. Double-tap the orb to activate MOA first.",
          createdAt: Date.now(),
          status: "unavailable",
        },
      ]);
      toast.warning("MOA is dormant", { description: "Double-tap the orb to activate." });
      return;
    }
    runResponse();
  };

  const runResponse = () => {
    if (!active) {
      toast.warning("MOA is dormant", { description: "Double-tap the orb to activate." });
      return;
    }
    setThinking(true);
    setOrbState("thinking");
    window.setTimeout(() => {
      setThinking(false);
      setOrbState("idle");
      appendMessages([
        {
          id: uid("m"),
          role: "system",
          content: "Model provider not configured — no response was generated.",
          createdAt: Date.now(),
          status: "unavailable",
        },
      ]);
    }, 900);
  };

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    const added: Attachment[] = Array.from(files).map((f) => ({
      id: uid("att"),
      name: f.name,
      size: f.size,
      kind: kindOf(f.name),
      status: "processing",
    }));
    setPending((p) => [...p, ...added]);
    window.setTimeout(() => {
      setPending((p) =>
        p.map((a) =>
          added.some((x) => x.id === a.id)
            ? { ...a, status: "unavailable", note: "No document processing service connected" }
            : a,
        ),
      );
    }, 1200);
  };

  if (!conversation) return null;

  return (
    <div className={cn("flex flex-col", fill ? "h-full min-h-0" : "h-full")}>
      <div
        className={cn(
          "flex-1 space-y-3.5 overflow-y-auto pr-1",
          fill ? "min-h-0" : compact ? "max-h-[46vh]" : "min-h-[30vh]",
        )}
        role="log"
        aria-live="polite"
      >
        {conversation.messages.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {active
              ? "MOA is active. Say something."
              : "MOA is dormant. Double-tap the orb to wake it."}
          </p>
        )}
        {conversation.messages.map((m) => (
          <MessageRow
            key={m.id}
            message={m}
            onEdit={(id, content) =>
              update((s) => {
                const c = s.conversations.find((x) => x.id === conversation.id);
                const msg = c?.messages.find((x) => x.id === id);
                if (msg) {
                  msg.content = content;
                  msg.edited = true;
                }
                return s;
              })
            }
            onDelete={(id) =>
              update((s) => {
                const c = s.conversations.find((x) => x.id === conversation.id);
                if (c) c.messages = c.messages.filter((x) => x.id !== id);
                return s;
              })
            }
            onRegenerate={runResponse}
          />
        ))}
        {thinking && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Orb size="xs" state="thinking" showAura={false} />
            <span className="flex items-center gap-1">
              MOA is thinking
              <span className="animate-pulse">…</span>
            </span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {pending.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {pending.map((a) => (
            <li
              key={a.id}
              className="flex items-center gap-2 rounded-lg border border-border bg-surface/60 px-2.5 py-1.5 text-xs"
            >
              <FileText className="size-3.5" aria-hidden />
              <span className="max-w-[9rem] truncate">{a.name}</span>
              <span className="font-mono text-[10px] uppercase text-muted-foreground">
                {a.status}
              </span>
              <button
                type="button"
                aria-label={`Remove ${a.name}`}
                onClick={() => setPending((p) => p.filter((x) => x.id !== a.id))}
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Composer: circular + and mic sit outside the text field. */}
      <div className="mt-3 flex items-end gap-2">
        <input
          ref={fileRef}
          type="file"
          multiple
          className="sr-only"
          onChange={(e) => onFiles(e.target.files)}
        />
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={(e) => onFiles(e.target.files)}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="size-10 shrink-0 rounded-full"
              aria-label="Add attachment or tool"
            >
              <Plus className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-52">
            <DropdownMenuItem onSelect={() => fileRef.current?.click()}>
              <Paperclip className="size-4" /> Attach file
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => cameraRef.current?.click()}>
              <Camera className="size-4" /> Camera / photo
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                const url = window.prompt("Add a link");
                if (url) setDraft(`${draft}${draft ? "\n" : ""}${url}`);
              }}
            >
              <Link2 className="size-4" /> Add link
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() =>
                appendMessages([
                  {
                    id: uid("m"),
                    role: "tool",
                    content: "Tool invocation requested — no tool runtime connected.",
                    toolName: "tool.router",
                    createdAt: Date.now(),
                    status: "unavailable",
                  },
                ])
              }
            >
              <Wrench className="size-4" /> Tools & skills
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex min-w-0 flex-1 items-end gap-1 rounded-3xl border border-border bg-surface/70 px-3 py-1.5 backdrop-blur">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onFocus={() => onFocusChange?.(true)}
            onBlur={() => onFocusChange?.(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder={active ? "Message MOA…" : "MOA is dormant — double-tap the orb"}
            aria-label="Message MOA"
            className="max-h-32 min-h-9 resize-none border-0 bg-transparent px-0 py-2 shadow-none focus-visible:ring-0"
          />
          <Button
            onClick={send}
            size="icon"
            className="mb-1 size-8 shrink-0 rounded-full"
            aria-label="Send message"
            disabled={!draft.trim() && pending.length === 0}
          >
            <ArrowUp className="size-4" />
          </Button>
        </div>

        <Button
          variant="secondary"
          size="icon"
          className="size-10 shrink-0 rounded-full"
          aria-label="Voice input (not configured)"
          onClick={() =>
            toast.error("Voice is NOT CONFIGURED", {
              description: "Connect a speech provider in Settings → Accounts.",
            })
          }
        >
          <Mic className="size-5" />
        </Button>
      </div>
    </div>
  );
}
