"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FileDown, FileUp, Gauge, Globe2, Scale, Settings, Users } from "lucide-react";

import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/applicants", label: "Applicants", icon: Users },
  { href: "/rules", label: "Rules", icon: Scale },
  { href: "/imports", label: "Imports", icon: FileUp },
  { href: "/reports", label: "Reports", icon: FileDown },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="glass dashboard-grid no-print sticky top-6 flex h-[calc(100vh-3rem)] w-full flex-col overflow-hidden rounded-[32px] border border-[color:var(--line)] p-5 shadow-[var(--surface-shadow)]">
      <div className="hero-panel rounded-[28px] px-5 py-6">
        <div className="mb-4 inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
          Portfolio Build
        </div>
        <h1 className="text-2xl font-semibold leading-tight">Customer Risk Scoring System</h1>
        <p className="mt-3 text-sm leading-6">
          Explainable underwriting for South African and global customer portfolios, with rule logic, recovery visibility, and downloadable evidence.
        </p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1">ZAR / GBP / USD</span>
          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1">Portfolio education</span>
        </div>
      </div>

      <nav className="mt-6 flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                active
                  ? "border border-[color:var(--line)] bg-[color:var(--card-strong)] text-[color:var(--foreground)] shadow-[var(--surface-shadow-soft)]"
                  : "text-[color:var(--muted)] hover:bg-[color:var(--card-strong)] hover:text-[color:var(--foreground)]"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 space-y-4">
        <div className="surface-panel rounded-[28px] p-4">
          <div className="flex items-center gap-3 text-sm font-semibold text-[color:var(--foreground)]">
            <BarChart3 className="h-4 w-4 text-[color:var(--signal-strong)]" />
            Guided risk storytelling
          </div>
          <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
            Tooltips, FAQ support, and modern portfolio views help non-technical reviewers understand why the model is scoring risk the way it does.
          </p>
        </div>

        <div className="surface-panel rounded-[28px] p-4">
          <div className="flex items-center gap-3 text-sm font-semibold text-[color:var(--foreground)]">
            <Globe2 className="h-4 w-4 text-[color:var(--signal-strong)]" />
            Regional currency display
          </div>
          <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
            South African regions display in rand, United Kingdom regions in pounds, and US regions in dollars.
          </p>
        </div>

        <ThemeSwitcher compact />
      </div>
    </aside>
  );
}
