import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { useMoa } from "@/lib/moa/store";
import { Orb } from "@/components/moa/Orb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { MoaIdentity, OrbState } from "@/lib/moa/types";

export const Route = createFileRoute("/settings/identity")({
  head: () => ({
    meta: [
      { title: "MOA identity — Settings" },
      { name: "description", content: "Choose MOA's orb or your own picture, shape, crop and preview its states." },
      { property: "og:title", content: "MOA identity — Settings" },
      { property: "og:description", content: "Configure how MOA appears to you." },
    ],
  }),
  component: Identity,
});

const STATES: OrbState[] = ["idle", "listening", "thinking", "speaking", "error", "offline"];

function Identity() {
  const { state, update } = useMoa();
  const id = state.identity;
  const fileRef = useRef<HTMLInputElement>(null);

  const patch = (fn: (i: MoaIdentity) => void) =>
    update((s) => {
      fn(s.identity);
      return s;
    });

  const onFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      patch((i) => {
        i.pictureUrl = String(reader.result);
        i.mode = "picture";
      });
    reader.readAsDataURL(file);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="moa-panel space-y-4 p-4">
        <h2 className="font-display text-base font-semibold">Avatar</h2>
        <div className="flex items-center gap-4">
          <Orb size="lg" state="idle" />
          <div className="space-y-2">
            <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
            <Button size="sm" onClick={() => fileRef.current?.click()}>
              {id.pictureUrl ? "Replace picture" : "Upload MOA picture"}
            </Button>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => patch((i) => (i.mode = "orb"))}>
                Use orb
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  patch((i) => {
                    i.pictureUrl = null;
                    i.mode = "orb";
                  })
                }
              >
                Remove picture
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="moa-name">MOA name</Label>
          <Input id="moa-name" value={id.name} onChange={(e) => patch((i) => (i.name = e.target.value))} />
        </div>

        <div className="space-y-1.5">
          <Label>Display shape</Label>
          <div className="flex gap-2">
            {(["circle", "squircle", "square"] as const).map((sh) => (
              <Button
                key={sh}
                size="sm"
                variant={id.shape === sh ? "default" : "secondary"}
                onClick={() => patch((i) => (i.shape = sh))}
              >
                {sh}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Zoom</Label>
          <Slider value={[id.zoom * 100]} min={100} max={250} onValueChange={([v]) => patch((i) => (i.zoom = (v ?? 100) / 100))} />
          <Label>Reposition X</Label>
          <Slider value={[id.offsetX]} min={-50} max={50} onValueChange={([v]) => patch((i) => (i.offsetX = v ?? 0))} />
          <Label>Reposition Y</Label>
          <Slider value={[id.offsetY]} min={-50} max={50} onValueChange={([v]) => patch((i) => (i.offsetY = v ?? 0))} />
        </div>
      </section>

      <section className="moa-panel p-4">
        <h2 className="mb-3 font-display text-base font-semibold">State preview</h2>
        <div className="grid grid-cols-3 gap-4">
          {STATES.map((s) => (
            <div key={s} className="flex flex-col items-center gap-2">
              <Orb size="md" state={s} />
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{s}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          MOA identity is stored per user and never shared between accounts.
        </p>
      </section>
    </div>
  );
}
