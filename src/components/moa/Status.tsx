import { AlertTriangle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CapabilityStatus } from "@/lib/moa/types";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

const styles: Record<CapabilityStatus, string> = {
  IMPLEMENTED: "border-success/40 text-success bg-success/10",
  CONFIGURED: "border-success/40 text-success bg-success/10",
  PROTOTYPE: "border-info/40 text-info bg-info/10",
  "NOT CONFIGURED": "border-warning/40 text-warning bg-warning/10",
  UNAVAILABLE: "border-destructive/40 text-destructive bg-destructive/10",
  PLANNED: "border-border text-muted-foreground bg-muted/40",
};

export function StatusBadge({
  status,
  className,
}: {
  status: CapabilityStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em]",
        styles[status],
        className,
      )}
    >
      {status}
    </span>
  );
}

/** Honest empty state for anything that needs infrastructure we do not have. */
export function NotConfigured({
  title,
  status = "NOT CONFIGURED",
  requires,
  description,
  actionLabel = "Connect a provider",
  actionTo = "/settings/accounts",
}: {
  title: string;
  status?: CapabilityStatus;
  requires: string[];
  description?: string;
  actionLabel?: string;
  actionTo?: string;
}) {
  return (
    <div className="moa-panel flex flex-col items-start gap-4 p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-lg bg-warning/10 text-warning">
          <AlertTriangle className="size-4" aria-hidden />
        </span>
        <div>
          <h3 className="font-display text-base font-semibold">{title}</h3>
          <StatusBadge status={status} className="mt-1" />
        </div>
      </div>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      <div className="w-full">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Requires
        </p>
        <ul className="space-y-1.5">
          {requires.map((r) => (
            <li key={r} className="flex items-center gap-2 text-sm text-foreground/80">
              <Lock className="size-3.5 text-muted-foreground" aria-hidden />
              {r}
            </li>
          ))}
        </ul>
      </div>
      <Button asChild size="sm" variant="secondary">
        <Link to={actionTo}>{actionLabel}</Link>
      </Button>
    </div>
  );
}
