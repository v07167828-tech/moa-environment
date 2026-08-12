import { createFileRoute } from "@tanstack/react-router";
import { useMoa } from "@/lib/moa/store";
import { MODELS } from "@/lib/moa/catalog";
import { StatusBadge } from "@/components/moa/Status";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/settings/model")({
  head: () => ({
    meta: [
      { title: "Models — Settings" },
      { name: "description", content: "Model router architecture: general, reasoning, coding, vision and local models." },
      { property: "og:title", content: "Models — Settings" },
      { property: "og:description", content: "Choose and inspect MOA's models." },
    ],
  }),
  component: ModelPage,
});

function ModelPage() {
  const { state, update } = useMoa();

  return (
    <div className="space-y-5">
      <section className="moa-panel p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold">Automatic routing</h2>
            <p className="text-sm text-muted-foreground">
              Task → classification → model selection → execution. Not implemented: the classifier needs a model.
            </p>
          </div>
          <Switch
            checked={state.model.autoRouting}
            aria-label="Automatic routing"
            onCheckedChange={(v) =>
              update((s) => {
                s.model.autoRouting = v;
                return s;
              })
            }
          />
        </div>
      </section>

      <ul className="grid gap-3 sm:grid-cols-2">
        {MODELS.map((m) => (
          <li key={m.id} className="moa-panel flex flex-col gap-2 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-display text-base font-semibold">{m.name}</h3>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{m.type}</p>
              </div>
              <StatusBadge status={m.availability} />
            </div>
            <p className="text-sm text-muted-foreground">{m.note}</p>
            <Button
              size="sm"
              variant={state.model.activeId === m.id ? "default" : "secondary"}
              className="mt-auto"
              onClick={() =>
                update((s) => {
                  s.model.activeId = m.id;
                  return s;
                })
              }
            >
              {state.model.activeId === m.id ? "Selected" : "Select"}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
