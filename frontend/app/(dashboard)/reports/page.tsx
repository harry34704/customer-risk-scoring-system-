import { MetricCard as DashboardMetricCard } from "@/components/dashboard/metric-card";
import { Topbar } from "@/components/layout/topbar";
import { ReportActions } from "@/components/reports/report-actions";
import { Card } from "@/components/ui/card";
import { ModeSwitch } from "@/components/ui/mode-switch";
import { SectionHeading } from "@/components/ui/section-heading";
import { ServerErrorState } from "@/components/ui/server-error-state";
import { WorkspaceBootstrapCard } from "@/components/workspace/workspace-bootstrap-card";
import { rethrowIfNavigationError } from "@/lib/next-navigation-error";
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

  let userLabel = "Workspace assistance";
  let report: ReportSummary | null = null;

  try {
    const user = await fetchUserProfile();
    userLabel = user.full_name;
    report = await fetchServerJson<ReportSummary>(`/reports/summary?mode=${mode}`);
  } catch (error) {
    rethrowIfNavigationError(error);
  }

  if (!report) {
    return (
      <section className="pb-10">
        <Topbar
          title="Reports"
          eyebrow="Portfolio exports"
          userLabel={userLabel}
          description="The reporting workspace is still available, but the live summary feed is reconnecting."
        />
        <ServerErrorState
          title="Report data could not be loaded right now."
          description="Export summaries, top regions, and cohort trends are temporarily unavailable. Once the backend finishes responding, this page will resume normally."
          retryHref={`/reports?mode=${mode}`}
          secondaryHref="/dashboard"
          secondaryLabel="Back to dashboard"
        />
      </section>
    );
  }

  return (
    <section className="pb-10">
      <Topbar
        title="Reports"
        eyebrow="Portfolio exports"
        userLabel={userLabel}
        description="Summarize the portfolio for a stakeholder, explain what the statistics mean, and export the evidence as CSV or printable PDF."
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <ModeSwitch pathname="/reports" mode={mode} />
        {report.total_applicants ? <ReportActions mode={mode} /> : null}
      </div>

      {report.total_applicants ? (
        <>
          <div className="mb-6 grid gap-4 xl:grid-cols-4">
            <DashboardMetricCard
              label="Applicants"
              value={String(report.total_applicants)}
              delta="Total records included in the active export view."
              tooltip="This is the report population. Any average or share on this screen is calculated from these applicants only."
            />
            <DashboardMetricCard
              label="Average score"
              value={report.average_score.toFixed(1)}
              delta="Mean raw score across the selected scoring mode."
              tooltip="Average score helps you explain overall portfolio risk level at a glance. Higher scores indicate a riskier portfolio mix."
            />
            <DashboardMetricCard
              label="High risk share"
              value={formatPercent(report.high_risk_share)}
              delta="Share of applicants currently landing in the high-risk band."
              tooltip="This is useful for policy conversations because it shows how much of the book would likely require stronger review or tighter conditions."
            />
            <DashboardMetricCard
              label="Average PD"
              value={formatPercent(report.average_probability_default)}
              delta="Mean probability of default across the active portfolio."
              tooltip="PD stands for probability of default. It provides a percent-based interpretation of expected non-payment risk."
            />
          </div>

          <div className="mb-6 grid gap-6 xl:grid-cols-2">
            <Card>
              <SectionHeading
                title="How to read this report"
                description="Use deterministic mode when you want policy governance. Use logistic mode when you want a statistical comparison point."
                tooltip="The same portfolio can look different under business rules and the logistic baseline. That comparison is the core value of this reporting view."
              />
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-[22px] border border-[color:var(--line)] bg-[color:var(--card)] px-4 py-4 text-sm leading-6 text-[color:var(--muted)]">
                  <span className="font-semibold text-[color:var(--foreground)]">Deterministic:</span> rule-driven, explainable, and easier to tie directly back to policy decisions.
                </div>
                <div className="rounded-[22px] border border-[color:var(--line)] bg-[color:var(--card)] px-4 py-4 text-sm leading-6 text-[color:var(--muted)]">
                  <span className="font-semibold text-[color:var(--foreground)]">Logistic:</span> baseline probability model that helps teams compare intuition against a simple statistical signal.
                </div>
              </div>
            </Card>

            <Card>
              <SectionHeading
                title="Export semantics"
                description="CSV is better for analyst workflows and spreadsheet review. PDF is better for handoff and portfolio storytelling."
                tooltip="Both exports use the active scoring mode, so switch modes before downloading if you want to compare rule and baseline output separately."
              />
              <div className="space-y-3">
                <div className="rounded-[22px] border border-[color:var(--line)] bg-[color:var(--card)] px-4 py-4 text-sm leading-6 text-[color:var(--muted)]">
                  CSV includes row-level data for downstream analysis and audit traceability.
                </div>
                <div className="rounded-[22px] border border-[color:var(--line)] bg-[color:var(--card)] px-4 py-4 text-sm leading-6 text-[color:var(--muted)]">
                  PDF packages portfolio metrics, regional summaries, and trend cues into a cleaner stakeholder-facing document.
                </div>
              </div>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <SectionHeading
                title="Top regions"
                description="Regional concentration helps you explain where the portfolio is strongest, stretched, or simply most exposed by volume."
                tooltip="Average score by region is useful for comparing territory-level risk pressure, not just total applicant counts."
              />
              <div className="mt-4 space-y-3">
                {report.top_regions.map((row) => (
                  <div key={row.region} className="flex items-center justify-between rounded-[24px] border border-[color:var(--line)] bg-[color:var(--card)] px-4 py-4">
                    <div>
                      <div className="font-semibold text-[color:var(--foreground)]">{row.region}</div>
                      <div className="text-sm text-[color:var(--muted)]">{row.volume} applicants</div>
                    </div>
                    <div className="text-lg font-semibold text-[color:var(--foreground)]">{row.average_score.toFixed(1)}</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <SectionHeading
                title="Cohort trend"
                description="Track whether more recent applicant cohorts are becoming healthier or riskier over time."
                tooltip="Cohort trend compares average score by applicant creation month. It is a useful leading signal for portfolio drift."
              />
              <div className="mt-4 space-y-3">
                {report.cohort_trends.map((row) => (
                  <div key={row.month} className="flex items-center justify-between rounded-[24px] border border-[color:var(--line)] bg-[color:var(--card)] px-4 py-4">
                    <div className="font-semibold text-[color:var(--foreground)]">{row.month}</div>
                    <div className="text-lg font-semibold text-[color:var(--foreground)]">{row.average_score.toFixed(1)}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      ) : (
        <WorkspaceBootstrapCard
          title="Reports need a portfolio before they can tell a story."
          description="Load the demo workspace to generate exportable CSV and PDF outputs with regional summaries, cohort trends, and average probability of default metrics."
        />
      )}
    </section>
  );
}
