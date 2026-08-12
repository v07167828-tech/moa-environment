import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { useMoa } from "@/lib/moa/store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import type { Appearance } from "@/lib/moa/types";

export const Route = createFileRoute("/settings/appearance")({
  head: () => ({
    meta: [
      { title: "Appearance — Settings" },
      { name: "description", content: "Background, theme, density, font size, motion and glow controls for MOA." },
      { property: "og:title", content: "Appearance — Settings" },
      { property: "og:description", content: "Full control over how MOA looks." },
    ],
  }),
  component: AppearancePage,
});

const PRESETS: Record<string, Partial<Appearance>> = {
  default: { backgroundMode: "gradient", gradientFrom: "#0b1016", gradientTo: "#123039", gradientAngle: 155, transparency: 72, glow: true, theme: "dark" },
  midnight: { backgroundMode: "solid", solidColor: "#05070c", transparency: 84, glow: false, theme: "dark" },
  aurora: { backgroundMode: "gradient", gradientFrom: "#06202a", gradientTo: "#2b1147", gradientAngle: 210, transparency: 66, glow: true, theme: "dark" },
  minimal: { backgroundMode: "solid", solidColor: "#f4f5f7", transparency: 96, glow: false, theme: "light" },
  glass: { backgroundMode: "gradient", gradientFrom: "#101820", gradientTo: "#0a2f36", gradientAngle: 120, transparency: 40, glow: true, theme: "dark" },
};

function AppearancePage() {
  const { state, update } = useMoa();
  const a = state.appearance;
  const fileRef = useRef<HTMLInputElement>(null);

  const patch = (fn: (x: Appearance) => void) =>
    update((s) => {
      fn(s.appearance);
      return s;
    });

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="moa-panel space-y-4 p-4">
        <h2 className="font-display text-base font-semibold">Background</h2>
        <div className="flex flex-wrap gap-2">
          {(["solid", "gradient", "image"] as const).map((m) => (
            <Button key={m} size="sm" variant={a.backgroundMode === m ? "default" : "secondary"} onClick={() => patch((x) => (x.backgroundMode = m))}>
              {m}
            </Button>
          ))}
        </div>

        {a.backgroundMode === "solid" && (
          <div className="space-y-1.5">
            <Label htmlFor="solid">Colour</Label>
            <Input id="solid" type="color" value={a.solidColor} onChange={(e) => patch((x) => (x.solidColor = e.target.value))} className="h-10 w-24 p-1" />
          </div>
        )}

        {a.backgroundMode === "gradient" && (
          <div className="space-y-2">
            <div className="flex gap-3">
              <div>
                <Label htmlFor="g1">From</Label>
                <Input id="g1" type="color" value={a.gradientFrom} onChange={(e) => patch((x) => (x.gradientFrom = e.target.value))} className="h-10 w-24 p-1" />
              </div>
              <div>
                <Label htmlFor="g2">To</Label>
                <Input id="g2" type="color" value={a.gradientTo} onChange={(e) => patch((x) => (x.gradientTo = e.target.value))} className="h-10 w-24 p-1" />
              </div>
            </div>
            <Label>Direction {a.gradientAngle}°</Label>
            <Slider value={[a.gradientAngle]} max={360} onValueChange={([v]) => patch((x) => (x.gradientAngle = v ?? 0))} />
          </div>
        )}

        {a.backgroundMode === "image" && (
          <div className="space-y-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => patch((x) => (x.imageUrl = String(reader.result)));
                reader.readAsDataURL(file);
              }}
            />
            <Button size="sm" onClick={() => fileRef.current?.click()}>Upload wallpaper</Button>
            <div className="flex gap-2">
              {(["cover", "contain"] as const).map((fit) => (
                <Button key={fit} size="sm" variant={a.imageFit === fit ? "default" : "secondary"} onClick={() => patch((x) => (x.imageFit = fit))}>
                  {fit}
                </Button>
              ))}
            </div>
            <Label>Position X</Label>
            <Slider value={[a.imagePositionX]} max={100} onValueChange={([v]) => patch((x) => (x.imagePositionX = v ?? 50))} />
            <Label>Position Y</Label>
            <Slider value={[a.imagePositionY]} max={100} onValueChange={([v]) => patch((x) => (x.imagePositionY = v ?? 50))} />
            <Label>Opacity</Label>
            <Slider value={[a.imageOpacity * 100]} max={100} onValueChange={([v]) => patch((x) => (x.imageOpacity = (v ?? 60) / 100))} />
            <Label>Blur</Label>
            <Slider value={[a.imageBlur]} max={30} onValueChange={([v]) => patch((x) => (x.imageBlur = v ?? 0))} />
          </div>
        )}

        <div>
          <Label>Presets</Label>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {Object.keys(PRESETS).map((p) => (
              <Button
                key={p}
                size="sm"
                variant={a.preset === p ? "default" : "secondary"}
                onClick={() =>
                  patch((x) => {
                    Object.assign(x, PRESETS[p]);
                    x.preset = p as Appearance["preset"];
                  })
                }
              >
                {p}
              </Button>
            ))}
            <Button size="sm" variant={a.preset === "custom" ? "default" : "ghost"} onClick={() => patch((x) => (x.preset = "custom"))}>
              custom
            </Button>
          </div>
        </div>
      </section>

      <section className="moa-panel space-y-4 p-4">
        <h2 className="font-display text-base font-semibold">Interface</h2>
        <div>
          <Label>Theme</Label>
          <div className="mt-1.5 flex gap-2">
            {(["dark", "light", "system"] as const).map((t) => (
              <Button key={t} size="sm" variant={a.theme === t ? "default" : "secondary"} onClick={() => patch((x) => (x.theme = t))}>
                {t}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <Label>Chat density</Label>
          <div className="mt-1.5 flex gap-2">
            {(["compact", "comfortable", "spacious"] as const).map((d) => (
              <Button key={d} size="sm" variant={a.density === d ? "default" : "secondary"} onClick={() => patch((x) => (x.density = d))}>
                {d}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <Label>Message appearance</Label>
          <div className="mt-1.5 flex gap-2">
            {(["bubble", "flat"] as const).map((b) => (
              <Button key={b} size="sm" variant={a.bubbleStyle === b ? "default" : "secondary"} onClick={() => patch((x) => (x.bubbleStyle = b))}>
                {b}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <Label>Surface transparency {a.transparency}%</Label>
          <Slider value={[a.transparency]} max={100} onValueChange={([v]) => patch((x) => (x.transparency = v ?? 70))} />
        </div>
        <div>
          <Label>Font size {a.fontSize}px</Label>
          <Slider value={[a.fontSize]} min={13} max={20} onValueChange={([v]) => patch((x) => (x.fontSize = v ?? 16))} />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="anim">Animations</Label>
          <Switch id="anim" checked={a.animations} onCheckedChange={(v) => patch((x) => (x.animations = v))} />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="glow">Glow effects</Label>
          <Switch id="glow" checked={a.glow} onCheckedChange={(v) => patch((x) => (x.glow = v))} />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="rm">Reduced motion</Label>
          <Switch id="rm" checked={a.reducedMotion} onCheckedChange={(v) => patch((x) => (x.reducedMotion = v))} />
        </div>
      </section>
    </div>
  );
}
