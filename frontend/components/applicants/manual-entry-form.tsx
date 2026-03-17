"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SectionHeading } from "@/components/ui/section-heading";
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
  region: "Gauteng",
  status: "active",
  annual_income: "420000",
  monthly_expenses: "14500",
  debt_to_income_ratio: "0.38",
  savings_balance: "54000",
  existing_credit_lines: "4",
  credit_utilization: "0.41",
  bankruptcies: "0",
  open_delinquencies: "0",
  credit_score: "684",
  requested_amount: "18000",
  loan_purpose: "Working capital"
};

const regionOptions = ["Gauteng", "Western Cape", "KwaZulu-Natal", "Texas", "California", "New York", "London"];

function Field({
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
      <SectionHeading
        title="Manual entry"
        description="Create a single applicant, score both engines, and capture an audit event with regional context."
        tooltip="Manual entry is the fastest way to demonstrate the end-to-end scoring flow before you move to CSV imports."
      />

      <div className="mb-5 rounded-[22px] border border-[color:var(--line)] bg-[color:var(--card)] px-4 py-4 text-sm leading-6 text-[color:var(--muted)]">
        Amounts display in rand for South African regions, pounds for UK regions, and dollars for US regions once the applicant is created.
        <Link href="/imports#csv-templates" className="ml-2 font-semibold text-[color:var(--signal-strong)]">
          Need the bulk schema instead?
        </Link>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--signal-strong)]">Identity and employment</div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="First name">
              <Input placeholder="First name" value={formState.first_name} onChange={(event) => updateField("first_name", event.target.value)} required />
            </Field>
            <Field label="Last name">
              <Input placeholder="Last name" value={formState.last_name} onChange={(event) => updateField("last_name", event.target.value)} required />
            </Field>
            <Field label="Email">
              <Input placeholder="Email" type="email" value={formState.email} onChange={(event) => updateField("email", event.target.value)} required />
            </Field>
            <Field label="Phone">
              <Input placeholder="Phone" value={formState.phone} onChange={(event) => updateField("phone", event.target.value)} />
            </Field>
            <Field label="Date of birth">
              <Input type="date" value={formState.date_of_birth} onChange={(event) => updateField("date_of_birth", event.target.value)} required />
            </Field>
            <Field label="Employment status">
              <Select value={formState.employment_status} onChange={(event) => updateField("employment_status", event.target.value)}>
                <option>Salaried</option>
                <option>Self-employed</option>
                <option>Contract</option>
                <option>Part-time</option>
              </Select>
            </Field>
            <Field label="Company">
              <Input value={formState.company_name} onChange={(event) => updateField("company_name", event.target.value)} />
            </Field>
            <Field label="Years employed" tooltip="Shorter tenure can increase uncertainty around income stability.">
              <Input type="number" step="0.1" value={formState.years_employed} onChange={(event) => updateField("years_employed", event.target.value)} required />
            </Field>
            <Field label="Residential status">
              <Select value={formState.residential_status} onChange={(event) => updateField("residential_status", event.target.value)}>
                <option>Tenant</option>
                <option>Owner</option>
                <option>Family home</option>
              </Select>
            </Field>
            <Field label="Region" tooltip="Region controls currency display and supports mixed South African, UK, and US demo portfolios.">
              <Select value={formState.region} onChange={(event) => updateField("region", event.target.value)}>
                {regionOptions.map((region) => (
                  <option key={region}>{region}</option>
                ))}
              </Select>
            </Field>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--signal-strong)]">Affordability and exposure</div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Annual income">
              <Input type="number" value={formState.annual_income} onChange={(event) => updateField("annual_income", event.target.value)} required />
            </Field>
            <Field label="Monthly expenses">
              <Input type="number" value={formState.monthly_expenses} onChange={(event) => updateField("monthly_expenses", event.target.value)} required />
            </Field>
            <Field label="Debt-to-income ratio" tooltip="This is a decimal value, so 0.38 means 38%.">
              <Input
                type="number"
                step="0.01"
                value={formState.debt_to_income_ratio}
                onChange={(event) => updateField("debt_to_income_ratio", event.target.value)}
                required
              />
            </Field>
            <Field label="Savings balance">
              <Input type="number" value={formState.savings_balance} onChange={(event) => updateField("savings_balance", event.target.value)} required />
            </Field>
            <Field label="Requested amount">
              <Input type="number" value={formState.requested_amount} onChange={(event) => updateField("requested_amount", event.target.value)} required />
            </Field>
            <Field label="Loan purpose">
              <Input value={formState.loan_purpose} onChange={(event) => updateField("loan_purpose", event.target.value)} required />
            </Field>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--signal-strong)]">Credit and behaviour</div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Credit score">
              <Input type="number" value={formState.credit_score} onChange={(event) => updateField("credit_score", event.target.value)} required />
            </Field>
            <Field label="Credit utilization" tooltip="Use a decimal value, so 0.41 means 41% revolving utilization.">
              <Input
                type="number"
                step="0.01"
                value={formState.credit_utilization}
                onChange={(event) => updateField("credit_utilization", event.target.value)}
                required
              />
            </Field>
            <Field label="Existing credit lines">
              <Input
                type="number"
                value={formState.existing_credit_lines}
                onChange={(event) => updateField("existing_credit_lines", event.target.value)}
                required
              />
            </Field>
            <Field label="Open delinquencies">
              <Input type="number" value={formState.open_delinquencies} onChange={(event) => updateField("open_delinquencies", event.target.value)} required />
            </Field>
            <Field label="Bankruptcies">
              <Input type="number" value={formState.bankruptcies} onChange={(event) => updateField("bankruptcies", event.target.value)} required />
            </Field>
            <Field label="Status">
              <Select value={formState.status} onChange={(event) => updateField("status", event.target.value)}>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="manual_review">Manual review</option>
              </Select>
            </Field>
          </div>
        </div>

        {error ? <div className="rounded-[22px] border border-rose-200/70 bg-rose-50/80 px-4 py-3 text-sm text-rose-800">{error}</div> : null}

        <Button type="submit" variant="secondary" disabled={submitting}>
          {submitting ? "Submitting..." : "Create applicant"}
        </Button>
      </form>
    </Card>
  );
}
