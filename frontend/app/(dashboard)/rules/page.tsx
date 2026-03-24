import { RulesEditor } from "@/components/rules/rules-editor";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { ServerErrorState } from "@/components/ui/server-error-state";
import { rethrowIfNavigationError } from "@/lib/next-navigation-error";
import { fetchServerJson } from "@/lib/server-api";
import { fetchUserProfile } from "@/lib/server-data";
import { type ScoringRule } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function RulesPage() {
  let userLabel = "Workspace assistance";
  let rules: ScoringRule[] | null = null;

  try {
    const user = await fetchUserProfile();
    userLabel = user.full_name;
    rules = await fetchServerJson<ScoringRule[]>("/rules");
  } catch (error) {
    rethrowIfNavigationError(error);
  }

  if (!rules) {
    return (
      <section className="pb-10">
        <Topbar
          title="Scoring rules"
          eyebrow="Policy configuration"
          userLabel={userLabel}
          description="The rules workspace is available, but the live policy controls are reconnecting."
        />
        <ServerErrorState
          title="Scoring rules could not be loaded right now."
          description="Rule thresholds, weights, and activation states are temporarily unavailable. This fallback prevents the page from crashing while the backend finishes serving the policy payload."
          retryHref="/rules"
          secondaryHref="/dashboard"
          secondaryLabel="Back to dashboard"
        />
      </section>
    );
  }

  return (
    <section className="pb-10">
      <Topbar
        title="Scoring rules"
        eyebrow="Policy configuration"
        userLabel={userLabel}
        description="Adjust rule names, thresholds, weights, and activation states with clearer alignment so policy decisions are easier to review, explain, and defend."
      />
      <Card className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-[color:var(--foreground)]">Deterministic policy controls</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--muted)]">
              Each rule represents one business signal in the score. Saving changes will rescore the current workspace so the downstream dashboard, applicants, and reports stay aligned.
            </p>
          </div>
          <InfoTooltip label="How deterministic rules work">
            Weight controls impact size, threshold controls when the rule triggers, and priority controls how the rule is ordered. Disabled rules stay visible but stop influencing the score.
          </InfoTooltip>
        </div>
      </Card>
      <RulesEditor initialRules={rules} />
    </section>
  );
}
