import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Download, Pin, PinOff, Plus, Search, Trash2, X } from "lucide-react";
import { useMoa, uid } from "@/lib/moa/store";
import type { MemoryItem } from "@/lib/moa/types";
import { PageHeader } from "@/components/moa/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/memory")({
  head: () => ({
    meta: [
      { title: "Memory — MOA" },
      {
        name: "description",
        content: "Everything MOA remembers about you, with explicit approval, categories and export.",
      },
      { property: "og:title", content: "Memory — MOA" },
      { property: "og:description", content: "Review, approve and control MOA's long-term memory." },
    ],
  }),
  component: MemoryPage,
});

const CATEGORIES: MemoryItem["category"][] = [
  "identity",
  "preference",
  "project",
  "relationship",
  "routine",
  "other",
];

function MemoryPage() {
  const { state, update } = useMoa();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [draft, setDraft] = useState("");
  const [category, setCategory] = useState<MemoryItem["category"]>("preference");
  const [tags, setTags] = useState("");

  const items = state.memories
    .filter((m) => (filter === "all" ? true : filter === "pending" ? !m.approved : m.category === filter))
    .filter(
      (m) =>
        m.content.toLowerCase().includes(q.toLowerCase()) ||
        m.tags.some((t) => t.includes(q.toLowerCase())),
    )
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt - a.createdAt);

  const add = () => {
    if (!draft.trim()) return;
    update((s) => {
      s.memories.unshift({
        id: uid("mem"),
        content: draft.trim(),
        category,
        tags: tags
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean),
        importance: 2,
        pinned: false,
        source: "user",
        approved: true,
        createdAt: Date.now(),
      });
      return s;
    });
    setDraft("");
    setTags("");
    toast.success("Memory saved");
  };

  const patch = (id: string, fn: (m: MemoryItem) => void) =>
    update((s) => {
      const m = s.memories.find((x) => x.id === id);
      if (m) fn(m);
      return s;
    });

  const exportMemories = () => {
    const blob = new Blob([JSON.stringify(state.memories, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "moa-memories.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader
        title="Memory"
        status="IMPLEMENTED"
        description="Memory is information about you. MOA never promotes a conversation to memory without your approval."
        actions={
          <>
            <Button variant="secondary" className="gap-2" onClick={exportMemories}>
              <Download className="size-4" /> Export
            </Button>
            <Button
              variant="ghost"
              className="gap-2 text-destructive"
              onClick={() => {
                if (!window.confirm("Forget everything? This deletes all memories.")) return;
                update((s) => {
                  s.memories = [];
                  return s;
                });
                toast.success("All memories deleted");
              }}
            >
              <Trash2 className="size-4" /> Forget everything
            </Button>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
        <div>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search memory"
                aria-label="Search memory"
                className="pl-9"
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="sm:w-48" aria-label="Filter memories">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Awaiting approval</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ul className="space-y-3">
            {items.map((m) => (
              <li key={m.id} className="moa-panel moa-rise p-4">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">{m.content}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <Badge variant="secondary">{m.category}</Badge>
                      {m.tags.map((t) => (
                        <Badge key={t} variant="outline">
                          #{t}
                        </Badge>
                      ))}
                      <span className="text-[11px] text-muted-foreground">
                        importance {m.importance}/3 · {new Date(m.createdAt).toLocaleDateString()}
                      </span>
                      {!m.approved && (
                        <Badge className="bg-warning/15 text-warning">Proposed by MOA</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {!m.approved && (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="Remember this"
                          onClick={() => patch(m.id, (x) => (x.approved = true))}
                        >
                          <Check className="size-4 text-success" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="Don't remember this"
                          onClick={() =>
                            update((s) => {
                              s.memories = s.memories.filter((x) => x.id !== m.id);
                              return s;
                            })
                          }
                        >
                          <X className="size-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={m.pinned ? "Unpin memory" : "Pin memory"}
                      onClick={() => patch(m.id, (x) => (x.pinned = !x.pinned))}
                    >
                      {m.pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Delete memory"
                      onClick={() =>
                        update((s) => {
                          s.memories = s.memories.filter((x) => x.id !== m.id);
                          return s;
                        })
                      }
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
                <Textarea
                  className="mt-3 hidden"
                  value={m.content}
                  onChange={(e) => patch(m.id, (x) => (x.content = e.target.value))}
                />
              </li>
            ))}
            {items.length === 0 && (
              <li className="moa-panel p-8 text-center text-sm text-muted-foreground">
                Nothing stored here yet.
              </li>
            )}
          </ul>
        </div>

        <aside className="moa-panel h-fit space-y-3 p-4">
          <h2 className="font-display text-base font-semibold">Create memory</h2>
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="MOA should remember that…"
            aria-label="New memory"
            rows={4}
          />
          <Select value={category} onValueChange={(v) => setCategory(v as MemoryItem["category"])}>
            <SelectTrigger aria-label="Category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="tags, comma separated"
            aria-label="Tags"
          />
          <Button className="w-full gap-2" onClick={add}>
            <Plus className="size-4" /> Remember
          </Button>
          <p className="text-xs text-muted-foreground">
            Automatic memory extraction is <strong>PLANNED</strong>: it needs a model provider. Until
            then, proposals shown here are demo data awaiting your approval.
          </p>
        </aside>
      </div>
    </div>
  );
}
