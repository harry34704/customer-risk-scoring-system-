import { RescoreButton } from "@/components/applicants/rescore-button";
import { ScoreBreakdown } from "@/components/applicants/score-breakdown";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { RiskBadge } from "@/components/ui/risk-badge";
import { fetchServerJson } from "@/lib/server-api";
import { fetchUserProfile } from "@/lib/server-data";
import { type ApplicantDetailResponse } from "@/lib/types";
import { formatCurrency, formatPercent, titleCase } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ApplicantDetailPage({ params }: { params: { id: string } }) {
  const [user, detail] = await Promise.all([
    fetchUserProfile(),
    fetchServerJson<ApplicantDetailResponse>(`/applicants/${params.id}`)
  ]);

  const deterministic = detail.scores.find((score) => score.mode === "deterministic");
  const logistic = detail.scores.find((score) => score.mode === "logistic");

  return (
    <section className="pb-10">
      <Topbar
        title={`${detail.applicant.first_name} ${detail.applicant.last_name}`}
        eyebrow="Applicant detail"
        userLabel={user.full_name}
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <RiskBadge band={(deterministic ?? logistic)?.band ?? "medium"} />
        <RescoreButton applicantId={detail.applicant.id} />
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-4">
        <Card>
          <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Requested amount</div>
          <div className="mt-4 text-3xl font-semibold text-ink">{formatCurrency(detail.applicant.financials.requested_amount)}</div>
        </Card>
        <Card>
          <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Annual income</div>
          <div className="mt-4 text-3xl font-semibold text-ink">{formatCurrency(detail.applicant.financials.annual_income)}</div>
        </Card>
        <Card>
          <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Credit score</div>
          <div className="mt-4 text-3xl font-semibold text-ink">{detail.applicant.financials.credit_score}</div>
        </Card>
        <Card>
          <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Debt-to-income</div>
          <div className="mt-4 text-3xl font-semibold text-ink">{formatPercent(detail.applicant.financials.debt_to_income_ratio)}</div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {deterministic ? <ScoreBreakdown score={deterministic} /> : null}
        {logistic ? <ScoreBreakdown score={logistic} /> : null}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <h3 className="text-lg font-semibold text-ink">Payment history</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-[0.18em] text-slate-400">
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
                  <tr key={row.id} className="border-b border-slate-100 last:border-b-0">
                    <td className="py-3 text-slate-600">{row.payment_month}</td>
                    <td className="py-3 text-slate-600">{formatCurrency(row.amount_due)}</td>
                    <td className="py-3 text-slate-600">{formatCurrency(row.amount_paid)}</td>
                    <td className="py-3 text-slate-600">{row.days_late}</td>
                    <td className="py-3 font-medium text-slate-700">{titleCase(row.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-ink">Audit trail</h3>
          <div className="mt-4 space-y-3">
            {detail.audit_logs.map((log) => (
              <div key={log.id} className="rounded-3xl border border-slate-200 bg-white/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-ink">{log.action.replace(/_/g, " ")}</div>
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">{new Date(log.created_at).toLocaleString()}</div>
                </div>
                <div className="mt-2 text-sm text-slate-500">
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
