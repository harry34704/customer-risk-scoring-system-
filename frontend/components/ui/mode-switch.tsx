import Link from "next/link";

import { type RiskMode } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ModeSwitch({
  pathname,
  mode,
  query
}: {
  pathname: string;
  mode: RiskMode;
  query?: Record<string, string | undefined>;
}) {
  const modes: RiskMode[] = ["deterministic", "logistic"];

  function buildHref(nextMode: RiskMode) {
    const params = new URLSearchParams();
    Object.entries(query ?? {}).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    params.set("mode", nextMode);
    return `${pathname}?${params.toString()}`;
  }

  return (
    <div className="inline-flex rounded-full border border-[color:var(--line)] bg-[color:var(--card-strong)] p-1 shadow-[var(--surface-shadow-soft)]">
      {modes.map((item) => (
        <Link
          key={item}
          href={buildHref(item)}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-semibold capitalize transition",
            mode === item
              ? "bg-[color:var(--signal-strong)] text-white"
              : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
          )}
        >
          {item}
        </Link>
      ))}
    </div>
  );
}
