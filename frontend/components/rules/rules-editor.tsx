"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TextArea } from "@/components/ui/text-area";
import { fetchClientJson } from "@/lib/api";
import { type ScoringRule } from "@/lib/types";
import { slugToLabel } from "@/lib/utils";

const operatorLabels: Record<string, string> = {
  gt: "Greater than",
  gte: "Greater or equal",
  lt: "Less than",
  lte: "Less or equal",
  eq: "Equal"
};

function RuleField({
  label,
  tooltip,
  children
}: {
  label: string;
  tooltip?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
        {label}
        {tooltip ? <InfoTooltip label={`About ${label}`}>{tooltip}</InfoTooltip> : null}
      </span>
      {children}
    </label>
  );
}

export function RulesEditor({ initialRules }: { initialRules: ScoringRule[] }) {
  const router = useRouter();
  const [rules, setRules] = useState(initialRules);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateRule(index: number, field: keyof ScoringRule, value: string | number | boolean) {
    setRules((current) =>
      current.map((rule, ruleIndex) =>
        ruleIndex === index
          ? {
              ...rule,
              [field]: value
            }
          : rule
      )
    );
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await fetchClientJson<ScoringRule[]>("/rules", {
        method: "PUT",
        body: JSON.stringify({
          rules: rules.map((rule) => ({
            id: rule.id,
            name: rule.name,
            description: rule.description,
            weight: Number(rule.weight),
            threshold_operator: rule.threshold_operator,
            threshold_value: Number(rule.threshold_value),
            enabled: rule.enabled,
            sort_order: Number(rule.sort_order)
          }))
        })
      });
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save rules");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {rules.map((rule, index) => (
        <Card key={rule.id}>
          <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr_220px]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[color:var(--line)] bg-[color:var(--card)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--signal-strong)]">
                  {slugToLabel(rule.factor_key)}
                </span>
                <span className="rounded-full border border-[color:var(--line)] bg-[color:var(--card)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
                  Priority {rule.sort_order}
                </span>
              </div>
              <div className="mt-4 space-y-4">
                <RuleField label="Rule name" tooltip="Use business language the reviewer will understand at a glance.">
                  <Input value={rule.name} onChange={(event) => updateRule(index, "name", event.target.value)} />
                </RuleField>
                <RuleField
                  label="Explanation"
                  tooltip="This copy appears alongside the rule and helps analysts understand why it exists in policy."
                >
                  <TextArea value={rule.description} onChange={(event) => updateRule(index, "description", event.target.value)} className="min-h-[112px]" />
                </RuleField>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <RuleField label="Weight" tooltip="Higher weight means the rule moves the score more strongly when triggered.">
                <Input type="number" step="0.1" value={rule.weight} onChange={(event) => updateRule(index, "weight", Number(event.target.value))} />
              </RuleField>
              <RuleField label="Threshold value" tooltip="The numeric trigger point used with the selected operator.">
                <Input
                  type="number"
                  step="0.01"
                  value={rule.threshold_value}
                  onChange={(event) => updateRule(index, "threshold_value", Number(event.target.value))}
                />
              </RuleField>
              <RuleField label="Operator" tooltip="Defines how the incoming applicant value is compared to the threshold.">
                <Select value={rule.threshold_operator} onChange={(event) => updateRule(index, "threshold_operator", event.target.value)}>
                  <option value="gt">Greater than</option>
                  <option value="gte">Greater or equal</option>
                  <option value="lt">Less than</option>
                  <option value="lte">Less or equal</option>
                  <option value="eq">Equal</option>
                </Select>
              </RuleField>
              <RuleField label="Priority" tooltip="Controls the sort order shown to reviewers.">
                <Input type="number" value={rule.sort_order} onChange={(event) => updateRule(index, "sort_order", Number(event.target.value))} />
              </RuleField>
            </div>

            <div className="rounded-[24px] border border-[color:var(--line)] bg-[color:var(--card)] px-4 py-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">Rule status</div>
              <div className="mt-3 text-sm font-semibold text-[color:var(--foreground)]">{rule.enabled ? "Enabled" : "Disabled"}</div>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                {rule.enabled
                  ? `${operatorLabels[rule.threshold_operator]} ${rule.threshold_value} with weight ${rule.weight}.`
                  : "This rule stays visible for governance, but it will not affect any applicant score until re-enabled."}
              </p>
              <label className="mt-4 flex items-center gap-3 rounded-[20px] border border-[color:var(--line)] bg-[color:var(--card-strong)] px-4 py-3 text-sm font-medium text-[color:var(--foreground)]">
                <input
                  type="checkbox"
                  checked={rule.enabled}
                  onChange={(event) => updateRule(index, "enabled", event.target.checked)}
                  className="h-4 w-4 rounded border-[color:var(--line)]"
                />
                Enabled
              </label>
            </div>
          </div>
        </Card>
      ))}

      {error ? <div className="rounded-[22px] border border-rose-200/70 bg-rose-50/80 px-4 py-3 text-sm text-rose-800">{error}</div> : null}
      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Saving and rescoring..." : "Save rules"}
      </Button>
    </div>
  );
}
