import { Card } from "@/components/ui/card";
import { ModeSwitch } from "@/components/ui/mode-switch";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { RecentApplicants } from "@/components/dashboard/recent-applicants";
import { Topbar } from "@/components/layout/topbar";
import { fetchServerJson } from "@/lib/server-api";
import { fetchUserProfile } from "@/lib/server-data";
import { type DashboardOverview, type RiskMode } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const mode = ((Array.isArray(searchParams?.mode) ? searchParams?.mode[0] : searchParams?.mode) ??
    "deterministic") as RiskMode;

  const [user, overview] = await Promise.all([
    fetchUserProfile(),
    fetchServerJson<DashboardOverview>(`/dashboard/overview?mode=${mode}`)
  ]);

  return (
    <section className="pb-10">
      <Topbar title="Portfolio dashboard" eyebrow="Risk operations" userLabel={user.full_name} />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <ModeSwitch pathname="/dashboard" mode={mode} />
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-4">
        {overview.summary_cards.map((card) => (
          <Card key={card.label}>
            <div className="text-sm uppercase tracking-[0.18em] text-slate-400">{card.label}</div>
            <div className="mt-4 text-4xl font-semibold text-ink">{card.value}</div>
            <div className="mt-3 text-sm text-slate-500">{card.delta}</div>
          </Card>
        ))}
      </div>

      <DashboardCharts overview={overview} />

      <div className="mt-6">
        <RecentApplicants applicants={overview.recent_applicants} />
      </div>
    </section>
  );
}
