import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/pti/dashboard-layout";
import { Button } from "@/components/ui/button";
import { departmentStats, monthlyApprovals, supervisorStudents } from "@/lib/mock-data";
import { FileDown } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, BarChart, Bar } from "recharts";

export const Route = createFileRoute("/institution/")({
  head: () => ({ meta: [{ title: "Institution Supervisor — PTI e-SIWES" }] }),
  component: InstitutionDashboard,
});

function InstitutionDashboard() {
  return (
    <DashboardLayout role="institution" title="Department monitoring" subtitle="Petroleum Engineering · 142 students under your oversight"
      actions={<Button variant="outline"><FileDown className="size-4" />Export report</Button>}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[{ l: "Students", v: "142" }, { l: "Active placements", v: "138" }, { l: "Approvals issued", v: "1,612" }, { l: "Compliance", v: "92%" }].map((k) => (
          <div key={k.l} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground">{k.l}</p>
            <p className="text-3xl font-bold font-mono mt-2 tracking-tight">{k.v}</p>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-bold mb-1">Monthly submissions</h3>
          <p className="text-xs text-muted-foreground mb-5">Submitted vs approved · last 6 months</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyApprovals}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line dataKey="submitted" stroke="var(--color-pti)" strokeWidth={2} dot={{ r: 3 }} />
                <Line dataKey="approved" stroke="var(--color-success)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-bold mb-1">Compliance by department</h3>
          <p className="text-xs text-muted-foreground mb-5">Approval rate this cycle</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentStats} layout="vertical">
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                <YAxis dataKey="dept" type="category" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} width={80} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="compliance" fill="var(--color-pti-accent)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-6 pb-4">
          <h3 className="font-bold">Student compliance monitoring</h3>
          <p className="text-xs text-muted-foreground">Flagged students need follow-up</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-y border-border text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr className="text-left">
                <th className="px-6 py-3 font-bold">Student</th><th className="px-6 py-3 font-bold">Dept</th>
                <th className="px-6 py-3 font-bold">Week</th><th className="px-6 py-3 font-bold">Compliance</th>
                <th className="px-6 py-3 font-bold">Pending</th><th className="px-6 py-3 font-bold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {supervisorStudents.map((s) => (
                <tr key={s.id} className="hover:bg-muted/30">
                  <td className="px-6 py-3"><p className="font-semibold">{s.name}</p><p className="text-[11px] font-mono text-muted-foreground">{s.matric}</p></td>
                  <td className="px-6 py-3 text-muted-foreground">{s.dept}</td>
                  <td className="px-6 py-3 font-mono">{s.week}/24</td>
                  <td className="px-6 py-3 font-mono">{s.compliance}%</td>
                  <td className="px-6 py-3 font-mono">{s.pending}</td>
                  <td className="px-6 py-3 text-right">
                    <span className={"text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ring-1 ring-inset " + (s.status === "active" ? "bg-success/10 text-success ring-success/20" : "bg-warning/15 text-warning-foreground ring-warning/30")}>{s.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
