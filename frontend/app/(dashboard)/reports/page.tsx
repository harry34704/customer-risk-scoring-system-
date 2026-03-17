import { ReportActions } from "@/components/reports/report-actions";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { ModeSwitch } from "@/components/ui/mode-switch";
import { fetchServerJson } from "@/lib/server-api";
import { fetchUserProfile } from "@/lib/server-data";
import { type ReportSummary, type RiskMode } from "@/lib/types";
import { formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ReportsPage({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const mode = ((Array.isArray(searchParams?.mode) ? searchParams?.mode[0] : searchParams?.mode) ??
    "deterministic") as RiskMode;

  const [user, report] = await Promise.all([
    fetchUserProfile(),
    fetchServerJson<ReportSummary>(`/reports/summary?mode=${mode}`)
  ]);

  return (
    <section className="pb-10">
      <Topbar title="Reports" eyebrow="Portfolio exports" userLabel={user.full_name} />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <ModeSwitch pathname="/reports" mode={mode} />
        <ReportActions mode={mode} />
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-4">
        <Card>
          <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Applicants</div>
          <div className="mt-4 text-4xl font-semibold text-ink">{report.total_applicants}</div>
        </Card>
        <Card>
          <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Average score</div>
          <div className="mt-4 text-4xl font-semibold text-ink">{report.average_score.toFixed(1)}</div>
        </Card>
        <Card>
          <div className="text-xs uppercase tracking-[0.18em] text-slate-400">High risk share</div>
          <div className="mt-4 text-4xl font-semibold text-ink">{formatPercent(report.high_risk_share)}</div>
        </Card>
        <Card>
          <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Average PD</div>
          <div className="mt-4 text-4xl font-semibold text-ink">{formatPercent(report.average_probability_default)}</div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold text-ink">Top regions</h3>
          <div className="mt-4 space-y-3">
            {report.top_regions.map((row) => (
              <div key={row.region} className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white/80 px-4 py-3">
                <div>
                  <div className="font-semibold text-ink">{row.region}</div>
                  <div className="text-sm text-slate-500">{row.volume} applicants</div>
                </div>
                <div className="text-lg font-semibold text-slate-700">{row.average_score.toFixed(1)}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-ink">Cohort trend</h3>
          <div className="mt-4 space-y-3">
            {report.cohort_trends.map((row) => (
              <div key={row.month} className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white/80 px-4 py-3">
                <div className="font-semibold text-ink">{row.month}</div>
                <div className="text-lg font-semibold text-slate-700">{row.average_score.toFixed(1)}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}
