import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/moa/PageHeader";
import { StatusBadge } from "@/components/moa/Status";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMoa } from "@/lib/moa/store";
import { toast } from "sonner";

export const Route = createFileRoute("/builder/$projectId")({
  head: () => ({
    meta: [
      { title: "Builder project — MOA" },
      { name: "description", content: "Tasks, generated files, logs, tests and the approval workflow for a MOA Builder project." },
      { property: "og:title", content: "Builder project — MOA" },
      { property: "og:description", content: "Inspect and approve a MOA Builder project." },
    ],
  }),
  component: ProjectPage,
});

function ProjectPage() {
  const { projectId } = Route.useParams();
  const { state, update } = useMoa();
  const project = state.builderProjects.find((p) => p.id === projectId);
  const [selected, setSelected] = useState(0);

  if (!project) {
    return (
      <div className="moa-panel p-8 text-center">
        <p className="text-sm text-muted-foreground">Project not found.</p>
        <Button className="mt-4" asChild>
          <Link to="/builder">Back to Builder</Link>
        </Button>
      </div>
    );
  }

  const file = project.files[selected];

  const decide = (decision: "approved" | "rejected") => {
    update((s) => {
      const p = s.builderProjects.find((x) => x.id === projectId);
      if (p?.proposal) p.proposal.decision = decision;
      if (p && decision === "approved") p.status = "approved";
      return s;
    });
    toast.success(`Change ${decision}`);
  };

  return (
    <div>
      <PageHeader
        title={project.name}
        status="PROTOTYPE"
        description={project.description}
        actions={
          <Button variant="secondary" asChild>
            <Link to="/builder">All projects</Link>
          </Button>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Status", project.status],
          ["Build", project.buildStatus],
          ["Tests", project.testStatus],
          ["Files", String(project.files.length)],
        ].map(([k, v]) => (
          <div key={k} className="moa-panel p-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{k}</p>
            <p className="mt-1 text-sm font-medium">{v}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="tasks">
        <TabsList className="flex-wrap">
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="review">Review</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4">
          <ol className="space-y-2">
            {project.tasks.map((t) => (
              <li key={t.id} className="moa-panel flex items-start justify-between gap-3 p-3">
                <div>
                  <p className="text-sm font-medium">{t.title}</p>
                  <p className="text-xs text-muted-foreground">
                    stage: {t.stage}
                    {t.detail ? ` · ${t.detail}` : ""}
                  </p>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {t.status}
                </span>
              </li>
            ))}
          </ol>
        </TabsContent>

        <TabsContent value="files" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-[16rem_1fr]">
            <ul className="moa-panel h-fit p-2">
              {project.files.map((f, i) => (
                <li key={f.path}>
                  <button
                    type="button"
                    onClick={() => setSelected(i)}
                    className={
                      "w-full truncate rounded-md px-2.5 py-2 text-left font-mono text-xs " +
                      (i === selected ? "bg-accent" : "hover:bg-accent/60")
                    }
                  >
                    {f.path}
                    <span className="ml-2 text-[10px] uppercase text-muted-foreground">{f.change}</span>
                  </button>
                </li>
              ))}
              {project.files.length === 0 && (
                <li className="p-3 text-xs text-muted-foreground">No files generated.</li>
              )}
            </ul>
            <div className="moa-panel overflow-hidden">
              {file ? (
                <>
                  <div className="border-b border-border px-3 py-2 font-mono text-xs text-muted-foreground">
                    {file.path}
                  </div>
                  <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed">{file.content}</pre>
                </>
              ) : (
                <p className="p-8 text-center text-sm text-muted-foreground">
                  Nothing to display. Generation requires a model provider.
                </p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <ul className="moa-panel divide-y divide-border p-0">
            {project.logs.map((l, i) => (
              <li key={i} className="flex items-start gap-3 px-4 py-2 font-mono text-xs">
                <span className="text-muted-foreground">{new Date(l.at).toLocaleTimeString()}</span>
                <span className={l.level === "error" ? "text-destructive" : "text-muted-foreground"}>
                  [{l.level}]
                </span>
                <span>{l.text}</span>
              </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="review" className="mt-4">
          {project.proposal ? (
            <div className="moa-panel space-y-3 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-base font-semibold">{project.proposal.summary}</h2>
                <StatusBadge status={project.proposal.decision === "approved" ? "IMPLEMENTED" : "PROTOTYPE"} />
              </div>
              <p className="text-sm text-muted-foreground">{project.proposal.rationale}</p>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Affected files</p>
                <ul className="mt-1 space-y-1 font-mono text-xs">
                  {project.proposal.files.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => decide("approved")} disabled={project.proposal.decision !== "pending"}>
                  Approve
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => decide("rejected")}
                  disabled={project.proposal.decision !== "pending"}
                >
                  Reject
                </Button>
                <Button variant="ghost" disabled>
                  Deploy (unavailable)
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Decision: {project.proposal.decision}. Deployment needs repository and CI access.
              </p>
            </div>
          ) : (
            <p className="moa-panel p-8 text-center text-sm text-muted-foreground">
              No proposed change awaiting review.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
