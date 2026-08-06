import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/pti/dashboard-layout";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/pti/status-pill";
import { recentLogs, supervisorStudents } from "@/lib/mock-data";
import { Check, Eye } from "lucide-react";

export const Route = createFileRoute("/institution/approvals")({
  head: () => ({ meta: [{ title: "Institution Approvals — PTI e-SIWES" }] }),
  component: InstApprovals,
});

function InstApprovals() {
  const items = recentLogs.map((l, i) => ({ ...l, student: supervisorStudents[i % supervisorStudents.length] }));
  return (
    <DashboardLayout role="institution" title="Final approvals" subtitle="Co-sign weekly summaries cleared by industry supervisors">
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr className="text-left">
              <th className="px-6 py-3 font-bold">Student</th>
              <th className="px-6 py-3 font-bold">Week</th>
              <th className="px-6 py-3 font-bold">Industry sign-off</th>
              <th className="px-6 py-3 font-bold">Hours</th>
              <th className="px-6 py-3 font-bold">Status</th>
              <th className="px-6 py-3 font-bold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map(i => (
              <tr key={i.id} className="hover:bg-muted/30">
                <td className="px-6 py-3"><p className="font-semibold">{i.student.name}</p><p className="text-[11px] font-mono text-muted-foreground">{i.student.matric}</p></td>
                <td className="px-6 py-3 font-mono">{i.student.week}/24</td>
                <td className="px-6 py-3 text-muted-foreground">Engr. S. Adebayo · {i.date}</td>
                <td className="px-6 py-3 font-mono">{i.hours * 5}</td>
                <td className="px-6 py-3"><StatusPill status={i.status} /></td>
                <td className="px-6 py-3 text-right">
                  <div className="inline-flex gap-2">
                    <Button size="sm" variant="outline"><Eye className="size-3.5" />Review</Button>
                    <Button size="sm" className="bg-success text-success-foreground hover:bg-success/90"><Check className="size-3.5" />Co-sign</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
