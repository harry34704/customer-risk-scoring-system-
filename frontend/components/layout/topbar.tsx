import { CalendarDays, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { SignOutButton } from "@/components/layout/sign-out-button";

export function Topbar({
  title,
  eyebrow,
  userLabel
}: {
  title: string;
  eyebrow: string;
  userLabel: string;
}) {
  return (
    <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <Badge>{eyebrow}</Badge>
        <h2 className="mt-4 text-4xl font-semibold tracking-tight text-ink">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Operational risk visibility across rule-based decisions, baseline scoring, trend monitoring, and audit coverage.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="glass rounded-2xl border border-white/80 px-4 py-3 text-sm text-slate-600 shadow-soft">
          <div className="flex items-center gap-2 font-semibold text-slate-700">
            <ShieldCheck className="h-4 w-4 text-signal" />
            {userLabel}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
            <CalendarDays className="h-3.5 w-3.5" />
            Live workspace
          </div>
        </div>
        <SignOutButton />
      </div>
    </header>
  );
}

