import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { ServerErrorState } from "@/components/ui/server-error-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { WorkspaceBootstrapCard } from "@/components/workspace/workspace-bootstrap-card";
import { rethrowIfNavigationError } from "@/lib/next-navigation-error";
import { fetchServerJson } from "@/lib/server-api";
import { fetchUserProfile } from "@/lib/server-data";
import { type SettingsResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  let userLabel = "Workspace assistance";
  let settings: SettingsResponse | null = null;

  try {
    const user = await fetchUserProfile();
    userLabel = user.full_name;
    settings = await fetchServerJson<SettingsResponse>("/settings");
  } catch (error) {
    rethrowIfNavigationError(error);
  }

  if (!settings) {
    return (
      <section className="pb-10">
        <Topbar
          title="Settings"
          eyebrow="Environment and handoff"
          userLabel={userLabel}
          description="The settings area is available, but the live workspace metadata is reconnecting."
        />
        <ServerErrorState
          title="Settings could not be loaded right now."
          description="Workspace counts, theme metadata, demo credentials, and handoff notes are temporarily unavailable. The page stays usable while the backend reconnects."
          retryHref="/settings"
          secondaryHref="/dashboard"
          secondaryLabel="Back to dashboard"
        />
      </section>
    );
  }

  return (
    <section className="pb-10">
      <Topbar
        title="Settings"
        eyebrow="Environment and handoff"
        userLabel={userLabel}
        description="Review workspace readiness, switch portfolio themes, understand the scoring logic, and hand the product to a stakeholder with clear operating notes."
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <SectionHeading
            title="Current workspace"
            description="This summary shows whether the current account is seeded, actively being reviewed, or ready for a fresh import."
            tooltip="Workspace counts are isolated to the signed-in account. This makes the app usable as a personal demo space or a multi-user portfolio environment."
          />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] border border-[color:var(--line)] bg-[color:var(--card)] px-5 py-5">
              <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">Applicants</div>
              <div className="mt-3 text-3xl font-semibold text-[color:var(--foreground)]">
                {settings.workspace_summary.applicant_count}
              </div>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">Live customer records ready for scoring and review.</p>
            </div>
            <div className="rounded-[24px] border border-[color:var(--line)] bg-[color:var(--card)] px-5 py-5">
              <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">Rules</div>
              <div className="mt-3 text-3xl font-semibold text-[color:var(--foreground)]">
                {settings.workspace_summary.rule_count}
              </div>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">Policy controls currently driving deterministic scoring.</p>
            </div>
            <div className="rounded-[24px] border border-[color:var(--line)] bg-[color:var(--card)] px-5 py-5">
              <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">Payments</div>
              <div className="mt-3 text-3xl font-semibold text-[color:var(--foreground)]">
                {settings.workspace_summary.payment_count}
              </div>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">Historical repayments used for recovery and default insight.</p>
            </div>
          </div>
          <div className="mt-5 rounded-[24px] border border-[color:var(--line)] bg-[color:var(--card)] px-5 py-5 text-sm leading-6 text-[color:var(--muted)]">
            {settings.workspace_summary.is_empty
              ? "This account is empty. Load the demo workspace or use the CSV templates to build your own portfolio from scratch."
              : "This workspace is live. You can keep adjusting rules, importing new cohorts, and exporting reports without affecting any other user account."}
          </div>
        </Card>

        <ThemeSwitcher />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card>
          <SectionHeading
            title="About the scoring logic"
            description="This app was designed as an explainable risk operations workspace, not a black-box scorecard."
            tooltip="Every applicant is scored in two ways: deterministic policy rules for transparent business control, and a logistic baseline for a statistical point of comparison."
          />
          <div className="space-y-4 text-sm leading-7 text-[color:var(--muted)]">
            <p>
              The deterministic engine turns rule weights, thresholds, and activation states into a portfolio policy that a business analyst can explain line by line.
              The logistic baseline adds a second view so reviewers can compare policy intuition against a simple model-driven probability of default.
            </p>
            <p>
              The goal is responsible, transparent scoring. Teams can see why a customer was flagged, which factors moved the score, how recovery is trending, and
              where additional review is needed before taking action.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {settings.scoring_modes.map((mode) => (
                <div key={mode.id} className="rounded-[22px] border border-[color:var(--line)] bg-[color:var(--card)] px-4 py-4">
                  <div className="text-sm font-semibold text-[color:var(--foreground)]">{mode.label}</div>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{mode.description}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <SectionHeading
            title="Product handoff notes"
            description="Use this section when you are demoing the product, onboarding a stakeholder, or preparing a portfolio walkthrough."
            tooltip="The strongest demo path is: load workspace, review dashboard, inspect an applicant, adjust rules, import a CSV, then export a report."
          />
          <div className="space-y-3">
            {[
              "Start on the dashboard to explain volume, score mix, recovery ratio, and the journey from intake to action.",
              "Use applicants to show explainable score breakdowns, region-aware currency, and the manual entry workflow.",
              "Open rules to demonstrate how business policy can be edited safely with visible scoring impact.",
              "Point stakeholders to imports for CSV schema downloads and to reports for exportable evidence."
            ].map((item) => (
              <div key={item} className="rounded-[22px] border border-[color:var(--line)] bg-[color:var(--card)] px-4 py-4 text-sm leading-6 text-[color:var(--muted)]">
                {item}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <SectionHeading
            title="Demo credentials"
            description="Seeded demo accounts are useful for screenshots, testing, and stakeholder walkthroughs."
            tooltip="If this deployment has not been seeded yet, sign in with your own account and use the demo workspace loader below."
          />
          {settings.demo_credentials.length ? (
            <div className="space-y-3">
              {settings.demo_credentials.map((credential) => (
                <div key={credential.email} className="rounded-[24px] border border-[color:var(--line)] bg-[color:var(--card)] px-5 py-4">
                  <div className="font-semibold text-[color:var(--foreground)]">{credential.email}</div>
                  <div className="mt-2 text-sm text-[color:var(--muted)]">Password: {credential.password}</div>
                  <div className="mt-2 text-xs uppercase tracking-[0.18em] text-[color:var(--signal-strong)]">{credential.role}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-[color:var(--line)] bg-[color:var(--card)] px-5 py-6 text-sm leading-6 text-[color:var(--muted)]">
              Demo accounts are not available in this deployment yet. You can still keep using your current account and load a private demo workspace below.
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
            <SectionHeading
              title="Workspace status"
              description="Your portfolio is already active and ready for continued analysis."
              tooltip="A live workspace means you can continue scoring, importing, exporting, and editing rules without needing to bootstrap any new data."
            />
            <div className="rounded-[24px] border border-[color:var(--line)] bg-[color:var(--card)] px-5 py-5 text-sm leading-6 text-[color:var(--muted)]">
              Your workspace is populated. Continue refining rules, import new applicants, or export reports for business review. The help bot and tooltips across the
              product are there to support non-technical users during demos and handoff.
            </div>
          </Card>
        )}
      </div>
    </section>
  );
}
