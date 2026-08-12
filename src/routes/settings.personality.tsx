import { createFileRoute } from "@tanstack/react-router";
import { useMoa } from "@/lib/moa/store";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import type { Personality } from "@/lib/moa/types";

export const Route = createFileRoute("/settings/personality")({
  head: () => ({
    meta: [
      { title: "Personality — Settings" },
      { name: "description", content: "Tune MOA's tone, verbosity, formality and behaviour preferences." },
      { property: "og:title", content: "Personality — Settings" },
      { property: "og:description", content: "How MOA should speak and behave." },
    ],
  }),
  component: PersonalityPage,
});

function PersonalityPage() {
  const { state, update } = useMoa();
  const p = state.personality;
  const patch = (fn: (x: Personality) => void) =>
    update((s) => {
      fn(s.personality);
      return s;
    });

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="moa-panel space-y-4 p-4">
        <h2 className="font-display text-base font-semibold">Behaviour</h2>
        <div>
          <Label>Tone</Label>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {(["warm", "neutral", "direct", "playful"] as const).map((t) => (
              <Button key={t} size="sm" variant={p.tone === t ? "default" : "secondary"} onClick={() => patch((x) => (x.tone = t))}>
                {t}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <Label>Verbosity {p.verbosity}</Label>
          <Slider value={[p.verbosity]} max={100} onValueChange={([v]) => patch((x) => (x.verbosity = v ?? 50))} />
        </div>
        <div>
          <Label>Formality {p.formality}</Label>
          <Slider value={[p.formality]} max={100} onValueChange={([v]) => patch((x) => (x.formality = v ?? 50))} />
        </div>
        <div>
          <Label>Proactivity {p.proactivity}</Label>
          <Slider value={[p.proactivity]} max={100} onValueChange={([v]) => patch((x) => (x.proactivity = v ?? 50))} />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="emoji">Allow emoji</Label>
          <Switch id="emoji" checked={p.emojis} onCheckedChange={(v) => patch((x) => (x.emojis = v))} />
        </div>
      </section>

      <section className="moa-panel space-y-4 p-4">
        <h2 className="font-display text-base font-semibold">Personality notes</h2>
        <Textarea rows={6} value={p.notes} onChange={(e) => patch((x) => (x.notes = e.target.value))} aria-label="Personality notes" />
        <Label htmlFor="style">Communication style</Label>
        <Textarea id="style" rows={4} value={p.style} onChange={(e) => patch((x) => (x.style = e.target.value))} />
        <p className="text-xs text-muted-foreground">
          These settings are stored and will be sent as system context once a model provider is connected. They do
          not change MOA's behaviour today because no model is running.
        </p>
      </section>
    </div>
  );
}
