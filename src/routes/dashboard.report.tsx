import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/pti/dashboard-layout";
import { Button } from "@/components/ui/button";
import { currentStudent, recentLogs } from "@/lib/mock-data";
import { Download, Printer } from "lucide-react";

export const Route = createFileRoute("/dashboard/report")({
  head: () => ({ meta: [{ title: "ITF Report — PTI e-SIWES" }] }),
  component: ReportPage,
});

function ReportPage() {
  return (
    <DashboardLayout role="student" title="ITF SIWES Report — Form 8" subtitle="Final report preview ready for institutional and ITF endorsement."
      actions={<><Button variant="outline"><Printer className="size-4" />Print</Button><Button className="bg-pti text-pti-foreground hover:bg-pti/90"><Download className="size-4" />Download PDF</Button></>}>
      <div className="grid lg:grid-cols-[1fr_280px] gap-6">
        <article className="rounded-2xl border border-border bg-white text-slate-900 p-10 lg:p-14 shadow-xl shadow-pti/5">
          <header className="border-b-2 border-pti pb-6 mb-8 flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-pti">Industrial Training Fund · Form 8</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">SIWES Logbook & Final Report</h2>
              <p className="text-xs text-slate-500 mt-1">Petroleum Training Institute · Effurun, Delta State</p>
            </div>
            <div className="size-14 rounded-lg bg-pti text-pti-foreground grid place-items-center font-bold text-2xl">P</div>
          </header>
          <section className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm mb-8">
            <Row label="Student name" value={currentStudent.name} />
            <Row label="Matric number" value={currentStudent.matric} mono />
            <Row label="Department" value={currentStudent.department} />
            <Row label="Level" value={currentStudent.level} />
            <Row label="Host organization" value={currentStudent.company} />
            <Row label="Industry supervisor" value={currentStudent.supervisor} />
            <Row label="Institution supervisor" value={currentStudent.institutionSupervisor} />
            <Row label="Training duration" value="24 weeks · Aug 2024 – Jan 2025" />
          </section>
          <section className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Summary of training</h3>
            <p className="text-sm leading-relaxed text-slate-700">
              Throughout the SIWES placement at NNPC E&P Port Harcourt, the trainee participated in rig maintenance, drilling-fluid laboratory analysis, process-control monitoring and HSE briefings. Core competencies acquired include pressure-sensor calibration, hydrostatic testing, mud rheology evaluation and SCADA-based flow monitoring. Compliance throughout the programme is rated at <strong>{currentStudent.compliance}%</strong>.
            </p>
          </section>
          <section className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Selected weekly entries</h3>
            <table className="w-full text-xs border border-slate-200">
              <thead className="bg-slate-50"><tr className="text-left">
                <th className="px-3 py-2 font-bold">Date</th><th className="px-3 py-2 font-bold">Unit</th>
                <th className="px-3 py-2 font-bold">Activity</th><th className="px-3 py-2 font-bold text-right">Hrs</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-200">
                {recentLogs.slice(0, 5).map((l) => (
                  <tr key={l.id}>
                    <td className="px-3 py-2 font-mono text-[11px]">{l.date}</td>
                    <td className="px-3 py-2">{l.unit}</td>
                    <td className="px-3 py-2 text-slate-600">{l.activity}</td>
                    <td className="px-3 py-2 text-right font-mono">{l.hours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <section className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-slate-200">
            {[{ l: "Student", n: currentStudent.name }, { l: "Industry Supervisor", n: currentStudent.supervisor }, { l: "Institution Supervisor", n: currentStudent.institutionSupervisor }].map((s) => (
              <div key={s.l}>
                <div className="h-12 border-b-2 border-slate-300 mb-2 italic text-slate-400 text-sm flex items-end pb-1 font-serif">signed digitally</div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{s.l}</p>
                <p className="text-sm font-semibold mt-0.5">{s.n}</p>
                <p className="text-[10px] text-slate-400 font-mono">25 Oct 2024</p>
              </div>
            ))}
          </section>
        </article>
        <aside className="space-y-4 h-fit lg:sticky lg:top-24">
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Document status</p>
            <p className="text-2xl font-bold mt-1">Ready</p>
            <p className="text-xs text-muted-foreground mt-1">All required signatures collected.</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Total entries</span><span className="font-mono font-semibold">72</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Total hours</span><span className="font-mono font-semibold">560.5</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Approval rate</span><span className="font-mono font-semibold text-success">94%</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Pages</span><span className="font-mono font-semibold">28</span></div>
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (<div><p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">{label}</p><p className={"text-sm font-semibold mt-0.5 " + (mono ? "font-mono" : "")}>{value}</p></div>);
}
