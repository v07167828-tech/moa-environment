import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/moa/PageHeader";
import { NotConfigured } from "@/components/moa/Status";
import { skillById } from "@/lib/moa/catalog";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Email — MOA" },
      { name: "description", content: "Inbox, compose, reply and send from mailboxes you authorise." },
      { property: "og:title", content: "Email — MOA" },
      { property: "og:description", content: "Inbox, compose, reply and send from mailboxes you authorise." },
    ],
  }),
  component: EmailPage,
});

function EmailPage() {
  const skill = skillById("email");
  return (
    <div>
      <PageHeader title="Email" status={skill?.status ?? "NOT CONFIGURED"} description="Inbox, compose, reply and send from mailboxes you authorise." />
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="moa-panel p-4">
          <h2 className="font-display text-base font-semibold">Inbox</h2>
          <div className="mt-3 grid h-40 place-items-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
            NO MAILBOX AUTHORISED
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Reading, search, threads, drafts, attachments and compose appear here once an account is connected.
          </p>
        </section>
        <NotConfigured
          title="Email provider"
          requires={["Mail account authorisation", "OAuth client", "Send permission"]}
          description="The interface is real. No provider is connected, so MOA will not produce results here."
        />
      </div>
    </div>
  );
}
