import { Card } from "@/components/ui/card";
import { ModeSwitch } from "@/components/ui/mode-switch";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { LossWatchlist } from "@/components/dashboard/loss-watchlist";
import { MetricCard as DashboardMetricCard } from "@/components/dashboard/metric-card";
import { RecentApplicants } from "@/components/dashboard/recent-applicants";
import { Topbar } from "@/components/layout/topbar";
import { WorkspaceBootstrapCard } from "@/components/workspace/workspace-bootstrap-card";
import { fetchServerJson } from "@/lib/server-api";
import { fetchUserProfile } from "@/lib/server-data";
import { type DashboardOverview, type RiskMode } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const mode = ((Array.isArray(searchParams?.mode) ? searchParams?.mode[0] : searchParams?.mode) ??
    "deterministic") as RiskMode;

  const [user, overview] = await Promise.all([
    fetchUserProfile(),
    fetchServerJson<DashboardOverview>(`/dashboard/overview?mode=${mode}`)
  ]);

  return (
    <section className="pb-10">
      <Topbar
        title="Portfolio dashboard"
        eyebrow="Risk operations"
        userLabel={user.full_name}
        description="Follow the portfolio journey from intake, scoring, and segmentation to recovery visibility. Every headline metric and chart now explains what it means and why it matters."
      />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <ModeSwitch pathname="/dashboard" mode={mode} />
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-4">
        {overview.summary_cards.map((card) => {
          const tooltipMap: Record<string, string> = {
            Applicants:
              "Total applicants currently scored inside your workspace. This is the base volume the rest of the dashboard is describing.",
            "Average score":
              "The mean raw score for the selected scoring mode. Higher values indicate more overall risk pressure in the active portfolio.",
            "High risk share":
              "The percentage of applicants currently landing in the high-risk band. This helps quantify how much of the portfolio may require tighter review.",
            "Recovery ratio":
              "Collected cash divided by total cash due. Lower values indicate repayment leakage or collection underperformance."
          };
          return (
            <DashboardMetricCard
              key={card.label}
              label={card.label}
              value={card.value}
              delta={card.delta}
              tooltip={tooltipMap[card.label] ?? "This metric summarizes a key operational signal for the current workspace."}
            />
          );
        })}
      </div>

      {overview.is_empty ? (
        <WorkspaceBootstrapCard
          title="This workspace is ready, but it does not have any applicants yet."
          description="Load a demo portfolio to populate the dashboard with realistic applicant cohorts, payment behavior, explainable scores, and exportable reports. If you prefer, you can also import your own CSVs or create one applicant manually."
        />
      ) : (
        <>
          <Card className="mb-6">
            <div className="grid gap-4 xl:grid-cols-3">
              {[
                {
                  step: "1. Intake",
                  title: "Capture or import data",
                  copy: "Applicants can be added manually or through CSV templates with guided schema examples."
                },
                {
                  step: "2. Score",
                  title: "Compare rule and baseline views",
                  copy: "Switch between deterministic policy logic and the logistic baseline to understand both business control and statistical risk."
                },
                {
                  step: "3. Act",
                  title: "Review loss and trend signals",
                  copy: "Use the watchlist, charts, and reports to identify which names need intervention and where the portfolio is drifting."
                }
              ].map((item) => (
                <div key={item.step} className="rounded-[24px] border border-[color:var(--line)] bg-[color:var(--card)] px-5 py-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--signal-strong)]">{item.step}</div>
                  <div className="mt-3 text-lg font-semibold text-[color:var(--foreground)]">{item.title}</div>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{item.copy}</p>
                </div>
              ))}
            </div>
          </Card>

          <DashboardCharts overview={overview} />

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
            <LossWatchlist items={overview.loss_watchlist} />
            <RecentApplicants applicants={overview.recent_applicants} />
          </div>
        </>
      )}
    </section>
  );
}
