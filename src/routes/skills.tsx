import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/moa/PageHeader";
import { StatusBadge } from "@/components/moa/Status";
import { SKILLS } from "@/lib/moa/catalog";
import { useMoa } from "@/lib/moa/store";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/skills")({
  head: () => ({
    meta: [
      { title: "Skills — MOA" },
      { name: "description", content: "Every MOA skill with its honest status, requirements and permissions." },
      { property: "og:title", content: "Skills — MOA" },
      { property: "og:description", content: "MOA's modular skill registry." },
    ],
  }),
  component: SkillsPage,
});

function SkillsPage() {
  const { state, update } = useMoa();

  return (
    <div>
      <PageHeader
        title="Skills"
        status="IMPLEMENTED"
        description="Skills are modular. Adding a capability means registering a skill, not rewriting MOA."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {SKILLS.map((skill) => {
          const enabled = state.skills.find((s) => s.id === skill.id)?.enabled ?? false;
          return (
            <article key={skill.id} className="moa-panel moa-rise flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-base font-semibold">{skill.name}</h2>
                  <StatusBadge status={skill.status} className="mt-1.5" />
                </div>
                <Switch
                  checked={enabled}
                  aria-label={`Enable ${skill.name}`}
                  onCheckedChange={(v) =>
                    update((s) => {
                      const t = s.skills.find((x) => x.id === skill.id);
                      if (t) t.enabled = v;
                      return s;
                    })
                  }
                />
              </div>
              <p className="text-sm text-muted-foreground">{skill.description}</p>
              {skill.requires.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  <span className="font-mono uppercase tracking-widest">requires</span>{" "}
                  {skill.requires.join(", ")}
                </p>
              )}
              {skill.permissions.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  <span className="font-mono uppercase tracking-widest">permissions</span>{" "}
                  {skill.permissions.join(", ")}
                </p>
              )}
              {skill.route && (
                <Link to={skill.route} className="mt-auto text-sm text-primary hover:underline">
                  Open {skill.name} →
                </Link>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
