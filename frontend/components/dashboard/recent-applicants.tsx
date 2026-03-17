import Link from "next/link";

import { Card } from "@/components/ui/card";
import { RiskBadge } from "@/components/ui/risk-badge";
import { type ApplicantListItem } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function RecentApplicants({ applicants }: { applicants: ApplicantListItem[] }) {
  return (
    <Card>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-ink">Recent applicants</h3>
          <p className="text-sm text-slate-500">Latest manually entered or seeded records in the scoring queue.</p>
        </div>
        <Link href="/applicants" className="text-sm font-semibold text-signal">
          View all
        </Link>
      </div>

      {applicants.length ? (
        <div className="space-y-4">
          {applicants.map((applicant) => (
            <Link
              key={applicant.id}
              href={`/applicants/${applicant.id}`}
              className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white/80 p-4 transition hover:-translate-y-0.5 hover:shadow-md lg:flex-row lg:items-center lg:justify-between"
            >
              <div>
                <div className="text-sm font-semibold text-ink">{applicant.full_name}</div>
                <div className="mt-1 text-sm text-slate-500">
                  {applicant.region} · {applicant.employment_status}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="text-sm text-slate-500">{formatCurrency(applicant.requested_amount)}</div>
                <div className="text-sm font-semibold text-ink">{applicant.latest_score.toFixed(1)}</div>
                <RiskBadge band={applicant.latest_band} />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 px-5 py-8 text-center text-sm text-slate-500">
          No applicants in this workspace yet. Load the demo portfolio, import a CSV, or create your first manual record.
        </div>
      )}
    </Card>
  );
}
