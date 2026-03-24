"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react";
import { useEffect } from "react";

import { Card } from "@/components/ui/card";

export default function AppError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-[900px] px-4 py-12">
      <Card className="rounded-[32px] p-8">
        <div className="flex items-center gap-3 text-[color:var(--danger)]">
          <AlertTriangle className="h-6 w-6" />
          <div className="text-sm font-semibold uppercase tracking-[0.18em]">Application temporarily unavailable</div>
        </div>
        <h2 className="mt-4 text-3xl font-semibold text-[color:var(--foreground)]">We hit a server-side issue while rendering this page.</h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
          The app now catches most backend data failures before they turn into a hard crash, but this fallback is here in case something still escapes. Try the page
          again, or move back to the dashboard and settings while the service reconnects.
        </p>
        {error.digest ? (
          <div className="mt-4 rounded-[22px] border border-[color:var(--line)] bg-[color:var(--card)] px-4 py-4 text-sm text-[color:var(--muted)]">
            Reference digest: {error.digest}
          </div>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="inline-flex items-center gap-2 rounded-2xl border border-[color:var(--signal-strong)] bg-[color:var(--signal-strong)] px-4 py-2 text-sm font-semibold text-white"
            onClick={() => reset()}
            type="button"
          >
            <RefreshCcw className="h-4 w-4" />
            Retry page
          </button>
          <a
            href="/dashboard"
            className="inline-flex items-center rounded-2xl border border-[color:var(--line)] bg-[color:var(--card)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)]"
          >
            Open dashboard
          </a>
        </div>
      </Card>
    </div>
  );
}
