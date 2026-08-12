import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/moa/PageHeader";
import { NotConfigured } from "@/components/moa/Status";
import { skillById } from "@/lib/moa/catalog";

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

function MapsPage() {
  const skill = skillById("maps");
  return (
    <div>
      <PageHeader title="Maps" status={skill?.status ?? "NOT CONFIGURED"} description="Places, directions and navigation assistance for MOA." />
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="moa-panel p-4">
          <div className="grid h-56 place-items-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
            MAPS NOT CONFIGURED
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Place search, current location, routes and turn-by-turn guidance mount in this panel.
          </p>
        </section>
        <NotConfigured
          title="Maps provider"
          requires={["Maps provider API key", "Location permission", "Routing service"]}
          description="The interface is real. No provider is connected, so MOA will not produce results here."
        />
      </div>
    </div>
  );
}
