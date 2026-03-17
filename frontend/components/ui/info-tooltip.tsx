import { Info } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function InfoTooltip({
  label,
  children,
  className
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("group relative inline-flex", className)}>
      <button
        type="button"
        aria-label={label}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[color:var(--line)] bg-[color:var(--card-strong)] text-[color:var(--muted)] transition hover:text-[color:var(--signal-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--signal-soft)]"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      <span className="pointer-events-none absolute left-1/2 top-full z-30 mt-3 hidden w-72 -translate-x-1/2 rounded-2xl border border-[color:var(--line)] bg-[color:var(--card-strong)] px-4 py-3 text-left text-sm leading-6 text-[color:var(--muted)] shadow-[var(--surface-shadow-soft)] group-hover:block group-focus-within:block">
        {children}
      </span>
    </span>
  );
}
