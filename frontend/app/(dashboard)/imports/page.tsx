import Link from "next/link";

import { CsvTemplateCard } from "@/components/imports/csv-template-card";
import { ImportPanel } from "@/components/imports/import-panel";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { fetchServerJson } from "@/lib/server-api";
import { fetchUserProfile } from "@/lib/server-data";
import { type SettingsResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

const applicantTemplateRow = {
  external_id: "ZA-0001",
  first_name: "Anele",
  last_name: "Dlamini",
  email: "anele.dlamini@example.com",
  phone: "+27-82-555-0144",
  date_of_birth: "1989-08-17",
  employment_status: "Salaried",
  company_name: "Ubuntu Retail",
  years_employed: "4.5",
  residential_status: "Owner",
  region: "Gauteng",
  status: "active",
  annual_income: "420000",
  monthly_expenses: "14500",
  debt_to_income_ratio: "0.31",
  savings_balance: "58000",
  existing_credit_lines: "5",
  credit_utilization: "0.42",
  bankruptcies: "0",
  open_delinquencies: "0",
  credit_score: "702",
  requested_amount: "95000",
  loan_purpose: "Home improvement"
};

const paymentTemplateRow = {
  applicant_external_id: "ZA-0001",
  applicant_email: "anele.dlamini@example.com",
  payment_month: "2026-02",
  amount_due: "7900",
  amount_paid: "7600",
  days_late: "4",
  status: "partial"
};

export default async function ImportsPage() {
  const [user, settings] = await Promise.all([
    fetchUserProfile(),
    fetchServerJson<SettingsResponse>("/settings")
  ]);

  return (
    <section className="pb-10">
      <Topbar
        title="Imports"
        eyebrow="Bulk ingestion"
        userLabel={user.full_name}
        description="Start with the downloadable CSV examples, match the required headers exactly, and then ingest applicants or payment histories into the current workspace."
      />

      <div className="mb-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <SectionHeading
            title="Import workflow"
            description="Use the templates first, then upload the populated CSV files below."
            tooltip="Applicant imports create or update customer records. Payment history imports extend repayment performance and refresh portfolio scoring."
          />
          <div className="grid gap-3 md:grid-cols-3">
            {[
              {
                step: "1. Download",
                copy: "Grab the exact applicant or payment header template from the cards on this page."
              },
              {
                step: "2. Populate",
                copy: "Fill in your own rows while preserving header names and date or numeric formats."
              },
              {
                step: "3. Upload",
                copy: "Upload the CSV to create records, rescore the portfolio, and refresh the dashboard story."
              }
            ].map((item) => (
              <div key={item.step} className="rounded-[22px] border border-[color:var(--line)] bg-[color:var(--card)] px-4 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--signal-strong)]">{item.step}</div>
                <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{item.copy}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionHeading
            title="Need help with the schema?"
            description="The Applicants page has a manual entry form if you want to test one record first before bulk import."
            tooltip="This keeps the learning curve low: reviewers can inspect a single applicant, then move to CSV imports once they understand the field structure."
          />
          <div className="space-y-4">
            <div className="rounded-[22px] border border-[color:var(--line)] bg-[color:var(--card)] px-4 py-4 text-sm leading-6 text-[color:var(--muted)]">
              South African regions will display in rand automatically once imported. UK regions render in pounds, and US regions in dollars, so the same dataset can
              be used across mixed portfolios without losing local context.
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/applicants#manual-entry"
                className="inline-flex items-center rounded-2xl border border-[color:var(--signal-strong)] bg-[color:var(--signal-strong)] px-4 py-2 text-sm font-semibold text-white"
              >
                Open manual entry
              </Link>
              <Link
                href="/rules"
                className="inline-flex items-center rounded-2xl border border-[color:var(--line)] bg-[color:var(--card)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)]"
              >
                Review scoring rules
              </Link>
            </div>
          </div>
        </Card>
      </div>

      <div id="csv-templates" className="mb-6 grid gap-6 xl:grid-cols-2">
        <CsvTemplateCard
          title="Applicant CSV template"
          description="A full intake row for creating or updating applicants with income, credit, affordability, and region data."
          headers={settings.expected_applicant_csv_headers}
          sampleRow={applicantTemplateRow}
          filename="applicant-template.csv"
        />
        <CsvTemplateCard
          title="Payment CSV template"
          description="A repayment history row for updating recovery performance and overdue behavior over time."
          headers={settings.expected_payment_csv_headers}
          sampleRow={paymentTemplateRow}
          filename="payment-template.csv"
        />
      </div>

      <div className="mb-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <SectionHeading
            title="Applicant CSV headers"
            description="These are the exact applicant columns the uploader expects."
            tooltip="Header order can vary, but names must match exactly so the backend can map each field safely."
          />
          <div className="flex flex-wrap gap-2">
            {settings.expected_applicant_csv_headers.map((header) => (
              <span
                key={header}
                className="rounded-full border border-[color:var(--line)] bg-[color:var(--card)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]"
              >
                {header}
              </span>
            ))}
          </div>
        </Card>
        <Card>
          <SectionHeading
            title="Payment CSV headers"
            description="These columns are required when you append repayment history."
            tooltip="Payment history is what drives recovery, delinquency, and default trend insight across the dashboard and reports."
          />
          <div className="flex flex-wrap gap-2">
            {settings.expected_payment_csv_headers.map((header) => (
              <span
                key={header}
                className="rounded-full border border-[color:var(--line)] bg-[color:var(--card)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]"
              >
                {header}
              </span>
            ))}
          </div>
        </Card>
      </div>

      <ImportPanel />
    </section>
  );
}
