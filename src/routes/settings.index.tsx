import { createFileRoute } from "@tanstack/react-router";
import { useMoa } from "@/lib/moa/store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/settings/")({
  head: () => ({
    meta: [
      { title: "Settings — MOA" },
      { name: "description", content: "Your MOA account, profile and local data controls." },
      { property: "og:title", content: "Settings — MOA" },
      { property: "og:description", content: "Account and data settings for MOA." },
    ],
  }),
  component: General,
});

function General() {
  const { state, update, reset } = useMoa();
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="moa-panel space-y-4 p-4">
        <h2 className="font-display text-base font-semibold">Your profile</h2>
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={state.user.name}
            onChange={(e) =>
              update((s) => {
                s.user.name = e.target.value;
                return s;
              })
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={state.user.email}
            onChange={(e) =>
              update((s) => {
                s.user.email = e.target.value;
                return s;
              })
            }
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Your profile picture and MOA's picture are separate. MOA identity lives in its own tab.
        </p>
      </section>

      <section className="moa-panel space-y-3 p-4">
        <h2 className="font-display text-base font-semibold">Local data</h2>
        <p className="text-sm text-muted-foreground">
          This prototype stores conversations, memory, files, settings and Builder projects in this browser,
          namespaced by user id. No account system is connected yet, so data is not synced or shared.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "moa-export.json";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Export all data
          </Button>
          <Button
            variant="ghost"
            className="text-destructive"
            onClick={() => {
              if (!window.confirm("Reset MOA to defaults? All local data is lost.")) return;
              reset();
              toast.success("MOA reset");
            }}
          >
            Reset everything
          </Button>
        </div>
      </section>
    </div>
  );
}
