import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, CircleDashed, CircleSlash, Loader2, XCircle } from "lucide-react";
import { PageHeader } from "@/components/moa/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMoa, uid } from "@/lib/moa/store";
import type { PlannerRun } from "@/lib/moa/types";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "Planner — MOA" },
      { name: "description", content: "Goal decomposition, tool selection, execution and correction, made visible." },
      { property: "og:title", content: "Planner — MOA" },
      { property: "og:description", content: "How MOA turns a goal into steps and tools." },
    ],
  }),
  component: PlannerPage,
});

const STEP_ICON = {
  pending: CircleDashed,
  running: Loader2,
  done: CheckCircle2,
  failed: XCircle,
  blocked: CircleSlash,
} as const;

const PIPELINE = ["Goal", "Understand", "Plan", "Select tools", "Execute", "Inspect", "Correct", "Respond"];

function PlannerPage() {
  const { state, update } = useMoa();
  const [goal, setGoal] = useState("");

  const createRun = () => {
    if (!goal.trim()) return;
    const run: PlannerRun = {
      id: uid("p"),
      goal: goal.trim(),
      createdAt: Date.now(),
      status: "blocked",
      steps: [
        { id: uid("s"), title: "Understand the goal", status: "blocked", result: "Needs model provider" },
        { id: uid("s"), title: "Decompose into steps", status: "pending" },
        { id: uid("s"), title: "Select tools", status: "pending" },
        { id: uid("s"), title: "Execute", status: "pending" },
        { id: uid("s"), title: "Inspect and correct", status: "pending" },
      ],
    };
    update((s) => {
      s.plannerRuns.unshift(run);
      return s;
    });
    setGoal("");
  };

  return (
    <div>
      <PageHeader
        title="Planner"
        status="PROTOTYPE"
        description="Plans are structured and inspectable. Execution stays blocked until a model and tool runtime exist."
      />

      <section className="moa-panel mb-5 flex flex-wrap items-center gap-2 p-3 text-xs text-muted-foreground">
        {PIPELINE.map((p, i) => (
          <span key={p} className="flex items-center gap-2">
            <span className="rounded-full border border-border px-2.5 py-1 font-mono uppercase tracking-widest">
              {p}
            </span>
            {i < PIPELINE.length - 1 && <span aria-hidden>→</span>}
          </span>
        ))}
      </section>

      <form
        className="mb-5 flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          createRun();
        }}
      >
        <Input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Give MOA a goal…" aria-label="Goal" />
        <Button type="submit">Create plan</Button>
      </form>

      <ul className="space-y-4">
        {state.plannerRuns.map((run) => (
          <li key={run.id} className="moa-panel moa-rise p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-base font-semibold">{run.goal}</h2>
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {run.status} · {new Date(run.createdAt).toLocaleDateString()}
              </span>
            </div>
            <ol className="mt-3 space-y-2">
              {run.steps.map((step) => {
                const Icon = STEP_ICON[step.status];
                return (
                  <li key={step.id} className="flex items-start gap-3 text-sm">
                    <Icon
                      className={
                        "mt-0.5 size-4 shrink-0 " +
                        (step.status === "done"
                          ? "text-success"
                          : step.status === "failed"
                            ? "text-destructive"
                            : step.status === "blocked"
                              ? "text-warning"
                              : "text-muted-foreground")
                      }
                      aria-hidden
                    />
                    <span className="min-w-0">
                      <span className="block">{step.title}</span>
                      <span className="block text-xs text-muted-foreground">
                        {step.tool ? `tool: ${step.tool} · ` : ""}
                        {step.result ?? step.status}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ol>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="secondary" disabled>
                Retry failed step
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  update((s) => {
                    s.plannerRuns = s.plannerRuns.filter((x) => x.id !== run.id);
                    return s;
                  })
                }
              >
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
