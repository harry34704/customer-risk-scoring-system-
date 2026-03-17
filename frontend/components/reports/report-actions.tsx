"use client";

import { useState } from "react";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { fetchClientFile } from "@/lib/api";
import { type RiskMode } from "@/lib/types";
import { downloadBlob } from "@/lib/utils";

export function ReportActions({ mode }: { mode: RiskMode }) {
  const [downloading, setDownloading] = useState<"csv" | "pdf" | null>(null);

  async function handleDownload(type: "csv" | "pdf") {
    setDownloading(type);
    try {
      const blob = await fetchClientFile(`/reports/export.${type}?mode=${mode}`);
      downloadBlob(blob, `risk-report-${mode}.${type}`);
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="secondary" className="gap-2" onClick={() => void handleDownload("csv")}>
        <Download className="h-4 w-4" />
        {downloading === "csv" ? "Downloading..." : "Export CSV"}
      </Button>
      <Button className="gap-2" onClick={() => void handleDownload("pdf")}>
        <Download className="h-4 w-4" />
        {downloading === "pdf" ? "Downloading..." : "Export PDF"}
      </Button>
    </div>
  );
}
