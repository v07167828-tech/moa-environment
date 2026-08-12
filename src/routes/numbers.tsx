import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PhoneCall, Search } from "lucide-react";
import { PageHeader } from "@/components/moa/PageHeader";
import { NotConfigured } from "@/components/moa/Status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMoa, uid } from "@/lib/moa/store";

export const Route = createFileRoute("/numbers")({
  head: () => ({
    meta: [
      { title: "Numbers — MOA" },
      { name: "description", content: "Number provisioning, SMS workflows and number identification through legitimate providers." },
      { property: "og:title", content: "Numbers — MOA" },
      { property: "og:description", content: "MOA number management and identification." },
    ],
  }),
  component: NumbersPage,
});

function NumbersPage() {
  const { state, update } = useMoa();
  const [num, setNum] = useState("");

  const lookup = () => {
    if (!num.trim()) return;
    update((s) => {
      s.lookups.unshift({
        id: uid("lk"),
        number: num.trim(),
        at: Date.now(),
        result: "LOOKUP UNAVAILABLE — no identification provider connected.",
      });
      return s;
    });
    setNum("");
  };

  return (
    <div>
      <PageHeader
        title="Numbers"
        status="NOT CONFIGURED"
        description="Provisioning and SMS require a verified telephony account. MOA never fabricates numbers or messages and never bypasses verification."
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="moa-panel space-y-3 p-4">
          <h2 className="font-display text-base font-semibold">My numbers</h2>
          <div className="grid h-28 place-items-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
            NO NUMBERS — PROVIDER NOT CONNECTED
          </div>
          <Button className="w-full gap-2" disabled>
            <PhoneCall className="size-4" /> Add number
          </Button>
        </section>

        <section className="moa-panel space-y-3 p-4">
          <h2 className="font-display text-base font-semibold">Number identification</h2>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              lookup();
            }}
          >
            <Input value={num} onChange={(e) => setNum(e.target.value)} placeholder="+000 000 0000" aria-label="Number to look up" />
            <Button type="submit" className="gap-2">
              <Search className="size-4" /> Lookup
            </Button>
          </form>
          <ul className="space-y-2">
            {state.lookups.map((l) => (
              <li key={l.id} className="rounded-lg border border-border px-3 py-2 text-sm">
                <p className="font-mono">{l.number}</p>
                <p className="text-xs text-warning">{l.result}</p>
              </li>
            ))}
            {state.lookups.length === 0 && (
              <li className="text-xs text-muted-foreground">Lookup history appears here.</li>
            )}
          </ul>
        </section>

        <NotConfigured
          title="Telephony provider"
          requires={["Telephony provider account", "Identity verification", "SMS webhook endpoint"]}
          description="Numbers, SMS receipt and caller identity all depend on a real, verified provider account."
        />
      </div>
    </div>
  );
}
