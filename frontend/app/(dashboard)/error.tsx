"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function DashboardError({
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
    <div className="mx-auto max-w-[840px] py-12">
      <Card className="rounded-[32px] p-8">
        <div className="flex items-center gap-3 text-[color:var(--danger)]">
          <AlertTriangle className="h-6 w-6" />
          <div className="text-sm font-semibold uppercase tracking-[0.18em]">Dashboard unavailable</div>
        </div>
        <h2 className="mt-4 text-3xl font-semibold text-[color:var(--foreground)]">The workspace hit a temporary server issue.</h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[color:var(--muted)]">
          This usually means the frontend was updated before the API finished redeploying, or the backend returned an incomplete payload. Try again in a few seconds.
        </p>
        {error.digest ? (
          <div className="mt-4 rounded-[22px] border border-[color:var(--line)] bg-[color:var(--card)] px-4 py-4 text-sm text-[color:var(--muted)]">
            Reference digest: {error.digest}
          </div>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <Button className="gap-2" onClick={() => reset()}>
            <RefreshCcw className="h-4 w-4" />
            Retry page
          </Button>
          <a
            href="/settings"
            className="inline-flex items-center rounded-2xl border border-[color:var(--line)] bg-[color:var(--card)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)]"
          >
            Open settings
          </a>
        </div>
      </Card>
    </div>
  );
}
