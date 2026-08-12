import { createFileRoute } from "@tanstack/react-router";
import { useMoa } from "@/lib/moa/store";
import { StatusBadge } from "@/components/moa/Status";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/settings/accounts")({
  head: () => ({
    meta: [
      { title: "Connected accounts — Settings" },
      { name: "description", content: "Authorise, inspect and disconnect the external services MOA can use." },
      { property: "og:title", content: "Connected accounts — Settings" },
      { property: "og:description", content: "Provider authorisation for MOA." },
    ],
  }),
  component: AccountsPage,
});

function AccountsPage() {
  const { state, update } = useMoa();

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        MOA only acts through services you explicitly authorise. It will never bypass CAPTCHA, phone or identity
        verification, and it cannot connect anything in this prototype because no OAuth backend exists yet.
      </p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {state.accounts.map((a) => (
          <li key={a.id} className="moa-panel flex flex-col gap-2 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-display text-base font-semibold">{a.provider}</h2>
                <p className="text-xs text-muted-foreground">{a.account ?? "No account linked"}</p>
              </div>
              <StatusBadge status={a.status === "connected" ? "CONFIGURED" : "NOT CONFIGURED"} />
            </div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              scopes: {a.scopes.join(", ")}
            </p>
            <div className="mt-auto flex gap-2">
              <Button
                size="sm"
                onClick={() =>
                  toast.error("Authorisation unavailable", {
                    description: "This needs a server-side OAuth flow and provider credentials.",
                  })
                }
              >
                Authorise
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={a.status !== "connected"}
                onClick={() =>
                  update((s) => {
                    const t = s.accounts.find((x) => x.id === a.id);
                    if (t) {
                      t.status = "disconnected";
                      t.account = null;
                    }
                    return s;
                  })
                }
              >
                Disconnect
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
