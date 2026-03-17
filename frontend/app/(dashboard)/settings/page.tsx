import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { WorkspaceBootstrapCard } from "@/components/workspace/workspace-bootstrap-card";
import { fetchServerJson } from "@/lib/server-api";
import { fetchUserProfile } from "@/lib/server-data";
import { type SettingsResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [user, settings] = await Promise.all([
    fetchUserProfile(),
    fetchServerJson<SettingsResponse>("/settings")
  ]);

  return (
    <section className="pb-10">
      <Topbar title="Settings" eyebrow="Environment and handoff" userLabel={user.full_name} />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold text-ink">Current workspace</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Applicants</div>
              <div className="mt-2 text-2xl font-semibold text-ink">{settings.workspace_summary.applicant_count}</div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Rules</div>
              <div className="mt-2 text-2xl font-semibold text-ink">{settings.workspace_summary.rule_count}</div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Payments</div>
              <div className="mt-2 text-2xl font-semibold text-ink">{settings.workspace_summary.payment_count}</div>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            {settings.workspace_summary.is_empty
              ? "This account is empty. Load the demo workspace below or import your own files."
              : "This account has its own applicants, payment history, and rule set isolated from other users."}
          </p>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-ink">Scoring modes</h3>
          <div className="mt-4 space-y-3">
            {settings.scoring_modes.map((mode) => (
              <div key={mode.id} className="rounded-3xl border border-slate-200 bg-white/80 p-4">
                <div className="font-semibold text-ink">{mode.label}</div>
                <div className="mt-1 text-sm text-slate-500">{mode.description}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold text-ink">Demo credentials</h3>
          {settings.demo_credentials.length ? (
            <div className="mt-4 space-y-3">
              {settings.demo_credentials.map((credential) => (
                <div key={credential.email} className="rounded-3xl border border-slate-200 bg-white/80 p-4">
                  <div className="font-semibold text-ink">{credential.email}</div>
                  <div className="mt-1 text-sm text-slate-500">Password: {credential.password}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{credential.role}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 p-5 text-sm text-slate-500">
              Demo accounts are not seeded in this deployment yet. You can still use your current account and load the demo workspace from this page.
            </div>
          )}
        </Card>

        {settings.workspace_summary.is_empty ? (
          <WorkspaceBootstrapCard
            title="Load a portfolio into this account."
            description="Use this when you want your own login to behave like a fully populated demo environment without signing in as one of the seeded demo users."
          />
        ) : (
          <Card>
            <h3 className="text-lg font-semibold text-ink">Workspace status</h3>
            <p className="mt-3 text-sm text-slate-500">
              Your portfolio is active. You can keep editing rules, import new CSVs, add applicants manually, or export reports from the current dataset.
            </p>
          </Card>
        )}
      </div>
    </section>
  );
}
