import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/pti/dashboard-layout";
import { Button } from "@/components/ui/button";
import { departmentStats, monthlyApprovals, auditLogs } from "@/lib/mock-data";
import { Plus, Building2, Users, ScrollText, ShieldCheck } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "ITF / Admin Overview — PTI e-SIWES" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <DashboardLayout role="admin" title="Institution-wide overview" subtitle="PTI Effurun · ITF cycle 2024 · last sync just now"
      actions={<Button className="bg-pti text-pti-foreground hover:bg-pti/90"><Plus className="size-4" />Add user</Button>}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[{ i: Users, l: "Total students", v: "12,408", d: "+184 this cycle" },
          { i: Building2, l: "Active placements", v: "11,902", d: "186 partners" },
          { i: ShieldCheck, l: "Approvals issued", v: "47,318", d: "98.2% rate" },
          { i: ScrollText, l: "Audit events / 24h", v: "342", d: "All clean" }].map((k) => (
          <div key={k.l} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start justify-between">
              <div className="size-9 rounded-lg bg-pti/10 text-pti grid place-items-center"><k.i className="size-4" /></div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{k.d}</span>
            </div>
            <p className="text-2xl lg:text-3xl font-bold font-mono mt-4 tracking-tight">{k.v}</p>
            <p className="text-xs text-muted-foreground mt-1">{k.l}</p>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
          <h3 className="font-bold mb-1">Submission trend</h3>
          <p className="text-xs text-muted-foreground mb-5">All departments · 6 months</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyApprovals}>
                <defs>
                  <linearGradient id="sub" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--color-pti)" stopOpacity={0.4} /><stop offset="100%" stopColor="var(--color-pti)" stopOpacity={0} /></linearGradient>
                  <linearGradient id="app" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--color-success)" stopOpacity={0.35} /><stop offset="100%" stopColor="var(--color-success)" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Area dataKey="submitted" stroke="var(--color-pti)" strokeWidth={2} fill="url(#sub)" />
                <Area dataKey="approved" stroke="var(--color-success)" strokeWidth={2} fill="url(#app)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-bold mb-4">Departments</h3>
          <div className="space-y-3">
            {departmentStats.map((d) => (
              <div key={d.dept}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-semibold">{d.dept}</span>
                  <span className="font-mono text-muted-foreground text-xs">{d.active}/{d.students}</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-pti rounded-full" style={{ width: `${d.compliance}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-6 pb-4 flex items-center justify-between">
          <div><h3 className="font-bold">Audit log</h3><p className="text-xs text-muted-foreground">Recent activity across the institution</p></div>
          <Button variant="outline" size="sm">View full log</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-y border-border text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr className="text-left">
                <th className="px-6 py-3 font-bold">Event</th><th className="px-6 py-3 font-bold">Actor</th>
                <th className="px-6 py-3 font-bold">Action</th><th className="px-6 py-3 font-bold">Target</th>
                <th className="px-6 py-3 font-bold text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {auditLogs.map((a) => (
                <tr key={a.id} className="hover:bg-muted/30">
                  <td className="px-6 py-3 font-mono text-xs text-muted-foreground">{a.id}</td>
                  <td className="px-6 py-3 font-semibold">{a.actor}</td>
                  <td className="px-6 py-3 text-muted-foreground">{a.action}</td>
                  <td className="px-6 py-3 font-mono text-xs">{a.target}</td>
                  <td className="px-6 py-3 text-right text-muted-foreground font-mono text-xs">{a.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
