import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/pti/dashboard-layout";
import { Button } from "@/components/ui/button";
import { supervisorStudents } from "@/lib/mock-data";
import { Mail, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/supervisor/trainees")({
  head: () => ({ meta: [{ title: "My Trainees — PTI e-SIWES" }] }),
  component: TraineesPage,
});

function TraineesPage() {
  return (
    <DashboardLayout role="industry" title="My trainees" subtitle="6 active SIWES placements under your supervision">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {supervisorStudents.map(s => (
          <div key={s.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="size-12 rounded-full bg-pti text-pti-foreground grid place-items-center font-bold">{s.name.split(" ").map(n=>n[0]).join("")}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{s.name}</p>
                <p className="text-[11px] font-mono text-muted-foreground truncate">{s.matric}</p>
                <p className="text-xs text-muted-foreground truncate">{s.dept}</p>
              </div>
              {s.status === "attention" && <span className="text-[9px] font-bold uppercase text-warning bg-warning/10 px-1.5 py-0.5 rounded">Attn</span>}
            </div>
            <div className="grid grid-cols-3 gap-2 text-center mb-4">
              <div className="rounded-lg bg-secondary p-2"><p className="text-lg font-bold font-mono">{s.week}</p><p className="text-[10px] text-muted-foreground uppercase">Week</p></div>
              <div className="rounded-lg bg-secondary p-2"><p className="text-lg font-bold font-mono">{s.compliance}%</p><p className="text-[10px] text-muted-foreground uppercase">Compl.</p></div>
              <div className="rounded-lg bg-secondary p-2"><p className="text-lg font-bold font-mono">{s.pending}</p><p className="text-[10px] text-muted-foreground uppercase">Pending</p></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm"><MessageSquare className="size-3.5" />Chat</Button>
              <Button variant="outline" size="sm"><Mail className="size-3.5" />Email</Button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
