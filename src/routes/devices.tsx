import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/moa/PageHeader";
import { NotConfigured, StatusBadge } from "@/components/moa/Status";
import { useMoa } from "@/lib/moa/store";

export const Route = createFileRoute("/devices")({
  head: () => ({
    meta: [
      { title: "Devices — MOA" },
      { name: "description", content: "Future device and computer control surface for MOA, with pairing and permissions." },
      { property: "og:title", content: "Devices — MOA" },
      { property: "og:description", content: "Device control architecture placeholder for MOA." },
    ],
  }),
  component: DevicesPage,
});

function DevicesPage() {
  const { state } = useMoa();
  return (
    <div>
      <PageHeader
        title="Devices"
        status="PLANNED"
        description="Device and computer control is architecture only. Nothing here can execute an action."
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="moa-panel p-4">
          <h2 className="mb-3 font-display text-base font-semibold">Known devices</h2>
          <ul className="space-y-2">
            {state.devices.map((d) => (
              <li key={d.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">{d.name}</span>
                  <StatusBadge status="UNAVAILABLE" />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {d.kind} · actions: {d.actions.join(", ")}
                </p>
              </li>
            ))}
          </ul>
        </section>
        <NotConfigured
          title="Device agent"
          requires={["Device agent app", "Pairing service", "Device control permission"]}
          description="Pairing, action execution and status reporting need an agent running on the device."
        />
      </div>
    </div>
  );
}
