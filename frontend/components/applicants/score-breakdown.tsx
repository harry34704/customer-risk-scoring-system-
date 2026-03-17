import { Card } from "@/components/ui/card";
import { RiskBadge } from "@/components/ui/risk-badge";
import { SectionHeading } from "@/components/ui/section-heading";
import { type RiskScore } from "@/lib/types";
import { formatPercent, titleCase } from "@/lib/utils";

export function ScoreBreakdown({ score }: { score: RiskScore }) {
  return (
    <Card className="h-full">
      <div className="flex items-start justify-between gap-3">
        <SectionHeading
          title={`${titleCase(score.mode)} score`}
          description={score.explanation.summary}
          tooltip="The breakdown below highlights the top factors pushing the applicant upward or downward under the selected scoring mode."
        />
        <RiskBadge band={score.band} />
      </div>

      <div className="rounded-[24px] border border-[color:var(--line)] bg-[color:var(--card)] p-4">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">Probability of default</div>
        <div className="mt-2 text-3xl font-semibold text-[color:var(--foreground)]">{formatPercent(score.probability_default)}</div>
        <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
          This is the risk of non-payment expressed as a percentage so underwriters and business stakeholders can interpret it quickly.
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {score.factors.map((factor) => (
          <div key={`${score.id}-${factor.feature_key}`} className="rounded-[24px] border border-[color:var(--line)] bg-[color:var(--card)] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-[color:var(--foreground)]">{factor.label}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.16em] text-[color:var(--muted)]">{factor.feature_key.replace(/_/g, " ")}</div>
              </div>
              <div className="rounded-full border border-[color:var(--line)] bg-[color:var(--card-strong)] px-3 py-1 text-sm font-semibold text-[color:var(--signal-strong)]">
                {factor.impact.toFixed(1)} pts
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{factor.narrative}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
