import Link from "next/link";

import { SectionHeading } from "@/components/ui/section-heading";
import { Card } from "@/components/ui/card";
import { RiskBadge } from "@/components/ui/risk-badge";
import { type DashboardOverview } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function LossWatchlist({ items }: { items: DashboardOverview["loss_watchlist"] }) {
  return (
    <Card>
      <SectionHeading
        title="Recovery gap watchlist"
        description="Applicants with the largest unpaid shortfalls so collections and underwriting teams can see who is driving loss pressure."
        tooltip="Recovery gap equals the cumulative difference between amount due and amount paid. It surfaces where portfolio cash is being left on the table."
      />

      {items.length ? (
        <div className="space-y-3">
          {items.map((item) => (
            <Link
              key={item.applicant_id}
              href={`/applicants/${item.applicant_id}`}
              className="flex flex-col gap-3 rounded-[24px] border border-[color:var(--line)] bg-[color:var(--card)] px-4 py-4 transition hover:-translate-y-0.5 hover:shadow-[var(--surface-shadow-soft)] lg:flex-row lg:items-center lg:justify-between"
            >
              <div>
                <div className="text-base font-semibold text-[color:var(--foreground)]">{item.full_name}</div>
                <div className="mt-1 text-sm text-[color:var(--muted)]">
                  {item.region} · {item.employment_status}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="text-right">
                  <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">Recovery gap</div>
                  <div className="mt-1 text-xl font-semibold text-[color:var(--foreground)]">
                    {formatCurrency(item.amount_lost, { region: item.region })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">Latest score</div>
                  <div className="mt-1 text-xl font-semibold text-[color:var(--foreground)]">{item.latest_score.toFixed(1)}</div>
                </div>
                <RiskBadge band={item.latest_band} />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-[24px] border border-dashed border-[color:var(--line)] bg-[color:var(--card)] px-5 py-8 text-center text-sm text-[color:var(--muted)]">
          No unpaid exposure is visible yet. Once payments miss or partially settle, this watchlist will highlight the applicants driving loss pressure.
        </div>
      )}
    </Card>
  );
}
