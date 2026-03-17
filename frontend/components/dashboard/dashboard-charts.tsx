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
import { type DashboardOverview } from "@/lib/types";

const pieColors = ["#16A34A", "#D97706", "#DC2626"];

export function DashboardCharts({ overview }: { overview: DashboardOverview }) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card className="h-[360px]">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-ink">Risk distribution</h3>
          <p className="text-sm text-slate-500">Current portfolio mix by score band.</p>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie dataKey="value" data={overview.risk_distribution} innerRadius={74} outerRadius={112} paddingAngle={2}>
              {overview.risk_distribution.map((entry, index) => (
                <Cell key={entry.label} fill={pieColors[index % pieColors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      <Card className="h-[360px]">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-ink">Defaults by month</h3>
          <p className="text-sm text-slate-500">Default counts across the trailing payment cycle.</p>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={overview.defaults_by_month}>
            <CartesianGrid stroke="#E2E8F0" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#C2410C" radius={[12, 12, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="h-[360px]">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-ink">Recovery by segment</h3>
          <p className="text-sm text-slate-500">Paid versus due ratio across regions.</p>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={overview.recovery_by_segment} layout="vertical" margin={{ left: 16 }}>
            <CartesianGrid stroke="#E2E8F0" horizontal={false} />
            <XAxis type="number" tickLine={false} axisLine={false} />
            <YAxis dataKey="label" type="category" tickLine={false} axisLine={false} width={110} />
            <Tooltip />
            <Bar dataKey="value" fill="#0F766E" radius={[0, 12, 12, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="h-[360px]">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-ink">Score trend</h3>
          <p className="text-sm text-slate-500">Average risk score by applicant cohort month.</p>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={overview.score_trend}>
            <CartesianGrid stroke="#E2E8F0" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#0F172A" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

