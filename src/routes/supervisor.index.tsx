import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/pti/dashboard-layout";
import { StatusPill } from "@/components/pti/status-pill";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supervisorStudents, recentLogs, weeklyHours } from "@/lib/mock-data";
import { Check, X, MessageSquare, ShieldCheck, PenLine } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/supervisor/")({
  head: () => ({ meta: [{ title: "Industry Supervisor — PTI e-SIWES" }] }),
  component: SupervisorDashboard,
});

function SupervisorDashboard() {
  return (
    <DashboardLayout
      role="industry"
      title="Supervisor review queue"
      subtitle="12 logs awaiting your sign-off · 6 trainees assigned"
      actions={<Button className="bg-pti text-pti-foreground hover:bg-pti/90"><ShieldCheck className="size-4" />Sign weekly batch</Button>}
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { l: "Pending review", v: "12", s: "warning" },
          { l: "Approved this wk", v: "47", s: "success" },
          { l: "Active trainees", v: "6", s: "pti" },
          { l: "Avg. response", v: "1.4d", s: "info" },
        ].map((k) => (
          <div key={k.l} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground">{k.l}</p>
            <p className="text-3xl font-bold font-mono mt-2 tracking-tight">{k.v}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Review queue */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card overflow-hidden">
          <div className="p-6 pb-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold">Pending log reviews</h3>
              <p className="text-xs text-muted-foreground">Approve, comment, or request revision</p>
            </div>
          </div>
          <div className="divide-y divide-border">
            {recentLogs.slice(0, 4).map((l) => (
              <div key={l.id} className="p-6 hover:bg-muted/30 transition">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <p className="font-semibold text-sm">
                      {l.unit} <span className="text-muted-foreground font-normal">· Efe Okoro</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground font-mono">{l.id} · {l.date} · {l.hours}h</p>
                  </div>
                  <StatusPill status={l.status} />
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{l.activity}</p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="bg-success text-success-foreground hover:bg-success/90"><Check className="size-3.5" />Approve</Button>
                  <Button size="sm" variant="outline"><MessageSquare className="size-3.5" />Comment</Button>
                  <Button size="sm" variant="outline" className="text-destructive hover:text-destructive"><X className="size-3.5" />Reject</Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comment + signature */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-bold mb-3">Add comment</h3>
            <Textarea rows={4} placeholder="Provide feedback to your trainee…" />
            <Button className="w-full mt-3 bg-pti text-pti-foreground hover:bg-pti/90">Post comment</Button>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-bold mb-3">Digital signature</h3>
            <div className="rounded-lg border-2 border-dashed border-border h-28 grid place-items-center font-serif italic text-muted-foreground">
              S. Adebayo
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <Button variant="outline" size="sm"><PenLine className="size-3.5" />Re-sign</Button>
              <Button size="sm" className="bg-pti text-pti-foreground hover:bg-pti/90"><ShieldCheck className="size-3.5" />Apply</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Trainees + chart */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card overflow-hidden">
          <div className="p-6 pb-4">
            <h3 className="font-bold">My trainees</h3>
            <p className="text-xs text-muted-foreground">Compliance and pending entries per student</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-y border-border text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr className="text-left">
                  <th className="px-6 py-3 font-bold">Student</th>
                  <th className="px-6 py-3 font-bold">Dept</th>
                  <th className="px-6 py-3 font-bold">Week</th>
                  <th className="px-6 py-3 font-bold">Compliance</th>
                  <th className="px-6 py-3 font-bold text-right">Pending</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {supervisorStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/30">
                    <td className="px-6 py-3">
                      <p className="font-semibold">{s.name}</p>
                      <p className="text-[11px] font-mono text-muted-foreground">{s.matric}</p>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">{s.dept}</td>
                    <td className="px-6 py-3 font-mono">{s.week}/24</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 bg-secondary rounded-full overflow-hidden">
                          <div className={"h-full rounded-full " + (s.compliance > 85 ? "bg-success" : s.compliance > 70 ? "bg-warning" : "bg-destructive")} style={{ width: `${s.compliance}%` }} />
                        </div>
                        <span className="font-mono text-xs">{s.compliance}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right font-mono font-semibold">{s.pending}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-bold mb-1">Submission velocity</h3>
          <p className="text-xs text-muted-foreground mb-5">Weekly logs from all trainees</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyHours.map((w) => ({ ...w, hours: w.hours + 30 }))}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="hours" fill="var(--color-pti)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}