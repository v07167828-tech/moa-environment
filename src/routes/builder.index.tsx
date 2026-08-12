import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/moa/PageHeader";
import { StatusBadge } from "@/components/moa/Status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMoa, uid } from "@/lib/moa/store";

export const Route = createFileRoute("/builder/")({
  head: () => ({
    meta: [
      { title: "Builder — MOA" },
      { name: "description", content: "A development workspace where MOA plans, generates, tests and proposes projects for approval." },
      { property: "og:title", content: "Builder — MOA" },
      { property: "og:description", content: "MOA's project builder workspace." },
    ],
  }),
  component: BuilderHome,
});

const STAGES = ["Requirements", "Decompose", "Architecture", "Generate", "Test", "Correct", "Review", "Approve", "Export"];

function BuilderHome() {
  const { state, update } = useMoa();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [technology, setTechnology] = useState("React + TypeScript");

  const create = () => {
    if (!name.trim()) return;
    update((s) => {
      s.builderProjects.unshift({
        id: uid("b"),
        name: name.trim(),
        description: description.trim(),
        technology,
        status: "draft",
        buildStatus: "not started",
        testStatus: "not run",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        tasks: [
          { id: uid("t"), title: "Understand requirements", stage: "understand", status: "blocked", detail: "Model provider required" },
          { id: uid("t"), title: "Decompose task", stage: "decompose", status: "pending" },
          { id: uid("t"), title: "Draft architecture", stage: "architecture", status: "pending" },
          { id: uid("t"), title: "Generate files", stage: "generate", status: "pending" },
          { id: uid("t"), title: "Run tests", stage: "test", status: "pending" },
          { id: uid("t"), title: "Self review", stage: "review", status: "pending" },
          { id: uid("t"), title: "User approval", stage: "approve", status: "pending" },
        ],
        files: [],
        logs: [{ at: Date.now(), level: "info", text: "Project created. Generation blocked: no model provider." }],
      });
      return s;
    });
    setName("");
    setDescription("");
  };

  return (
    <div>
      <PageHeader
        title="Builder"
        status="PROTOTYPE"
        description="MOA never modifies a project silently. Every change is proposed, inspected and approved."
      />

      <section className="moa-panel mb-5 flex flex-wrap items-center gap-2 p-3 text-xs text-muted-foreground">
        {STAGES.map((s, i) => (
          <span key={s} className="flex items-center gap-2">
            <span className="rounded-full border border-border px-2.5 py-1 font-mono uppercase tracking-widest">{s}</span>
            {i < STAGES.length - 1 && <span aria-hidden>→</span>}
          </span>
        ))}
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
        <ul className="space-y-3">
          {state.builderProjects.map((p) => (
            <li key={p.id}>
              <Link
                to="/builder/$projectId"
                params={{ projectId: p.id }}
                className="moa-panel moa-rise block p-4 hover:border-primary/40"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-display text-base font-semibold">{p.name}</h2>
                  <StatusBadge status={p.status === "approved" ? "IMPLEMENTED" : "PROTOTYPE"} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
                <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  {p.technology} · status {p.status} · build {p.buildStatus} · tests {p.testStatus} ·{" "}
                  {p.files.length} files
                </p>
              </Link>
            </li>
          ))}
          {state.builderProjects.length === 0 && (
            <li className="moa-panel p-8 text-center text-sm text-muted-foreground">No projects yet.</li>
          )}
        </ul>

        <aside className="moa-panel h-fit space-y-3 p-4">
          <h2 className="font-display text-base font-semibold">New project</h2>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name" aria-label="Project name" />
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Requirements: what should it do?"
            aria-label="Requirements"
          />
          <Input value={technology} onChange={(e) => setTechnology(e.target.value)} aria-label="Technology" />
          <Button className="w-full gap-2" onClick={create}>
            <Plus className="size-4" /> Create project
          </Button>
          <p className="text-xs text-muted-foreground">
            Projects are created with a real task pipeline. Generation stays blocked until a model provider and
            repository access exist.
          </p>
        </aside>
      </div>
    </div>
  );
}
