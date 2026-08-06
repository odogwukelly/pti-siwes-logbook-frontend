import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/pti/dashboard-layout";
import { Button } from "@/components/ui/button";
import { supervisorStudents } from "@/lib/mock-data";
import { Search, Download } from "lucide-react";

export const Route = createFileRoute("/institution/students")({
  head: () => ({ meta: [{ title: "Assigned Students — PTI e-SIWES" }] }),
  component: StudentsPage,
});

function StudentsPage() {
  const all = [...supervisorStudents, ...supervisorStudents.map((s,i)=>({...s, id:s.id+"_b", name: ["Daniel Umeh","Halima Sani","Peter Etim","Funke Bakare","Ifeanyi Nwosu","Blessing Ojo"][i], matric: s.matric.replace("0","9")}))];
  return (
    <DashboardLayout role="institution" title="Assigned students" subtitle={`${all.length} students under your supervision`}
      actions={<Button variant="outline"><Download className="size-4" />Export CSV</Button>}>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border flex gap-3">
          <div className="flex-1 relative">
            <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input className="w-full h-9 pl-9 pr-3 text-sm rounded-lg bg-secondary border border-transparent focus:border-pti outline-none" placeholder="Search by name or matric…" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
              <tr className="text-left">
                <th className="px-6 py-3 font-bold">Student</th>
                <th className="px-6 py-3 font-bold">Department</th>
                <th className="px-6 py-3 font-bold">Placement</th>
                <th className="px-6 py-3 font-bold">Week</th>
                <th className="px-6 py-3 font-bold">Compliance</th>
                <th className="px-6 py-3 font-bold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {all.map(s => (
                <tr key={s.id} className="hover:bg-muted/30">
                  <td className="px-6 py-3"><p className="font-semibold">{s.name}</p><p className="text-[11px] font-mono text-muted-foreground">{s.matric}</p></td>
                  <td className="px-6 py-3 text-muted-foreground">{s.dept}</td>
                  <td className="px-6 py-3 text-muted-foreground">NNPC E&P, Port Harcourt</td>
                  <td className="px-6 py-3 font-mono">{s.week}/24</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 bg-secondary rounded-full overflow-hidden">
                        <div className={"h-full rounded-full " + (s.compliance > 85 ? "bg-success" : s.compliance > 70 ? "bg-warning" : "bg-destructive")} style={{ width: `${s.compliance}%` }} />
                      </div>
                      <span className="font-mono text-xs">{s.compliance}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <span className={"text-[10px] font-bold uppercase px-2 py-1 rounded " + (s.status === "active" ? "bg-success/10 text-success" : "bg-warning/10 text-warning")}>{s.status}</span>
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
