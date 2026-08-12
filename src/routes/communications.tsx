import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/moa/PageHeader";
import { NotConfigured } from "@/components/moa/Status";
import { skillById } from "@/lib/moa/catalog";

export const Route = createFileRoute("/communications")({
  head: () => ({
    meta: [
      { title: "Communications — MOA" },
      { name: "description", content: "Messaging channels and outreach through authorised services only." },
      { property: "og:title", content: "Communications — MOA" },
      { property: "og:description", content: "Messaging channels and outreach through authorised services only." },
    ],
  }),
  component: CommunicationsPage,
});

function CommunicationsPage() {
  const skill = skillById("communications");
  return (
    <div>
      <PageHeader title="Communications" status={skill?.status ?? "NOT CONFIGURED"} description="Messaging channels and outreach through authorised services only." />
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="moa-panel p-4">
          <h2 className="font-display text-base font-semibold">Channels</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {["Email", "SMS", "Chat platforms", "Voice calls"].map((c) => (
              <li key={c} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <span>{c}</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-warning">not configured</span>
              </li>
            ))}
          </ul>
        </section>
        <NotConfigured
          title="Communications provider"
          requires={["Channel provider authorisation", "Explicit send permission"]}
          description="The interface is real. No provider is connected, so MOA will not produce results here."
        />
      </div>
    </div>
  );
}
