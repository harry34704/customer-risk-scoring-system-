"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { fetchClientJson } from "@/lib/api";
import { type ScoringRule } from "@/lib/types";

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
          <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr_0.7fr_0.6fr_auto]">
            <div>
              <div className="text-sm font-semibold text-ink">{rule.factor_key.replace(/_/g, " ")}</div>
              <Input className="mt-3" value={rule.name} onChange={(event) => updateRule(index, "name", event.target.value)} />
              <Input className="mt-3" value={rule.description} onChange={(event) => updateRule(index, "description", event.target.value)} />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Input type="number" step="0.1" value={rule.weight} onChange={(event) => updateRule(index, "weight", Number(event.target.value))} />
              <Input type="number" step="0.01" value={rule.threshold_value} onChange={(event) => updateRule(index, "threshold_value", Number(event.target.value))} />
              <Select value={rule.threshold_operator} onChange={(event) => updateRule(index, "threshold_operator", event.target.value)}>
                <option value="gt">greater than</option>
                <option value="gte">greater or equal</option>
                <option value="lt">less than</option>
                <option value="lte">less or equal</option>
                <option value="eq">equal</option>
              </Select>
              <Input type="number" value={rule.sort_order} onChange={(event) => updateRule(index, "sort_order", Number(event.target.value))} />
            </div>

            <label className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-medium text-slate-600">
              <input type="checkbox" checked={rule.enabled} onChange={(event) => updateRule(index, "enabled", event.target.checked)} />
              Enabled
            </label>
          </div>
        </Card>
      ))}

      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Saving and rescoring..." : "Save rules"}
      </Button>
    </div>
  );
}
