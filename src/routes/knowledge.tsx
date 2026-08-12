import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileText, Globe, Link2, NotebookPen, Plus, Search, Trash2 } from "lucide-react";
import { useMoa, uid } from "@/lib/moa/store";
import type { KnowledgeSource } from "@/lib/moa/types";
import { PageHeader } from "@/components/moa/PageHeader";
import { NotConfigured, StatusBadge } from "@/components/moa/Status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/knowledge")({
  head: () => ({
    meta: [
      { title: "Knowledge — MOA" },
      {
        name: "description",
        content: "Sources MOA can retrieve from: documents, PDFs, notes and websites.",
      },
      { property: "og:title", content: "Knowledge — MOA" },
      { property: "og:description", content: "Manage the sources MOA retrieves knowledge from." },
    ],
  }),
  component: KnowledgePage,
});

const icons = { note: NotebookPen, pdf: FileText, document: FileText, website: Globe } as const;

function KnowledgePage() {
  const { state, update } = useMoa();
  const [q, setQ] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<KnowledgeSource["type"]>("note");

  const sources = state.knowledge.filter((k) => k.title.toLowerCase().includes(q.toLowerCase()));

  const add = () => {
    if (!title.trim()) return;
    update((s) => {
      s.knowledge.unshift({
        id: uid("k"),
        title: title.trim(),
        type,
        location: `local://${type}/${title.trim().toLowerCase().replace(/\s+/g, "-")}`,
        status: "unavailable",
        addedAt: Date.now(),
        chunks: 0,
        summary: "Not indexed — retrieval needs an embedding provider and vector store.",
      });
      return s;
    });
    setTitle("");
  };

  return (
    <div>
      <PageHeader
        title="Knowledge"
        status="PROTOTYPE"
        description="Knowledge is what MOA can look up. It is deliberately separate from memory, which is about you."
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
        <div>
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search sources"
              aria-label="Search knowledge sources"
              className="pl-9"
            />
          </div>
          <ul className="space-y-3">
            {sources.map((k) => {
              const Icon = icons[k.type];
              return (
                <li key={k.id} className="moa-panel moa-rise flex items-start gap-3 p-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent/60 text-primary">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-medium">{k.title}</h3>
                      <StatusBadge status={k.status === "ready" ? "CONFIGURED" : "UNAVAILABLE"} />
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                      <Link2 className="size-3" aria-hidden />
                      <span className="truncate">{k.location}</span>
                    </p>
                    {k.summary && <p className="mt-2 text-sm text-muted-foreground">{k.summary}</p>}
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {k.chunks} indexed chunks · added{" "}
                      {new Date(k.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Delete ${k.title}`}
                    onClick={() =>
                      update((s) => {
                        s.knowledge = s.knowledge.filter((x) => x.id !== k.id);
                        return s;
                      })
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              );
            })}
          </ul>
        </div>

        <aside className="space-y-5">
          <div className="moa-panel space-y-3 p-4">
            <h2 className="font-display text-base font-semibold">Add source</h2>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title or URL"
              aria-label="Source title"
            />
            <Select value={type} onValueChange={(v) => setType(v as KnowledgeSource["type"])}>
              <SelectTrigger aria-label="Source type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="note">Note</SelectItem>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="website">Website</SelectItem>
              </SelectContent>
            </Select>
            <Button className="w-full gap-2" onClick={add}>
              <Plus className="size-4" /> Register source
            </Button>
          </div>
          <NotConfigured
            title="Retrieval"
            requires={["Embedding provider", "Vector store", "Document parser"]}
            description="Sources can be registered and organised now, but MOA cannot search inside them until indexing infrastructure exists."
          />
        </aside>
      </div>
    </div>
  );
}
