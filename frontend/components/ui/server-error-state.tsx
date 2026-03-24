import Link from "next/link";
import { AlertTriangle, RefreshCcw, Settings2 } from "lucide-react";

import { Card } from "@/components/ui/card";

export function ServerErrorState({
  title,
  description,
  retryHref,
  secondaryHref = "/settings",
  secondaryLabel = "Open settings"
}: {
  title: string;
  description: string;
  retryHref: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <Card className="rounded-[32px] p-8">
      <div className="flex items-center gap-3 text-[color:var(--danger)]">
        <AlertTriangle className="h-6 w-6" />
        <div className="text-sm font-semibold uppercase tracking-[0.18em]">Live data unavailable</div>
      </div>
      <h3 className="mt-4 text-3xl font-semibold text-[color:var(--foreground)]">{title}</h3>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">{description}</p>
      <div className="mt-4 rounded-[22px] border border-[color:var(--line)] bg-[color:var(--card)] px-4 py-4 text-sm leading-6 text-[color:var(--muted)]">
        This usually happens when the API is still redeploying, the session can load but supporting data has not returned yet, or the backend responded with an incomplete
        payload. The page is staying available so the workspace feels stable while the data reconnects.
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={retryHref}
          className="inline-flex items-center gap-2 rounded-2xl border border-[color:var(--signal-strong)] bg-[color:var(--signal-strong)] px-4 py-2 text-sm font-semibold text-white"
        >
          <RefreshCcw className="h-4 w-4" />
          Retry page
        </Link>
        <Link
          href={secondaryHref}
          className="inline-flex items-center gap-2 rounded-2xl border border-[color:var(--line)] bg-[color:var(--card)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)]"
        >
          <Settings2 className="h-4 w-4" />
          {secondaryLabel}
        </Link>
      </div>
    </Card>
  );
}
