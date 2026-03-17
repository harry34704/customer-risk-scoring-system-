"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { type DashboardOverview } from "@/lib/types";

const pieColors = ["var(--chart-low)", "var(--chart-medium)", "var(--chart-high)"];

function ChartEmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-[260px] items-center justify-center rounded-3xl border border-dashed border-[color:var(--line)] bg-[color:var(--card)] px-6 text-center text-sm text-[color:var(--muted)]">
      {message}
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
  description
}: {
  active?: boolean;
  payload?: { value: number; name?: string }[];
  label?: string;
  description: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--card-strong)] px-4 py-3 shadow-[var(--surface-shadow-soft)]">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">{label}</div>
      <div className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">{payload[0]?.value}</div>
      <div className="mt-2 max-w-[240px] text-sm leading-6 text-[color:var(--muted)]">{description}</div>
    </div>
  );
}

export function DashboardCharts({ overview }: { overview: DashboardOverview }) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card className="h-[360px]">
        <SectionHeading
          title="Risk distribution"
          description="Current portfolio mix by score band."
          tooltip="This chart helps reviewers understand how many applicants currently sit in low, medium, and high risk buckets for the selected scoring mode."
        />
        {overview.risk_distribution.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie dataKey="value" data={overview.risk_distribution} innerRadius={74} outerRadius={112} paddingAngle={2}>
                {overview.risk_distribution.map((entry, index) => (
                  <Cell key={entry.label} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip description="Each slice shows how many applicants fall into that band. A larger high-risk slice means more manual review pressure." />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ChartEmptyState message="Score a few applicants or load the demo workspace to populate the portfolio mix." />
        )}
      </Card>

      <Card className="h-[360px]">
        <SectionHeading
          title="Defaults by month"
          description="Default counts across the trailing payment cycle."
          tooltip="This trend shows where payment failures are clustering over time. Rising bars typically signal worsening repayment stress or weaker customer follow-up."
        />
        {overview.defaults_by_month.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={overview.defaults_by_month}>
              <CartesianGrid stroke="var(--line)" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip description="The value is the count of payment rows marked defaulted in that month." />} />
              <Bar dataKey="value" fill="var(--chart-defaults)" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ChartEmptyState message="Payment performance will appear here after you load demo data or import repayment history." />
        )}
      </Card>

      <Card className="h-[360px]">
        <SectionHeading
          title="Recovery by segment"
          description="Paid versus due ratio across regions."
          tooltip="Recovery ratio compares cash collected to total cash due. It helps show where regions are underperforming on repayment or collections."
        />
        {overview.recovery_by_segment.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={overview.recovery_by_segment} layout="vertical" margin={{ left: 16 }}>
              <CartesianGrid stroke="var(--line)" horizontal={false} />
              <XAxis type="number" tickLine={false} axisLine={false} />
              <YAxis dataKey="label" type="category" tickLine={false} axisLine={false} width={110} />
              <Tooltip content={<ChartTooltip description="The percentage shows how much of the billed amount was actually collected in each region." />} />
              <Bar dataKey="value" fill="var(--chart-recovery)" radius={[0, 12, 12, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ChartEmptyState message="Regional recovery analysis appears after applicant payments are in the workspace." />
        )}
      </Card>

      <Card className="h-[360px]">
        <SectionHeading
          title="Score trend"
          description="Average risk score by applicant cohort month."
          tooltip="This shows how the average score changes for groups of applicants created in the same month. It is useful for spotting whether new business is getting riskier or healthier."
        />
        {overview.score_trend.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={overview.score_trend}>
              <CartesianGrid stroke="var(--line)" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip description="The value is the average raw score for applicants created in that cohort month." />} />
              <Line type="monotone" dataKey="value" stroke="var(--chart-accent)" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ChartEmptyState message="Cohort trends appear once the workspace has scored applicants across multiple creation dates." />
        )}
      </Card>
    </div>
  );
}
