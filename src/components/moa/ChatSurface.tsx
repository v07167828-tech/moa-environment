import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Copy,
  CornerDownLeft,
  FileText,
  Image as ImageIcon,
  Mic,
  Paperclip,
  Pencil,
  RefreshCw,
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
  const [value, setValue] = useState(message.content);
  const { state } = useMoa();
  const flat = state.appearance.bubbleStyle === "flat";

  if (message.role === "system" || message.role === "tool") {
    const isTool = message.role === "tool";
    return (
      <div className="moa-rise flex justify-center py-1">
        <div className="flex max-w-full items-center gap-2 rounded-full border border-border bg-surface/50 px-3 py-1.5 text-xs text-muted-foreground">
          {isTool ? <Wrench className="size-3.5" aria-hidden /> : <Sparkles className="size-3.5" aria-hidden />}
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

  return (
    <div className={cn("moa-rise group flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && <Orb size="sm" className="mt-1" />}
      <div className={cn("max-w-[85%] sm:max-w-[72%]", isUser && "text-right")}>
        <div
          className={cn(
            "inline-block w-full px-4 py-3 text-left",
            flat ? "rounded-lg border border-border bg-transparent" : "rounded-2xl",
            !flat && isUser && "bg-primary/15 border border-primary/25",
            !flat && !isUser && "moa-panel",
          )}
        >
          {editing ? (
            <div className="space-y-2">
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
        <div
          className={cn(
            "mt-1 flex items-center gap-1 text-[11px] text-muted-foreground opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100",
            isUser && "justify-end",
          )}
        >
          <span className="mr-1">
            {fmtTime(message.createdAt)}
            {message.edited ? " · edited" : ""}
          </span>
          <button
            type="button"
            aria-label="Copy message"
            className="rounded p-1 hover:text-foreground"
            onClick={() => {
              navigator.clipboard?.writeText(message.content);
              toast.success("Copied");
            }}
          >
            <Copy className="size-3.5" />
          </button>
          {isUser && (
            <button
              type="button"
              aria-label="Edit message"
              className="rounded p-1 hover:text-foreground"
              onClick={() => setEditing(true)}
            >
              <Pencil className="size-3.5" />
            </button>
          )}
          {!isUser && (
            <button
              type="button"
              aria-label="Regenerate response"
              className="rounded p-1 hover:text-foreground"
              onClick={onRegenerate}
            >
              <RefreshCw className="size-3.5" />
            </button>
          )}
          <button
            type="button"
            aria-label="Delete message"
            className="rounded p-1 hover:text-destructive"
            onClick={() => onDelete(message.id)}
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function ChatSurface({ compact = false }: { compact?: boolean }) {
  const { state, update, setOrbState } = useMoa();
  const [pending, setPending] = useState<Attachment[]>([]);
  const [thinking, setThinking] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
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
        if (first) c.title = first.content.slice(0, 42);
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
    runResponse();
  };

  const runResponse = () => {
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
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "flex-1 space-y-4 overflow-y-auto pr-1",
          compact ? "max-h-[46vh]" : "min-h-[45vh]",
        )}
        role="log"
        aria-live="polite"
      >
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
            <Orb size="sm" state="thinking" />
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

      <div className="moa-panel mt-4 p-2">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={compact ? 2 : 3}
          placeholder="Ask MOA anything…"
          aria-label="Message MOA"
          className="resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
        />
        <div className="flex items-center justify-between gap-2 px-1 pb-1">
          <div className="flex items-center gap-1">
            <input
              ref={fileRef}
              type="file"
              multiple
              className="sr-only"
              onChange={(e) => onFiles(e.target.files)}
            />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Attach files"
              onClick={() => fileRef.current?.click()}
            >
              <Paperclip className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Voice input (not configured)"
              onClick={() => toast.error("Voice is NOT CONFIGURED", { description: "Connect a speech provider in Settings → Accounts." })}
            >
              <Mic className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Tools and skills"
              onClick={() =>
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
              <Wrench className="size-4" />
            </Button>
          </div>
          <Button onClick={send} className="gap-2" disabled={!draft.trim() && pending.length === 0}>
            Send
            <CornerDownLeft className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
