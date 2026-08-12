import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/moa/PageHeader";
import { useMoa } from "@/lib/moa/store";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/permissions")({
  head: () => ({
    meta: [
      { title: "Permissions — MOA" },
      { name: "description", content: "Every capability MOA can use, granted explicitly and revocable at any time." },
      { property: "og:title", content: "Permissions — MOA" },
      { property: "og:description", content: "Explicit, user-controlled permissions for MOA." },
    ],
  }),
  component: PermissionsPage,
});

function PermissionsPage() {
  const { state, update } = useMoa();
  const groups = Array.from(new Set(state.permissions.map((p) => p.skill)));

  return (
    <div>
      <PageHeader
        title="Permissions"
        status="IMPLEMENTED"
        description="Nothing is granted implicitly. Permissions marked as needing a provider stay inert until that provider exists."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {groups.map((g) => (
          <section key={g} className="moa-panel p-4">
            <h2 className="mb-3 font-display text-base font-semibold">{g}</h2>
            <ul className="space-y-3">
              {state.permissions
                .filter((p) => p.skill === g)
                .map((p) => (
                  <li key={p.id} className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{p.label}</p>
                      <p className="text-xs text-muted-foreground">{p.description}</p>
                      {p.requiresProvider && (
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-warning">
                          provider required
                        </p>
                      )}
                    </div>
                    <Switch
                      checked={p.granted}
                      aria-label={`Toggle ${p.label}`}
                      onCheckedChange={(v) => {
                        update((s) => {
                          const t = s.permissions.find((x) => x.id === p.id);
                          if (t) t.granted = v;
                          return s;
                        });
                        if (v && p.requiresProvider)
                          toast.warning("Granted, but still inert", {
                            description: "No provider is connected for this capability yet.",
                          });
                      }}
                    />
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
