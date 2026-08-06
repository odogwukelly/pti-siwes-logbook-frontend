import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/pti/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Plus, Search, MoreHorizontal } from "lucide-react";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "User Management — PTI e-SIWES" }] }),
  component: UsersPage,
});

const users = [
  { name: "Efe Okoro", email: "efe.okoro@pti.edu.ng", role: "Student", dept: "Petroleum", status: "active" },
  { name: "Engr. Samuel Adebayo", email: "s.adebayo@nnpc.com", role: "Industry Sup.", dept: "External", status: "active" },
  { name: "Dr. Ngozi Eze", email: "n.eze@pti.edu.ng", role: "Inst. Sup.", dept: "Petroleum", status: "active" },
  { name: "J. Bala", email: "j.bala@itf.gov.ng", role: "ITF Officer", dept: "ITF", status: "active" },
  { name: "Aisha Bello", email: "aisha.bello@pti.edu.ng", role: "Student", dept: "Mechanical", status: "active" },
  { name: "Tunde Okafor", email: "tunde.okafor@pti.edu.ng", role: "Student", dept: "Welding", status: "suspended" },
  { name: "Halima Sani", email: "halima.sani@pti.edu.ng", role: "Student", dept: "Chemical", status: "pending" },
  { name: "Engr. M. Musa", email: "m.musa@chevron.com", role: "Industry Sup.", dept: "External", status: "active" },
];

function UsersPage() {
  return (
    <DashboardLayout role="admin" title="User management" subtitle="12,408 accounts across all roles"
      actions={<Button className="bg-pti text-pti-foreground hover:bg-pti/90"><Plus className="size-4" />Invite user</Button>}>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border flex flex-wrap gap-3">
          <div className="flex-1 relative min-w-[200px]">
            <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input className="w-full h-9 pl-9 pr-3 text-sm rounded-lg bg-secondary outline-none focus:ring-2 ring-pti/30" placeholder="Search users…" />
          </div>
          <select className="h-9 px-3 rounded-lg bg-secondary text-sm"><option>All roles</option><option>Student</option><option>Supervisor</option><option>Admin</option></select>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
            <tr className="text-left">
              <th className="px-6 py-3 font-bold">User</th>
              <th className="px-6 py-3 font-bold">Role</th>
              <th className="px-6 py-3 font-bold">Department</th>
              <th className="px-6 py-3 font-bold">Status</th>
              <th className="px-6 py-3 font-bold text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map(u => (
              <tr key={u.email} className="hover:bg-muted/30">
                <td className="px-6 py-3"><p className="font-semibold">{u.name}</p><p className="text-[11px] text-muted-foreground">{u.email}</p></td>
                <td className="px-6 py-3 text-muted-foreground">{u.role}</td>
                <td className="px-6 py-3 text-muted-foreground">{u.dept}</td>
                <td className="px-6 py-3">
                  <span className={"text-[10px] font-bold uppercase px-2 py-1 rounded " + (u.status === "active" ? "bg-success/10 text-success" : u.status === "pending" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive")}>{u.status}</span>
                </td>
                <td className="px-6 py-3 text-right"><Button size="icon" variant="ghost"><MoreHorizontal className="size-4" /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
