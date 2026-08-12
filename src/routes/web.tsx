import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/moa/PageHeader";
import { NotConfigured } from "@/components/moa/Status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/web")({
  head: () => ({
    meta: [
      { title: "Web — MOA" },
      { name: "description", content: "Search and browsing skill for MOA, with an explicit not-configured state." },
      { property: "og:title", content: "Web — MOA" },
      { property: "og:description", content: "MOA's web search and browsing skill." },
    ],
  }),
  component: WebPage,
});

function WebPage() {
  const [q, setQ] = useState("");
  const [attempted, setAttempted] = useState(false);

  return (
    <div>
      <PageHeader
        title="Web"
        status="NOT CONFIGURED"
        description="Search the open internet and read sources. MOA never invents results."
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="moa-panel space-y-3 p-4">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setAttempted(true);
            }}
          >
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the web" aria-label="Web search query" />
            <Button type="submit" className="gap-2">
              <Search className="size-4" /> Search
            </Button>
          </form>
          {attempted && (
            <div className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-warning">
              WEB SEARCH NOT CONFIGURED — no search provider is connected, so no results were returned.
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Results, source citations and reader view render here once a provider is authorised.
          </p>
        </section>
        <NotConfigured
          title="Search provider"
          requires={["Search API key", "Internet access permission"]}
          description="Connect a search provider to enable queries, result lists and page reading."
        />
      </div>
    </div>
  );
}
