import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/pti/dashboard-layout";
import { StatusPill } from "@/components/pti/status-pill";
import { Button } from "@/components/ui/button";
import { recentLogs, supervisorStudents } from "@/lib/mock-data";
import { Check, X, Filter, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/supervisor/approvals")({
  head: () => ({ meta: [{ title: "Pending Approvals — PTI e-SIWES" }] }),
  component: ApprovalsPage,
});

function ApprovalsPage() {
  const queue = [...recentLogs, ...recentLogs.slice(0, 5)].map((l, i) => ({ ...l, id: `Q-${100 + i}`, student: supervisorStudents[i % supervisorStudents.length] }));
  return (
    <DashboardLayout role="industry" title="Pending approvals" subtitle={`${queue.length} log entries awaiting your action`}
      actions={<><Button variant="outline"><Filter className="size-4" />Filter</Button><Button className="bg-pti text-pti-foreground hover:bg-pti/90"><ShieldCheck className="size-4" />Bulk sign</Button></>}>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr className="text-left">
                <th className="px-6 py-3 font-bold w-10"><input type="checkbox" /></th>
                <th className="px-6 py-3 font-bold">Log</th>
                <th className="px-6 py-3 font-bold">Student</th>
                <th className="px-6 py-3 font-bold">Activity</th>
                <th className="px-6 py-3 font-bold">Hrs</th>
                <th className="px-6 py-3 font-bold">Status</th>
                <th className="px-6 py-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {queue.map(l => (
                <tr key={l.id} className="hover:bg-muted/30">
                  <td className="px-6 py-3"><input type="checkbox" /></td>
                  <td className="px-6 py-3"><p className="font-mono font-semibold">{l.id}</p><p className="text-[11px] text-muted-foreground">{l.date}</p></td>
                  <td className="px-6 py-3"><p className="font-semibold">{l.student.name}</p><p className="text-[11px] font-mono text-muted-foreground">{l.student.matric}</p></td>
                  <td className="px-6 py-3 max-w-md"><p className="font-semibold">{l.unit}</p><p className="text-xs text-muted-foreground line-clamp-1">{l.activity}</p></td>
                  <td className="px-6 py-3 font-mono">{l.hours}</td>
                  <td className="px-6 py-3"><StatusPill status={l.status} /></td>
                  <td className="px-6 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <Button size="icon" variant="ghost" className="text-success"><Check className="size-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive"><X className="size-4" /></Button>
                    </div>
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
