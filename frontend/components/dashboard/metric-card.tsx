import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { InfoTooltip } from "@/components/ui/info-tooltip";

export function MetricCard({
  label,
  value,
  delta,
  tooltip
}: {
  label: string;
  value: string;
  delta: string;
  tooltip: ReactNode;
}) {
  return (
    <Card className="min-h-[208px] rounded-[30px]">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm uppercase tracking-[0.22em] text-[color:var(--muted)]">{label}</div>
        <InfoTooltip label={`Explain ${label}`}>{tooltip}</InfoTooltip>
      </div>
      <div className="mt-8 text-5xl font-semibold tracking-tight text-[color:var(--foreground)]">{value}</div>
      <div className="mt-4 text-sm leading-6 text-[color:var(--muted)]">{delta}</div>
    </Card>
  );
}
