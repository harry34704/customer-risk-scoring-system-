import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Activity, ShieldAlert, Sparkles } from "lucide-react";

import { LoginPanel } from "@/components/auth/login-panel";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

export default async function LoginPage() {
  if (cookies().get(AUTH_COOKIE_NAME)?.value) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center gap-10 px-4 py-10 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
      <section className="hero-panel rounded-[40px] border border-white/10 px-8 py-10 shadow-[var(--surface-shadow)] lg:px-10">
        <div className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em]">
          Customer Risk Scoring System
        </div>
        <h1 className="mt-8 text-5xl font-semibold leading-tight">
          Underwrite faster with explainable dual-mode customer risk scoring and portfolio education built in.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8">
          A modern risk workspace for insurance-adjacent and credit review teams, with South African friendly presentation, rule transparency, and a clear journey from intake to action.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: ShieldAlert,
              title: "Explainability first",
              copy: "Each score shows the factors, narratives, and controls behind the decision."
            },
            {
              icon: Activity,
              title: "Cohort monitoring",
              copy: "Track defaults, recovery gaps, and score movement as a portfolio story."
            },
            {
              icon: Sparkles,
              title: "Portfolio polish",
              copy: "Theme switching, FAQ support, and export-ready screens built for executive review."
            }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                <Icon className="h-5 w-5 text-white/80" />
                <div className="mt-4 text-lg font-semibold">{item.title}</div>
                <p className="mt-2 text-sm text-white/70">{item.copy}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="flex items-center justify-center">
        <LoginPanel />
      </section>
    </main>
  );
}
