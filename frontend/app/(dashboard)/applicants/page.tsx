import Link from "next/link";

import { ManualEntryForm } from "@/components/applicants/manual-entry-form";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { Input } from "@/components/ui/input";
import { ModeSwitch } from "@/components/ui/mode-switch";
import { RiskBadge } from "@/components/ui/risk-badge";
import { Select } from "@/components/ui/select";
import { ServerErrorState } from "@/components/ui/server-error-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { WorkspaceBootstrapCard } from "@/components/workspace/workspace-bootstrap-card";
import { rethrowIfNavigationError } from "@/lib/next-navigation-error";
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

  let userLabel = "Workspace assistance";
  let applicants: ApplicantListResponse | null = null;

  try {
    const user = await fetchUserProfile();
    userLabel = user.full_name;
    applicants = await fetchServerJson<ApplicantListResponse>(`/applicants?${query.toString()}`);
  } catch (error) {
    rethrowIfNavigationError(error);
  }

  if (!applicants) {
    return (
      <section className="pb-10">
        <Topbar
          title="Applicants"
          eyebrow="Manual review queue"
          userLabel={userLabel}
          description="The review queue is available, but the live applicant list is reconnecting."
        />
        <ServerErrorState
          title="Applicants could not be loaded right now."
          description="Search results, score bands, and record details are temporarily unavailable. The page will recover automatically once the backend returns the applicant feed."
          retryHref={query.toString() ? `/applicants?${query.toString()}` : "/applicants"}
          secondaryHref="/imports"
          secondaryLabel="Open imports"
        />
      </section>
    );
  }

  return (
    <section className="pb-10">
      <Topbar
        title="Applicants"
        eyebrow="Manual review queue"
        userLabel={userLabel}
        description="Search, filter, and inspect scored applicants, then add new names manually or route users to the CSV schema when they need bulk intake."
      />

      <div className="mb-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <SectionHeading
            title="Review filters"
            description="Use search, score band filters, and mode switching to narrow the live review queue."
            tooltip="Probability of default and score band move with the selected scoring mode, so compare deterministic and logistic views when deciding which cases need manual review."
          />
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <form className="grid gap-3 md:grid-cols-[1fr_180px_auto]" action="/applicants">
              <input type="hidden" name="mode" value={mode} />
              <Input name="search" defaultValue={search} placeholder="Search name or email" />
              <Select name="band" defaultValue={band}>
                <option value="">All bands</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
              <button
                className="inline-flex items-center justify-center rounded-2xl border border-[color:var(--foreground)] bg-[color:var(--foreground)] px-4 py-3 text-sm font-semibold text-white"
                type="submit"
              >
                Apply filters
              </button>
            </form>

            <ModeSwitch pathname="/applicants" mode={mode} query={{ search, band }} />
          </div>
        </Card>

        <Card>
          <SectionHeading
            title="Intake shortcuts"
            description="Move directly from applicant review into manual entry or bulk onboarding."
            tooltip="Start with manual entry when you want to test one customer. Use imports when you are ready to load a full cohort with the correct schema."
          />
          <div className="space-y-4">
            <div className="rounded-[22px] border border-[color:var(--line)] bg-[color:var(--card)] px-4 py-4 text-sm leading-6 text-[color:var(--muted)]">
              Need the expected headers? Download the applicant and payment templates from imports before you prepare a bulk file. The same workspace will accept South
              African rand, UK pound, and US dollar regions automatically.
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/imports#csv-templates"
                className="inline-flex items-center rounded-2xl border border-[color:var(--signal-strong)] bg-[color:var(--signal-strong)] px-4 py-2 text-sm font-semibold text-white"
              >
                Open CSV templates
              </Link>
              <Link
                href="#manual-entry"
                className="inline-flex items-center rounded-2xl border border-[color:var(--line)] bg-[color:var(--card)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)]"
              >
                Jump to manual entry
              </Link>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <Card>
          <SectionHeading
            title="Applicant list"
            description={`${applicants.total} records in the current view. Use the list to prioritize who needs explanation, intervention, or follow-up.`}
            tooltip="PD is probability of default. Score is the raw numeric risk score. Band is the business-friendly grouping used for triage and reporting."
          />

          {applicants.total ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-[color:var(--line)] text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
                  <tr>
                    <th className="pb-3">Applicant</th>
                    <th className="pb-3">Region</th>
                    <th className="pb-3">Income</th>
                    <th className="pb-3">Request</th>
                    <th className="pb-3">
                      <span className="inline-flex items-center gap-2">
                        PD
                        <InfoTooltip label="Explain PD">
                          Probability of default estimates the likelihood of non-payment under the selected scoring mode. It is shown as a percentage for easier review.
                        </InfoTooltip>
                      </span>
                    </th>
                    <th className="pb-3">
                      <span className="inline-flex items-center gap-2">
                        Score
                        <InfoTooltip label="Explain score">
                          The raw score is the numeric output of the selected scoring mode. Higher values indicate more portfolio risk pressure and usually move the band upward.
                        </InfoTooltip>
                      </span>
                    </th>
                    <th className="pb-3">Band</th>
                  </tr>
                </thead>
                <tbody>
                  {applicants.items.map((applicant) => (
                    <tr key={applicant.id} className="border-b border-[color:var(--line)]/70 last:border-b-0">
                      <td className="py-4 pr-4">
                        <Link href={`/applicants/${applicant.id}`} className="font-semibold text-[color:var(--foreground)] hover:text-[color:var(--signal-strong)]">
                          {applicant.full_name}
                        </Link>
                        <div className="mt-1 text-[color:var(--muted)]">{applicant.email}</div>
                        <div className="mt-1 text-xs uppercase tracking-[0.16em] text-[color:var(--muted)]">{applicant.employment_status}</div>
                      </td>
                      <td className="py-4 pr-4 text-[color:var(--muted)]">{applicant.region}</td>
                      <td className="py-4 pr-4 text-[color:var(--muted)]">
                        {formatCurrency(applicant.annual_income, { region: applicant.region })}
                      </td>
                      <td className="py-4 pr-4 text-[color:var(--muted)]">
                        {formatCurrency(applicant.requested_amount, { region: applicant.region })}
                      </td>
                      <td className="py-4 pr-4 font-medium text-[color:var(--foreground)]">{formatPercent(applicant.latest_probability_default)}</td>
                      <td className="py-4 pr-4 font-semibold text-[color:var(--foreground)]">{applicant.latest_score.toFixed(1)}</td>
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
                <div className="rounded-[24px] border border-dashed border-[color:var(--line)] bg-[color:var(--card)] px-5 py-8 text-center text-sm text-[color:var(--muted)]">
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
