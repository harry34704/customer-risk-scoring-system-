import { CalendarDays, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { InfoTooltip } from "@/components/ui/info-tooltip";

export function Topbar({
  title,
  eyebrow,
  userLabel,
  description
}: {
  title: string;
  eyebrow: string;
  userLabel: string;
  description?: string;
}) {
  return (
    <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <Badge>{eyebrow}</Badge>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <h2 className="text-4xl font-semibold tracking-tight text-[color:var(--foreground)]">{title}</h2>
          <InfoTooltip label={`About ${title}`} align="start">
            This workspace is designed to help analysts understand how portfolio risk is created, explained, and operationalized across imports, scoring, review, and reporting.
          </InfoTooltip>
        </div>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
          {description ??
            "Operational risk visibility across rule-based decisions, baseline scoring, trend monitoring, audit coverage, and educational guidance for reviewers."}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="glass rounded-2xl border border-[color:var(--line)] px-4 py-3 text-sm text-[color:var(--muted)] shadow-[var(--surface-shadow-soft)]">
          <div className="flex items-center gap-2 font-semibold text-[color:var(--foreground)]">
            <ShieldCheck className="h-4 w-4 text-[color:var(--signal-strong)]" />
            {userLabel}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
            <CalendarDays className="h-3.5 w-3.5" />
            Live workspace
          </div>
        </div>
        <SignOutButton />
      </div>
    </header>
  );
}
