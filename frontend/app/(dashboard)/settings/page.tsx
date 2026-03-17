import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
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
          <h3 className="text-lg font-semibold text-ink">Demo credentials</h3>
          <div className="mt-4 space-y-3">
            {settings.demo_credentials.map((credential) => (
              <div key={credential.email} className="rounded-3xl border border-slate-200 bg-white/80 p-4">
                <div className="font-semibold text-ink">{credential.email}</div>
                <div className="mt-1 text-sm text-slate-500">Password: {credential.password}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{credential.role}</div>
              </div>
            ))}
          </div>
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
    </section>
  );
}
