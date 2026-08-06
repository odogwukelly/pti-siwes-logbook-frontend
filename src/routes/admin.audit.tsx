import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/pti/dashboard-layout";
import { Button } from "@/components/ui/button";
import { auditLogs } from "@/lib/mock-data";
import { Download, Filter } from "lucide-react";

export const Route = createFileRoute("/admin/audit")({
  head: () => ({ meta: [{ title: "Audit Logs — PTI e-SIWES" }] }),
  component: AuditPage,
});

function AuditPage() {
  const all = [...auditLogs, ...auditLogs.map(a => ({ ...a, id: a.id.replace("9", "8"), time: "Yesterday" })), ...auditLogs.map(a => ({ ...a, id: a.id.replace("9", "7"), time: "2 days ago" }))];
  return (
    <DashboardLayout role="admin" title="Audit logs" subtitle="Immutable tamper-evident record of all system activity"
      actions={<><Button variant="outline"><Filter className="size-4" />Filter</Button><Button variant="outline"><Download className="size-4" />Export</Button></>}>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
            <tr className="text-left">
              <th className="px-6 py-3 font-bold">Event ID</th>
              <th className="px-6 py-3 font-bold">Actor</th>
              <th className="px-6 py-3 font-bold">Action</th>
              <th className="px-6 py-3 font-bold">Target</th>
              <th className="px-6 py-3 font-bold">IP</th>
              <th className="px-6 py-3 font-bold text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {all.map((a, i) => (
              <tr key={a.id + i} className="hover:bg-muted/30">
                <td className="px-6 py-3 font-mono text-xs">{a.id}</td>
                <td className="px-6 py-3 font-semibold">{a.actor}</td>
                <td className="px-6 py-3 text-muted-foreground">{a.action}</td>
                <td className="px-6 py-3 font-mono text-xs">{a.target}</td>
                <td className="px-6 py-3 font-mono text-xs text-muted-foreground">102.89.{i % 255}.{(i * 7) % 255}</td>
                <td className="px-6 py-3 text-right text-muted-foreground font-mono text-xs">{a.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
