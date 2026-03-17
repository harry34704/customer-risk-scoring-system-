"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FileDown, FileUp, Gauge, Scale, Settings, Users } from "lucide-react";

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
    <aside className="glass dashboard-grid no-print sticky top-6 flex h-[calc(100vh-3rem)] w-full flex-col overflow-hidden rounded-[32px] border border-white/80 p-5 shadow-soft">
      <div className="rounded-[28px] bg-ink px-5 py-6 text-white">
        <div className="mb-4 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
          Portfolio Build
        </div>
        <h1 className="text-2xl font-semibold leading-tight">Customer Risk Scoring System</h1>
        <p className="mt-3 text-sm text-slate-300">
          Dual-mode risk operations workspace with explainable policy logic and baseline modeling.
        </p>
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
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition",
                active ? "bg-white text-ink shadow-md" : "hover:bg-white/70 hover:text-ink"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="rounded-[28px] border border-slate-200 bg-white/80 p-4">
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
          <BarChart3 className="h-4 w-4 text-signal" />
          Screenshot-ready UI
        </div>
        <p className="mt-2 text-sm text-slate-500">
          Balanced density, risk storytelling, and exportable reports tuned for portfolio demos.
        </p>
      </div>
    </aside>
  );
}

