"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { readPublicEnv } from "@/lib/env";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { type ImportResult } from "@/lib/types";

async function uploadCsv(path: string, file: File) {
  const supabase = createSupabaseBrowserClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("You are not signed in.");
  }

  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${readPublicEnv("NEXT_PUBLIC_API_BASE_URL")}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return (await response.json()) as ImportResult;
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
        <h3 className="text-lg font-semibold text-ink">Applicants CSV</h3>
        <p className="mt-2 text-sm text-slate-500">Bulk ingest applicants and trigger scoring for each row.</p>
        <input
          className="mt-5 block w-full text-sm"
          type="file"
          accept=".csv"
          onChange={(event) => setApplicantFile(event.target.files?.[0] ?? null)}
        />
        <Button
          className="mt-5"
          variant="secondary"
          disabled={loading === "applicants" || !applicantFile}
          onClick={() => void handleUpload("applicants", applicantFile)}
        >
          {loading === "applicants" ? "Uploading..." : "Upload applicants CSV"}
        </Button>
        {applicantResult ? (
          <div className="mt-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            Imported {applicantResult.imported}, updated {applicantResult.updated}, skipped {applicantResult.skipped}.
          </div>
        ) : null}
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-ink">Payment histories CSV</h3>
        <p className="mt-2 text-sm text-slate-500">Append payment performance and refresh both scoring engines.</p>
        <input
          className="mt-5 block w-full text-sm"
          type="file"
          accept=".csv"
          onChange={(event) => setPaymentFile(event.target.files?.[0] ?? null)}
        />
        <Button
          className="mt-5"
          variant="secondary"
          disabled={loading === "payments" || !paymentFile}
          onClick={() => void handleUpload("payments", paymentFile)}
        >
          {loading === "payments" ? "Uploading..." : "Upload payment CSV"}
        </Button>
        {paymentResult ? (
          <div className="mt-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            Imported {paymentResult.imported}, updated {paymentResult.updated}, skipped {paymentResult.skipped}.
          </div>
        ) : null}
      </Card>

      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
    </div>
  );
}
