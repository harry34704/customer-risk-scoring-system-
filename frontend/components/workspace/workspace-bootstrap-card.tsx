"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart3, DatabaseZap, FileUp, PenSquare } from "lucide-react";
import { useState } from "react";

import { fetchClientJson } from "@/lib/api";
import { type WorkspaceBootstrapResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type WorkspaceBootstrapCardProps = {
  title: string;
  description: string;
  compact?: boolean;
};

export function WorkspaceBootstrapCard({
  title,
  description,
  compact = false
}: WorkspaceBootstrapCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleBootstrap() {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetchClientJson<WorkspaceBootstrapResponse>("/settings/bootstrap-demo", {
        method: "POST"
      });
      setMessage(response.message);
      router.refresh();
    } catch (bootstrapError) {
      setError(bootstrapError instanceof Error ? bootstrapError.message : "Unable to load demo workspace");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className={compact ? "" : "border-dashed border-slate-300 bg-white/85"}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            <DatabaseZap className="h-4 w-4" />
            Demo workspace
          </div>
          <h3 className="text-xl font-semibold text-ink">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>

          <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3">
              <div className="flex items-center gap-2 font-semibold text-ink">
                <BarChart3 className="h-4 w-4 text-signal" />
                500 applicants
              </div>
              <div className="mt-1 text-slate-500">Seed realistic credit, income, payment, and cohort trend data.</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3">
              <div className="flex items-center gap-2 font-semibold text-ink">
                <PenSquare className="h-4 w-4 text-signal" />
                Personal rules
              </div>
              <div className="mt-1 text-slate-500">Your rule edits and rescoring stay isolated to this workspace.</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3">
              <div className="flex items-center gap-2 font-semibold text-ink">
                <FileUp className="h-4 w-4 text-signal" />
                CSV-ready
              </div>
              <div className="mt-1 text-slate-500">Import your own applicants later without losing the empty-state setup path.</div>
            </div>
          </div>

          {message ? <p className="mt-4 text-sm font-medium text-emerald-700">{message}</p> : null}
          {error ? <p className="mt-4 text-sm font-medium text-rose-700">{error}</p> : null}
        </div>

        <div className="flex w-full flex-col gap-3 lg:w-auto">
          <Button className="whitespace-nowrap" onClick={() => void handleBootstrap()} disabled={loading}>
            {loading ? "Loading demo portfolio..." : "Load demo workspace"}
          </Button>
          <Link
            href="/imports"
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-slate-50"
          >
            Upload CSV instead
          </Link>
          <Link
            href="/applicants#manual-entry"
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-slate-50"
          >
            Create one manually
          </Link>
        </div>
      </div>
    </Card>
  );
}
