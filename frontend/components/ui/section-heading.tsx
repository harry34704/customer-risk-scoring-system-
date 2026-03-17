import type { ReactNode } from "react";

import { InfoTooltip } from "@/components/ui/info-tooltip";

export function SectionHeading({
  title,
  description,
  tooltip
}: {
  title: string;
  description?: string;
  tooltip?: ReactNode;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        <h3 className="text-xl font-semibold text-[color:var(--foreground)]">{title}</h3>
        {tooltip ? <InfoTooltip label={`About ${title}`}>{tooltip}</InfoTooltip> : null}
      </div>
      {description ? <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{description}</p> : null}
    </div>
  );
}
