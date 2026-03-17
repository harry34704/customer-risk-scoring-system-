import { ImportPanel } from "@/components/imports/import-panel";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { fetchServerJson } from "@/lib/server-api";
import { fetchUserProfile } from "@/lib/server-data";
import { type SettingsResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ImportsPage() {
  const [user, settings] = await Promise.all([
    fetchUserProfile(),
    fetchServerJson<SettingsResponse>("/settings")
  ]);

  return (
    <section className="pb-10">
      <Topbar title="Imports" eyebrow="Bulk ingestion" userLabel={user.full_name} />

      <div className="mb-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold text-ink">Applicant CSV headers</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {settings.expected_applicant_csv_headers.map((header) => (
              <span key={header} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                {header}
              </span>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-ink">Payment CSV headers</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {settings.expected_payment_csv_headers.map((header) => (
              <span key={header} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
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
