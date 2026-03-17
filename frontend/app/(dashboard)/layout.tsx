import type { ReactNode } from "react";

import { HelpBot } from "@/components/help/help-bot";
import { Sidebar } from "@/components/layout/sidebar";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="mx-auto grid min-h-screen max-w-[1680px] gap-6 px-4 py-6 lg:grid-cols-[340px_1fr] lg:px-6">
        <Sidebar />
        <main className="min-w-0">{children}</main>
      </div>
      <HelpBot />
    </>
  );
}
