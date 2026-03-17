"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { fetchClientJson } from "@/lib/api";
import { type ApplicantDetailResponse } from "@/lib/types";

const defaultFormState = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  date_of_birth: "1990-01-01",
  employment_status: "Salaried",
  company_name: "Atlas Commerce",
  years_employed: "2",
  residential_status: "Tenant",
  region: "Texas",
  status: "active",
  annual_income: "72000",
  monthly_expenses: "2900",
  debt_to_income_ratio: "0.38",
  savings_balance: "5400",
  existing_credit_lines: "4",
  credit_utilization: "0.41",
  bankruptcies: "0",
  open_delinquencies: "0",
  credit_score: "684",
  requested_amount: "18000",
  loan_purpose: "Working capital"
};

export function ManualEntryForm() {
  const router = useRouter();
  const [formState, setFormState] = useState(defaultFormState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField(name: keyof typeof defaultFormState, value: string) {
    setFormState((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetchClientJson<ApplicantDetailResponse>("/applicants", {
        method: "POST",
        body: JSON.stringify({
          first_name: formState.first_name,
          last_name: formState.last_name,
          email: formState.email,
          phone: formState.phone,
          date_of_birth: formState.date_of_birth,
          employment_status: formState.employment_status,
          company_name: formState.company_name,
          years_employed: Number(formState.years_employed),
          residential_status: formState.residential_status,
          region: formState.region,
          status: formState.status,
          financials: {
            annual_income: Number(formState.annual_income),
            monthly_expenses: Number(formState.monthly_expenses),
            debt_to_income_ratio: Number(formState.debt_to_income_ratio),
            savings_balance: Number(formState.savings_balance),
            existing_credit_lines: Number(formState.existing_credit_lines),
            credit_utilization: Number(formState.credit_utilization),
            bankruptcies: Number(formState.bankruptcies),
            open_delinquencies: Number(formState.open_delinquencies),
            credit_score: Number(formState.credit_score),
            requested_amount: Number(formState.requested_amount),
            loan_purpose: formState.loan_purpose
          }
        })
      });

      router.push(`/applicants/${response.applicant.id}`);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to create applicant");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-ink">Manual entry</h3>
        <p className="text-sm text-slate-500">Create a single applicant, score both engines, and capture an audit event.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <Input placeholder="First name" value={formState.first_name} onChange={(event) => updateField("first_name", event.target.value)} required />
          <Input placeholder="Last name" value={formState.last_name} onChange={(event) => updateField("last_name", event.target.value)} required />
          <Input placeholder="Email" type="email" value={formState.email} onChange={(event) => updateField("email", event.target.value)} required />
          <Input placeholder="Phone" value={formState.phone} onChange={(event) => updateField("phone", event.target.value)} />
          <Select value={formState.employment_status} onChange={(event) => updateField("employment_status", event.target.value)}>
            <option>Salaried</option>
            <option>Self-employed</option>
            <option>Contract</option>
            <option>Part-time</option>
          </Select>
          <Input placeholder="Region" value={formState.region} onChange={(event) => updateField("region", event.target.value)} required />
          <Input placeholder="Company" value={formState.company_name} onChange={(event) => updateField("company_name", event.target.value)} />
          <Input placeholder="Years employed" type="number" step="0.1" value={formState.years_employed} onChange={(event) => updateField("years_employed", event.target.value)} required />
          <Input placeholder="Annual income" type="number" value={formState.annual_income} onChange={(event) => updateField("annual_income", event.target.value)} required />
          <Input placeholder="Monthly expenses" type="number" value={formState.monthly_expenses} onChange={(event) => updateField("monthly_expenses", event.target.value)} required />
          <Input placeholder="DTI ratio" type="number" step="0.01" value={formState.debt_to_income_ratio} onChange={(event) => updateField("debt_to_income_ratio", event.target.value)} required />
          <Input placeholder="Savings balance" type="number" value={formState.savings_balance} onChange={(event) => updateField("savings_balance", event.target.value)} required />
          <Input placeholder="Credit score" type="number" value={formState.credit_score} onChange={(event) => updateField("credit_score", event.target.value)} required />
          <Input placeholder="Requested amount" type="number" value={formState.requested_amount} onChange={(event) => updateField("requested_amount", event.target.value)} required />
          <Input placeholder="Credit utilization" type="number" step="0.01" value={formState.credit_utilization} onChange={(event) => updateField("credit_utilization", event.target.value)} required />
          <Input placeholder="Open delinquencies" type="number" value={formState.open_delinquencies} onChange={(event) => updateField("open_delinquencies", event.target.value)} required />
        </div>

        {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

        <Button type="submit" variant="secondary" disabled={submitting}>
          {submitting ? "Submitting..." : "Create applicant"}
        </Button>
      </form>
    </Card>
  );
}
