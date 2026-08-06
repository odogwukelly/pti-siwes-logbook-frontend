import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/pti/dashboard-layout";
import { Button } from "@/components/ui/button";
import { departmentStats } from "@/lib/mock-data";
import { Plus, Building2 } from "lucide-react";

export const Route = createFileRoute("/admin/departments")({
  head: () => ({ meta: [{ title: "Departments — PTI e-SIWES" }] }),
  component: DeptPage,
});

function DeptPage() {
  return (
    <DashboardLayout role="admin" title="Departments" subtitle={`${departmentStats.length} active departments · 522 students`}
      actions={<Button className="bg-pti text-pti-foreground hover:bg-pti/90"><Plus className="size-4" />New department</Button>}>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {departmentStats.map(d => (
          <div key={d.dept} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="size-10 rounded-lg bg-pti/10 text-pti grid place-items-center"><Building2 className="size-5" /></div>
              <span className={"text-[10px] font-bold uppercase px-2 py-0.5 rounded " + (d.compliance > 85 ? "bg-success/10 text-success" : "bg-warning/10 text-warning")}>{d.compliance}% comply</span>
            </div>
            <p className="font-bold text-lg">{d.dept} Engineering</p>
            <p className="text-xs text-muted-foreground">School of Engineering · PTI Effurun</p>
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border">
              <div><p className="text-2xl font-bold font-mono">{d.students}</p><p className="text-[10px] text-muted-foreground uppercase">Students</p></div>
              <div><p className="text-2xl font-bold font-mono">{d.active}</p><p className="text-[10px] text-muted-foreground uppercase">Active</p></div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
