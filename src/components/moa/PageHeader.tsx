import type { ReactNode } from "react";
import type { CapabilityStatus } from "@/lib/moa/types";
import { StatusBadge } from "./Status";

export function PageHeader({
  title,
  description,
  status,
  actions,
}: {
  title: string;
  description?: string;
  status?: CapabilityStatus;
  actions?: ReactNode;
}) {
  return (
    <header className="moa-rise mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl font-semibold sm:text-3xl">{title}</h1>
          {status && <StatusBadge status={status} />}
        </div>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
