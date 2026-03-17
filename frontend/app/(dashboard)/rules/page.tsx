import { RulesEditor } from "@/components/rules/rules-editor";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { fetchServerJson } from "@/lib/server-api";
import { fetchUserProfile } from "@/lib/server-data";
import { type ScoringRule } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function RulesPage() {
  const [user, rules] = await Promise.all([
    fetchUserProfile(),
    fetchServerJson<ScoringRule[]>("/rules")
  ]);

  return (
    <section className="pb-10">
      <Topbar title="Scoring rules" eyebrow="Policy configuration" userLabel={user.full_name} />
      <Card className="mb-6">
        <h3 className="text-lg font-semibold text-ink">Deterministic policy controls</h3>
        <p className="mt-2 text-sm text-slate-500">
          Update rule weights, thresholds, and activation state. Saving will rescore the current applicant portfolio.
        </p>
      </Card>
      <RulesEditor initialRules={rules} />
    </section>
  );
}
