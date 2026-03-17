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
      <section className="rounded-[40px] border border-white/80 bg-ink px-8 py-10 text-white shadow-soft lg:px-10">
        <div className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em]">
          Customer Risk Scoring System
        </div>
        <h1 className="mt-8 text-5xl font-semibold leading-tight">
          Underwrite faster with explainable dual-mode customer risk scoring.
        </h1>
        <p className="mt-5 max-w-2xl text-base text-slate-300">
          Portfolio-grade UI, configurable weighted policy rules, and a logistic regression baseline shaped from synthetic repayment behavior.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: ShieldAlert,
              title: "Explainability first",
              copy: "Top-factor cards for each score with audit-ready narratives."
            },
            {
              icon: Activity,
              title: "Cohort monitoring",
              copy: "Trend charts for defaults, recoveries, and score movement."
            },
            {
              icon: Sparkles,
              title: "Portfolio polish",
              copy: "Designed for recruiter screenshots, not tutorial demos."
            }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                <Icon className="h-5 w-5 text-emerald-300" />
                <div className="mt-4 text-lg font-semibold">{item.title}</div>
                <p className="mt-2 text-sm text-slate-300">{item.copy}</p>
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
