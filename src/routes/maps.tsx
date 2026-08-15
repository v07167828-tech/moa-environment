import { createFileRoute } from "@tanstack/react-router";
import { LocateFixed, MapPin, ShieldAlert, Users } from "lucide-react";
import { createFileRoute as _unused } from "@tanstack/react-router";
import { PageHeader } from "@/components/moa/PageHeader";
import { NotConfigured, StatusBadge } from "@/components/moa/Status";
import { skillById } from "@/lib/moa/catalog";
import { useMoa } from "@/lib/moa/store";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/maps")({
  head: () => ({
    meta: [
      { title: "Maps — MOA" },
      { name: "description", content: "Places, directions and navigation assistance for MOA." },
      { property: "og:title", content: "Maps — MOA" },
      { property: "og:description", content: "Places, directions and navigation assistance for MOA." },
    ],
  }),
  component: MapsPage,
});

const PERMISSION_LABEL: Record<string, string> = {
  unknown: "Not requested",
  prompt: "Awaiting your choice",
  granted: "Granted",
  denied: "Denied",
  unsupported: "Unsupported on this device",
};

function MapsPage() {
  const skill = skillById("maps");
  const { state, requestLocation, setLocationSharing, update } = useMoa();
  const loc = state.location;

  return (
    <div>
      <PageHeader
        title="Maps"
        status={skill?.status ?? "NOT CONFIGURED"}
        description="Places, directions and navigation assistance for MOA."
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="moa-panel p-4">
          <div className="grid h-56 place-items-center rounded-lg border border-dashed border-border text-center text-sm text-muted-foreground">
            {loc.last ? (
              <div className="space-y-1">
                <MapPin className="mx-auto size-5 text-primary" aria-hidden />
                <p className="font-mono text-xs text-foreground">
                  {loc.last.lat.toFixed(5)}, {loc.last.lng.toFixed(5)}
                </p>
                <p className="text-xs">±{Math.round(loc.last.accuracy)} m accuracy</p>
                <p className="text-xs">Updated {new Date(loc.last.at).toLocaleTimeString()}</p>
                <p className="pt-1 text-[11px]">Map tiles require a maps provider.</p>
              </div>
            ) : (
              "MAP TILES NOT CONFIGURED"
            )}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Place search, routes and turn-by-turn guidance mount in this panel once a maps provider
            is connected. Your coordinates above come from this device only.
          </p>
        </section>

        <section className="moa-panel space-y-4 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-base font-semibold">Location</h3>
              <p className="text-xs text-muted-foreground">
                Permission: {PERMISSION_LABEL[loc.permission] ?? loc.permission}
              </p>
            </div>
            <StatusBadge status={loc.permission === "granted" ? "IMPLEMENTED" : "NOT CONFIGURED"} />
          </div>

          <Button className="gap-2" onClick={() => void requestLocation()}>
            <LocateFixed className="size-4" />
            {loc.permission === "granted" ? "Refresh position" : "Request location access"}
          </Button>

          {loc.permission === "denied" && (
            <p className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
              Location was denied. Re-enable it for this site in your browser settings, then request
              again.
            </p>
          )}

          <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
            <Label htmlFor="loc-share" className="text-sm">
              Share location with MOA
              <span className="block text-xs font-normal text-muted-foreground">
                Keeps your position updated while on. Turning it off clears the last position.
              </span>
            </Label>
            <Switch
              id="loc-share"
              checked={loc.sharing}
              onCheckedChange={(v) => {
                if (v) void requestLocation();
                else setLocationSharing(false);
              }}
            />
          </div>

          {loc.sharing && (
            <Button variant="secondary" className="w-full" onClick={() => setLocationSharing(false)}>
              Stop sharing now
            </Button>
          )}

          <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 opacity-80">
            <Label htmlFor="loc-people" className="text-sm">
              <span className="flex items-center gap-2">
                <Users className="size-4" aria-hidden /> Share with other people
              </span>
              <span className="block text-xs font-normal text-muted-foreground">
                Realtime sharing between users is NOT live — it needs a backend. The switch only
                records your intent locally.
              </span>
            </Label>
            <Switch
              id="loc-people"
              checked={loc.shareWithPeople}
              disabled={!loc.sharing}
              onCheckedChange={(v) =>
                update((s) => {
                  s.location.shareWithPeople = v;
                  return s;
                })
              }
            />
          </div>
        </section>

        <NotConfigured
          title="Maps provider"
          requires={["Maps provider API key", "Routing service", "Realtime backend for people sharing"]}
          description="Location capture is real and runs on this device. Map tiles, place search and multi-user sharing still require connected infrastructure."
        />
      </div>
    </div>
  );
}
