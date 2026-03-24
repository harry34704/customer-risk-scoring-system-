import { RescoreButton } from "@/components/applicants/rescore-button";
import { ScoreBreakdown } from "@/components/applicants/score-breakdown";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { RiskBadge } from "@/components/ui/risk-badge";
import { ServerErrorState } from "@/components/ui/server-error-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { rethrowIfNavigationError } from "@/lib/next-navigation-error";
import { fetchServerJson } from "@/lib/server-api";
import { fetchUserProfile } from "@/lib/server-data";
import { type ApplicantDetailResponse } from "@/lib/types";
import { formatCurrency, formatPercent, titleCase } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ApplicantDetailPage({ params }: { params: { id: string } }) {
  let userLabel = "Workspace assistance";
  let detail: ApplicantDetailResponse | null = null;

  try {
    const user = await fetchUserProfile();
    userLabel = user.full_name;
    detail = await fetchServerJson<ApplicantDetailResponse>(`/applicants/${params.id}`);
  } catch (error) {
    rethrowIfNavigationError(error);
  }

  if (!detail) {
    return (
      <section className="pb-10">
        <Topbar
          title="Applicant detail"
          eyebrow="Applicant detail"
          userLabel={userLabel}
          description="The applicant profile is available, but the live detail payload is reconnecting."
        />
        <ServerErrorState
          title="This applicant record could not be loaded right now."
          description="Score breakdowns, payment history, and audit events are temporarily unavailable. Once the backend responds again, this view will recover without needing any data changes."
          retryHref={`/applicants/${params.id}`}
          secondaryHref="/applicants"
          secondaryLabel="Back to applicants"
        />
      </section>
    );
  }

  const deterministic = detail.scores.find((score) => score.mode === "deterministic");
  const logistic = detail.scores.find((score) => score.mode === "logistic");
  const region = detail.applicant.region;

  return (
    <section className="pb-10">
      <Topbar
        title={`${detail.applicant.first_name} ${detail.applicant.last_name}`}
        eyebrow="Applicant detail"
        userLabel={userLabel}
        description="Inspect the customer profile, compare deterministic and logistic scores, and follow the audit trail behind every scoring or update event."
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <RiskBadge band={(deterministic ?? logistic)?.band ?? "medium"} />
        <RescoreButton applicantId={detail.applicant.id} />
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-4">
        <Card>
          <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">Requested amount</div>
          <div className="mt-4 text-3xl font-semibold text-[color:var(--foreground)]">
            {formatCurrency(detail.applicant.financials.requested_amount, { region })}
          </div>
        </Card>
        <Card>
          <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">Annual income</div>
          <div className="mt-4 text-3xl font-semibold text-[color:var(--foreground)]">
            {formatCurrency(detail.applicant.financials.annual_income, { region })}
          </div>
        </Card>
        <Card>
          <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">Credit score</div>
          <div className="mt-4 text-3xl font-semibold text-[color:var(--foreground)]">{detail.applicant.financials.credit_score}</div>
        </Card>
        <Card>
          <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">Debt-to-income</div>
          <div className="mt-4 text-3xl font-semibold text-[color:var(--foreground)]">
            {formatPercent(detail.applicant.financials.debt_to_income_ratio)}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {deterministic ? <ScoreBreakdown score={deterministic} /> : null}
        {logistic ? <ScoreBreakdown score={logistic} /> : null}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <SectionHeading
            title="Payment history"
            description="This timeline shows what was due, what was paid, and how late each repayment was."
            tooltip="Payment history drives recovery ratio, default trends, and the loss watchlist. Partial or late payments are especially important for portfolio operations."
          />
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[color:var(--line)] text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
                <tr>
                  <th className="pb-3">Month</th>
                  <th className="pb-3">Due</th>
                  <th className="pb-3">Paid</th>
                  <th className="pb-3">Days late</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {detail.payment_history.map((row) => (
                  <tr key={row.id} className="border-b border-[color:var(--line)]/70 last:border-b-0">
                    <td className="py-3 text-[color:var(--muted)]">{row.payment_month}</td>
                    <td className="py-3 text-[color:var(--muted)]">{formatCurrency(row.amount_due, { region })}</td>
                    <td className="py-3 text-[color:var(--muted)]">{formatCurrency(row.amount_paid, { region })}</td>
                    <td className="py-3 text-[color:var(--muted)]">{row.days_late}</td>
                    <td className="py-3 font-medium text-[color:var(--foreground)]">{titleCase(row.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <SectionHeading
            title="Audit trail"
            description="Every create, rescore, import, or policy action is recorded so reviewers can trace the operational story."
            tooltip="Audit events are especially useful in demos because they show that the app is not only scoring risk, but also preserving governance context."
          />
          <div className="mt-4 space-y-3">
            {detail.audit_logs.map((log) => (
              <div key={log.id} className="rounded-[24px] border border-[color:var(--line)] bg-[color:var(--card)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-[color:var(--foreground)]">{log.action.replace(/_/g, " ")}</div>
                  <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                  {Object.keys(log.metadata_json).length > 0 ? JSON.stringify(log.metadata_json) : "No additional metadata"}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}
