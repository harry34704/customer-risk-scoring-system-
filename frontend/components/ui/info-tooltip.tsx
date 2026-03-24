import { Info } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function InfoTooltip({
  label,
  children,
  className,
  align = "center"
}: {
  label: string;
  children: ReactNode;
  className?: string;
  align?: "start" | "center" | "end";
}) {
  const alignmentClass =
    align === "start" ? "left-0 translate-x-0" : align === "end" ? "right-0 translate-x-0" : "left-1/2 -translate-x-1/2";

  return (
    <span className={cn("group relative inline-flex", className)}>
      <button
        type="button"
        aria-label={label}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[color:var(--line)] bg-[color:var(--card-strong)] text-[color:var(--muted)] transition hover:text-[color:var(--signal-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--signal-soft)]"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      <span
        className={cn(
          "pointer-events-none absolute top-full z-50 mt-3 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-[color:var(--line)] bg-[color:var(--card-strong)] px-4 py-3 text-left text-sm leading-6 text-[color:var(--muted)] opacity-0 shadow-[var(--surface-shadow-soft)] transition duration-150 ease-out group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 invisible translate-y-1",
          alignmentClass
        )}
      >
        {children}
      </span>
    </span>
  );
}
