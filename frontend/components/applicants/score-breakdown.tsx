import { Card } from "@/components/ui/card";
import { RiskBadge } from "@/components/ui/risk-badge";
import { type RiskScore } from "@/lib/types";
import { formatPercent, titleCase } from "@/lib/utils";

export function ScoreBreakdown({ score }: { score: RiskScore }) {
  return (
    <Card className="h-full">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{titleCase(score.mode)}</div>
          <h3 className="mt-2 text-2xl font-semibold text-ink">{score.raw_score.toFixed(1)}</h3>
          <p className="mt-1 text-sm text-slate-500">{score.explanation.summary}</p>
        </div>
        <RiskBadge band={score.band} />
      </div>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Probability of default</div>
        <div className="mt-2 text-3xl font-semibold text-ink">{formatPercent(score.probability_default)}</div>
      </div>

      <div className="mt-6 space-y-3">
        {score.factors.map((factor) => (
          <div key={`${score.id}-${factor.feature_key}`} className="rounded-3xl border border-slate-200 bg-white/80 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-ink">{factor.label}</div>
              <div className="text-sm font-semibold text-slate-500">{factor.impact.toFixed(1)} pts</div>
            </div>
            <p className="mt-2 text-sm text-slate-500">{factor.narrative}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

