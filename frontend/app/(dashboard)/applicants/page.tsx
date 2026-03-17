import Link from "next/link";

import { ManualEntryForm } from "@/components/applicants/manual-entry-form";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { ModeSwitch } from "@/components/ui/mode-switch";
import { RiskBadge } from "@/components/ui/risk-badge";
import { WorkspaceBootstrapCard } from "@/components/workspace/workspace-bootstrap-card";
import { fetchServerJson } from "@/lib/server-api";
import { fetchUserProfile } from "@/lib/server-data";
import { type ApplicantListResponse, type RiskMode } from "@/lib/types";
import { formatCurrency, formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ApplicantsPage({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const mode = ((Array.isArray(searchParams?.mode) ? searchParams?.mode[0] : searchParams?.mode) ??
    "deterministic") as RiskMode;
  const search = Array.isArray(searchParams?.search) ? searchParams?.search[0] : searchParams?.search ?? "";
  const band = Array.isArray(searchParams?.band) ? searchParams?.band[0] : searchParams?.band ?? "";

  const query = new URLSearchParams({
    mode,
    search,
    ...(band ? { band } : {})
  });

  const [user, applicants] = await Promise.all([
    fetchUserProfile(),
    fetchServerJson<ApplicantListResponse>(`/applicants?${query.toString()}`)
  ]);

  return (
    <section className="pb-10">
      <Topbar title="Applicants" eyebrow="Manual review queue" userLabel={user.full_name} />

      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <form className="grid gap-3 md:grid-cols-[1fr_180px_auto]" action="/applicants">
          <input type="hidden" name="mode" value={mode} />
          <input
            name="search"
            defaultValue={search}
            placeholder="Search name or email"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm"
          />
          <select name="band" defaultValue={band} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
            <option value="">All bands</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button className="rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white" type="submit">
            Apply filters
          </button>
        </form>

        <ModeSwitch pathname="/applicants" mode={mode} query={{ search, band }} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <Card className="overflow-hidden">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-ink">Applicant list</h3>
              <p className="text-sm text-slate-500">{applicants.total} records in the current view.</p>
            </div>
          </div>

          {applicants.total ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase tracking-[0.18em] text-slate-400">
                  <tr>
                    <th className="pb-3">Applicant</th>
                    <th className="pb-3">Region</th>
                    <th className="pb-3">Income</th>
                    <th className="pb-3">Request</th>
                    <th className="pb-3">PD</th>
                    <th className="pb-3">Score</th>
                    <th className="pb-3">Band</th>
                  </tr>
                </thead>
                <tbody>
                  {applicants.items.map((applicant) => (
                    <tr key={applicant.id} className="border-b border-slate-100 last:border-b-0">
                      <td className="py-4">
                        <Link href={`/applicants/${applicant.id}`} className="font-semibold text-ink hover:text-signal">
                          {applicant.full_name}
                        </Link>
                        <div className="mt-1 text-slate-500">{applicant.email}</div>
                      </td>
                      <td className="py-4 text-slate-600">{applicant.region}</td>
                      <td className="py-4 text-slate-600">{formatCurrency(applicant.annual_income)}</td>
                      <td className="py-4 text-slate-600">{formatCurrency(applicant.requested_amount)}</td>
                      <td className="py-4 font-medium text-slate-700">{formatPercent(applicant.latest_probability_default)}</td>
                      <td className="py-4 font-semibold text-ink">{applicant.latest_score.toFixed(1)}</td>
                      <td className="py-4">
                        <RiskBadge band={applicant.latest_band} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <>
              {applicants.workspace_total === 0 ? (
                <WorkspaceBootstrapCard
                  compact
                  title="No applicants are in this workspace yet."
                  description="Load the demo portfolio to populate the review queue instantly, or use the manual form alongside this panel to create your first scored applicant."
                />
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 px-5 py-8 text-center text-sm text-slate-500">
                  No applicants match the current filters. Adjust the search term or score band to widen the view.
                </div>
              )}
            </>
          )}
        </Card>

        <div id="manual-entry">
          <ManualEntryForm />
        </div>
      </div>
    </section>
  );
}
