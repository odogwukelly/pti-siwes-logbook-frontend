import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/pti/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { useLogs } from "@/hooks/useLog";
import { useAuthUser } from "@/hooks/useAuthUser"; // Using your custom auth hook
import { getUserById } from "@/hooks/useUser";
import { PtiLogo } from "@/components/pti/logo";

export const Route = createFileRoute("/dashboard/report")({
  head: () => ({ meta: [{ title: "ITF Report — PTI e-SIWES" }] }),
  component: ReportPage,
});

function ReportPage() {
  const { data: user } = useAuthUser();
  const { data: logs = [] } = useLogs(user?.student_id);
  const { data: supervisor } = getUserById(user.industry_supervisor_id);
  const { data: institute_supervisor } = getUserById(user.institution_supervisor_id);


  // Calculate dynamic metrics from logs
  const totalEntries = logs.length;
  const totalHours = logs.reduce((acc, l) => acc + (Number(l.hours_worked) || 0), 0);
  const approvedCount = logs.filter((l) => l.status === "approved").length;
  const approvalRate = totalEntries > 0 ? Math.round((approvedCount / totalEntries) * 100) : 0;

  // Estimate pages based on entry count (e.g. ~3 entries per page)
  const estimatedPages = Math.max(1, Math.ceil(totalEntries / 3));

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout
      role="student"
      title="ITF SIWES Report — Form 8"
      subtitle="Final report preview ready for institutional and ITF endorsement."
      actions={
        <>
          <Button className="bg-pti text-pti-foreground hover:bg-pti/90" onClick={handlePrint}>
            <Printer className="size-4 mr-1.5" />Print
          </Button>
        </>
      }
    >
      <div className="grid lg:grid-cols-[1fr_280px] gap-6">
        <article className="rounded-2xl border border-border bg-white text-slate-900 p-10 lg:p-14 shadow-xl shadow-pti/5">
          <header className="border-b-2 border-pti pb-6 mb-8 flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-pti">Industrial Training Fund · Form 8</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">SIWES Logbook & Final Report</h2>
              <p className="text-xs text-slate-500 mt-1">Petroleum Training Institute · Effurun, Delta State</p>
            </div>
            <PtiLogo compact={true} logoSize={15} redirectUrl=""/>
          </header>

          <section className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm mb-8">
            <Row label="Student name" value={user?.full_name || "—"} />
            <Row label="Matric number" value={user?.matric_number || "—"} mono />
            <Row label="Department" value={user?.department || "—"} />
            <Row label="Level" value="ND II" />
            <Row label="Host organization" value={user?.industrial_organization || "—"} />
            <Row label="Industry supervisor" value={supervisor?.full_name || "—"} mono />
            <Row label="Institution supervisor" value={institute_supervisor?.full_name || "—"} mono />
            <Row label="Training duration" value="24 weeks · Active Placement" />
          </section>

          <section className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Summary of training</h3>
            <p className="text-sm leading-relaxed text-slate-700">
              Throughout the SIWES placement at {user?.industrial_organization || "the host organization"}, the trainee participated in practical engineering workflows, technical maintenance, equipment calibration, and HSE safety briefings. Core competencies acquired include technical logging, data analysis, troubleshooting, and system monitoring. Compliance throughout the programme is rated at <strong>{approvalRate}%</strong>.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Selected weekly entries</h3>
            <table className="w-full text-xs border border-slate-200">
              <thead className="bg-slate-50">
                <tr className="text-left">
                  <th className="px-3 py-2 font-bold">Date</th>
                  <th className="px-3 py-2 font-bold">Title</th>
                  <th className="px-3 py-2 font-bold">Activity</th>
                  <th className="px-3 py-2 font-bold text-right">Hrs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-4 text-center text-slate-400">
                      No logs recorded yet. Submit entries to populate your report.
                    </td>
                  </tr>
                ) : (
                  logs.slice(0, 5).map((l) => (
                    <tr key={l.id}>
                      <td className="px-3 py-2 font-mono text-[11px]">{l.log_date}</td>
                      <td className="px-3 py-2 font-medium">{l.title}</td>
                      <td className="px-3 py-2 text-slate-600 truncate max-w-xs">{l.activity_description}</td>
                      <td className="px-3 py-2 text-right font-mono">{l.hours_worked}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>

          <section className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-slate-200">
            {[
              { l: "Student", n: user?.full_name },
              { l: "Industry Supervisor", n: `${supervisor?.full_name || "Pending"}` },
              { l: "Institution Supervisor", n: `${institute_supervisor?.full_name || "Pending"}` }
            ].map((s) => (
              <div key={s.l}>
                <div className="h-12 border-b-2 border-slate-300 mb-2 italic text-slate-400 text-sm flex items-end pb-1 font-serif">signed digitally</div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{s.l}</p>
                <p className="text-sm font-semibold mt-0.5">{s.n || "Pending"}</p>
                <p className="text-[10px] text-slate-400 font-mono">Verified</p>
              </div>
            ))}
          </section>
        </article>

        <aside className="space-y-4 h-fit lg:sticky lg:top-24">
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Document status</p>
            <p className="text-2xl font-bold mt-1">{totalEntries > 0 ? "Ready" : "Incomplete"}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {totalEntries > 0 ? "Live logs successfully synced." : "Add entries to compile report."}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Total entries</span><span className="font-mono font-semibold">{totalEntries}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Total hours</span><span className="font-mono font-semibold">{totalHours}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Approval rate</span><span className="font-mono font-semibold text-success">{approvalRate}%</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Pages</span><span className="font-mono font-semibold">{estimatedPages}</span></div>
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">{label}</p>
      <p className={"text-sm font-semibold mt-0.5 " + (mono ? "font-mono" : "")}>{value}</p>
    </div>
  );
}