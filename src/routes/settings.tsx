import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { PageHeader } from "@/components/moa/PageHeader";

export const Route = createFileRoute("/settings")({
  component: SettingsLayout,
});

const TABS = [
  { to: "/settings", label: "General" },
  { to: "/settings/appearance", label: "Appearance" },
  { to: "/settings/identity", label: "MOA identity" },
  { to: "/settings/personality", label: "Personality" },
  { to: "/settings/model", label: "Model" },
  { to: "/settings/accounts", label: "Accounts" },
] as const;

function SettingsLayout() {
  return (
    <div>
      <PageHeader title="Settings" description="Everything here is stored per user on this device." />
      <nav aria-label="Settings sections" className="mb-5 flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            activeOptions={{ exact: t.to === "/settings" }}
            className="rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent data-[status=active]:bg-accent data-[status=active]:text-foreground"
          >
            {t.label}
          </Link>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
