import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/pti/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileText, FileSpreadsheet, Download } from "lucide-react";

export const Route = createFileRoute("/institution/export")({
  head: () => ({ meta: [{ title: "Export Reports — PTI e-SIWES" }] }),
  component: ExportPage,
});

function ExportPage() {
  return (
    <DashboardLayout role="institution" title="Export reports" subtitle="Generate ITF-compliant reports for your cohort">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 space-y-5">
          <h3 className="font-bold">Report parameters</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>From</Label><Input type="date" className="mt-2" defaultValue="2024-07-01" /></div>
            <div><Label>To</Label><Input type="date" className="mt-2" defaultValue="2024-12-31" /></div>
            <div><Label>Department</Label>
              <select className="mt-2 w-full h-9 px-3 rounded-md border border-input bg-background text-sm"><option>All departments</option><option>Petroleum</option><option>Mechanical</option></select>
            </div>
            <div><Label>Cycle</Label>
              <select className="mt-2 w-full h-9 px-3 rounded-md border border-input bg-background text-sm"><option>2024 — Full</option><option>2024 — Q3</option></select>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-3 pt-4 border-t border-border">
            <Button variant="outline"><FileText className="size-4" />ITF Form 8 (PDF)</Button>
            <Button variant="outline"><FileSpreadsheet className="size-4" />Cohort (XLSX)</Button>
            <Button className="bg-pti text-pti-foreground hover:bg-pti/90"><Download className="size-4" />Generate</Button>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-bold mb-4">Recent exports</h3>
          <div className="space-y-3 text-sm">
            {[{n:"Cohort-Q3-2024.xlsx",s:"4.2 MB",t:"Yesterday"},{n:"ITF-Form8-Petroleum.pdf",s:"1.8 MB",t:"Oct 18"},{n:"Compliance-Report-Sep.pdf",s:"940 KB",t:"Oct 02"}].map(e => (
              <div key={e.n} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                <div><p className="font-semibold truncate">{e.n}</p><p className="text-[11px] text-muted-foreground">{e.s} · {e.t}</p></div>
                <Button size="icon" variant="ghost"><Download className="size-4" /></Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
