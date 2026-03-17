"use client";

import { FileUp, FolderInput, RefreshCcw } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { fetchClientFormData } from "@/lib/api";
import { type ImportResult } from "@/lib/types";

async function uploadCsv(path: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return fetchClientFormData<ImportResult>(path, formData);
}

function ImportResultSummary({ result }: { result: ImportResult }) {
  return (
    <div className="mt-4 rounded-[22px] border border-emerald-200/60 bg-emerald-50/80 px-4 py-4 text-sm text-emerald-800">
      Imported {result.imported}, updated {result.updated}, skipped {result.skipped}.
      {result.errors.length ? (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-emerald-900">
          {result.errors.slice(0, 4).map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function ImportPanel() {
  const [applicantFile, setApplicantFile] = useState<File | null>(null);
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [applicantResult, setApplicantResult] = useState<ImportResult | null>(null);
  const [paymentResult, setPaymentResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState<"applicants" | "payments" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(type: "applicants" | "payments", file: File | null) {
    if (!file) {
      return;
    }
    setLoading(type);
    setError(null);

    try {
      const result = await uploadCsv(type === "applicants" ? "/imports/applicants" : "/imports/payment-histories", file);
      if (type === "applicants") {
        setApplicantResult(result);
      } else {
        setPaymentResult(result);
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "CSV upload failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-[color:var(--foreground)]">Applicants CSV</h3>
              <InfoTooltip label="About applicant imports">
                Upload one applicant file when you want to add or update customer records, refresh deterministic scoring, and create a visible portfolio intake trail.
              </InfoTooltip>
            </div>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
              Bulk ingest applicants and trigger both scoring engines for every row. Best for new cohorts, broker drops, or onboarding batches.
            </p>
          </div>
          <div className="rounded-full border border-[color:var(--line)] bg-[color:var(--card)] p-3 text-[color:var(--signal-strong)]">
            <FolderInput className="h-5 w-5" />
          </div>
        </div>

        <label className="mt-5 block rounded-[24px] border border-dashed border-[color:var(--line)] bg-[color:var(--card)] px-4 py-5">
          <div className="flex items-center gap-3 text-sm font-semibold text-[color:var(--foreground)]">
            <FileUp className="h-4 w-4 text-[color:var(--signal-strong)]" />
            Choose applicant CSV
          </div>
          <p className="mt-2 text-sm text-[color:var(--muted)]">{applicantFile ? applicantFile.name : "Accepted format: .csv"}</p>
          <input
            className="mt-4 block w-full text-sm text-[color:var(--muted)]"
            type="file"
            accept=".csv"
            onChange={(event) => setApplicantFile(event.target.files?.[0] ?? null)}
          />
        </label>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            className="gap-2"
            disabled={loading === "applicants" || !applicantFile}
            onClick={() => void handleUpload("applicants", applicantFile)}
          >
            {loading === "applicants" ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
            {loading === "applicants" ? "Uploading..." : "Upload applicants CSV"}
          </Button>
          <span className="text-sm text-[color:var(--muted)]">Use the template above if you need a ready-made schema example.</span>
        </div>

        {applicantResult ? <ImportResultSummary result={applicantResult} /> : null}
      </Card>

      <Card>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-[color:var(--foreground)]">Payment histories CSV</h3>
              <InfoTooltip label="About payment imports">
                Upload payment history when you want to enrich delinquency, recovery, and default signals without recreating the underlying applicants.
              </InfoTooltip>
            </div>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
              Append payment performance and refresh both scoring engines. Best for monthly collections data, arrears tracking, and recovery monitoring.
            </p>
          </div>
          <div className="rounded-full border border-[color:var(--line)] bg-[color:var(--card)] p-3 text-[color:var(--signal-strong)]">
            <FolderInput className="h-5 w-5" />
          </div>
        </div>

        <label className="mt-5 block rounded-[24px] border border-dashed border-[color:var(--line)] bg-[color:var(--card)] px-4 py-5">
          <div className="flex items-center gap-3 text-sm font-semibold text-[color:var(--foreground)]">
            <FileUp className="h-4 w-4 text-[color:var(--signal-strong)]" />
            Choose payment CSV
          </div>
          <p className="mt-2 text-sm text-[color:var(--muted)]">{paymentFile ? paymentFile.name : "Accepted format: .csv"}</p>
          <input
            className="mt-4 block w-full text-sm text-[color:var(--muted)]"
            type="file"
            accept=".csv"
            onChange={(event) => setPaymentFile(event.target.files?.[0] ?? null)}
          />
        </label>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            className="gap-2"
            disabled={loading === "payments" || !paymentFile}
            onClick={() => void handleUpload("payments", paymentFile)}
          >
            {loading === "payments" ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
            {loading === "payments" ? "Uploading..." : "Upload payment CSV"}
          </Button>
          <span className="text-sm text-[color:var(--muted)]">This file updates repayment behaviour without replacing the customer profile.</span>
        </div>

        {paymentResult ? <ImportResultSummary result={paymentResult} /> : null}
      </Card>

      {error ? (
        <div className="xl:col-span-2 rounded-[22px] border border-rose-200/70 bg-rose-50/80 px-4 py-4 text-sm text-rose-800">{error}</div>
      ) : null}
    </div>
  );
}
