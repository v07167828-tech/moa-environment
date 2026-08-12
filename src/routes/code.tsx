import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/moa/PageHeader";
import { NotConfigured } from "@/components/moa/Status";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/code")({
  head: () => ({
    meta: [
      { title: "Code — MOA" },
      { name: "description", content: "Code generation, explanation, editing and debugging surface for MOA." },
      { property: "og:title", content: "Code — MOA" },
      { property: "og:description", content: "MOA's code skill, wired to the Builder workspace." },
    ],
  }),
  component: CodePage,
});

function CodePage() {
  return (
    <div>
      <PageHeader
        title="Code"
        status="PROTOTYPE"
        description="Generation, explanation and repair. Execution needs a sandbox; generation needs a model."
        actions={
          <Button variant="secondary" asChild>
            <Link to="/builder">Open Builder</Link>
          </Button>
        }
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="moa-panel space-y-3 p-4">
          <label className="text-sm font-medium" htmlFor="code-input">
            Describe what you want, or paste code to explain
          </label>
          <Textarea id="code-input" rows={8} placeholder="e.g. explain this reducer and find the bug" />
          <div className="flex flex-wrap gap-2">
            <Button disabled>Generate</Button>
            <Button variant="secondary" disabled>Explain</Button>
            <Button variant="secondary" disabled>Debug</Button>
          </div>
          <p className="text-xs text-muted-foreground">Actions stay disabled until a model provider is connected.</p>
        </section>
        <NotConfigured
          title="Code execution"
          requires={["Model provider", "Execution sandbox", "Repository access"]}
          description="Nothing runs in this environment, so no output is fabricated."
        />
      </div>
    </div>
  );
}
