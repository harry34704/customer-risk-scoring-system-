"use client";

import { Download, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { downloadBlob } from "@/lib/utils";

function serializeCsv(headers: string[], sampleRow: Record<string, string>) {
  const values = headers.map((header) => sampleRow[header] ?? "");
  return `${headers.join(",")}\n${values.join(",")}\n`;
}

export function CsvTemplateCard({
  title,
  description,
  headers,
  sampleRow,
  filename
}: {
  title: string;
  description: string;
  headers: string[];
  sampleRow: Record<string, string>;
  filename: string;
}) {
  function handleDownload() {
    const blob = new Blob([serializeCsv(headers, sampleRow)], { type: "text/csv;charset=utf-8" });
    downloadBlob(blob, filename);
  }

  return (
    <Card className="h-full">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-[color:var(--foreground)]">{title}</h3>
            <InfoTooltip label={`About ${title}`}>
              This downloadable template includes the correct header structure plus one example row so users can match the expected schema before importing.
            </InfoTooltip>
          </div>
          <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{description}</p>
        </div>
        <div className="rounded-full border border-[color:var(--line)] bg-[color:var(--card)] p-3 text-[color:var(--signal-strong)]">
          <FileText className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-[24px] border border-[color:var(--line)] bg-[color:var(--card)]">
        <div className="grid border-b border-[color:var(--line)] bg-[color:var(--signal-soft)] text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)] md:grid-cols-3">
          {headers.slice(0, 6).map((header) => (
            <div key={header} className="px-4 py-3">
              {header}
            </div>
          ))}
        </div>
        <div className="grid text-sm text-[color:var(--foreground)] md:grid-cols-3">
          {headers.slice(0, 6).map((header) => (
            <div key={header} className="border-b border-[color:var(--line)] px-4 py-3 md:border-b-0">
              {sampleRow[header] ?? ""}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 rounded-[22px] border border-[color:var(--line)] bg-[color:var(--card)] px-4 py-4">
        <div className="text-sm text-[color:var(--muted)]">
          Download the full template with all {headers.length} headers in CSV format.
        </div>
        <Button variant="ghost" className="gap-2 whitespace-nowrap" onClick={handleDownload}>
          <Download className="h-4 w-4" />
          Download template
        </Button>
      </div>
    </Card>
  );
}
