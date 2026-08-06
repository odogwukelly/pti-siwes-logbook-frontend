import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/pti/dashboard-layout";
import { departmentStats, monthlyApprovals, skillBreakdown } from "@/lib/mock-data";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";

export const Route = createFileRoute("/institution/analytics")({
  head: () => ({ meta: [{ title: "Analytics — PTI e-SIWES" }] }),
  component: AnalyticsPage,
});

const COLORS = ["var(--color-pti)", "var(--color-success)", "var(--color-warning)", "var(--color-pti-accent)", "#94a3b8"];

function AnalyticsPage() {
  return (
    <DashboardLayout role="institution" title="Analytics" subtitle="Cohort performance · Cycle 2024">
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-bold mb-1">Submissions vs approvals</h3>
          <p className="text-xs text-muted-foreground mb-5">Monthly trend</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyApprovals}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Line dataKey="submitted" stroke="var(--color-pti)" strokeWidth={2} dot={{ r: 3 }} />
                <Line dataKey="approved" stroke="var(--color-success)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-bold mb-1">Departmental compliance</h3>
          <p className="text-xs text-muted-foreground mb-5">% of weekly submissions on time</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentStats} layout="vertical">
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                <YAxis type="category" dataKey="dept" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" width={80} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="compliance" fill="var(--color-pti)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-bold mb-1">Skill distribution</h3>
          <p className="text-xs text-muted-foreground mb-5">Aggregated across all logbooks</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={skillBreakdown} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                  {skillBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-bold mb-4">At-risk cohorts</h3>
          <div className="space-y-4">
            {[{l:"Compliance < 60%", v:24, c:"destructive"},{l:"Compliance 60–80%", v:62, c:"warning"},{l:"Inactive 7+ days", v:18, c:"warning"},{l:"No supervisor signed", v:9, c:"destructive"}].map(r => (
              <div key={r.l} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                <span className="text-sm">{r.l}</span>
                <span className={`font-mono font-bold text-${r.c}`}>{r.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
