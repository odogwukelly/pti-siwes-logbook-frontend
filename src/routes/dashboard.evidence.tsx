import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/pti/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Image as ImageIcon, FileVideo, MoreHorizontal, Download } from "lucide-react";

export const Route = createFileRoute("/dashboard/evidence")({
  head: () => ({ meta: [{ title: "Evidence Vault — PTI e-SIWES" }] }),
  component: EvidencePage,
});

const files = [
  { name: "Pressure-test-Well4.pdf", type: "pdf", size: "2.4 MB", date: "Oct 24", log: "L-0072" },
  { name: "SCADA-readings-station2.xlsx", type: "doc", size: "880 KB", date: "Oct 22", log: "L-0070" },
  { name: "Mud-rheology-sample.jpg", type: "img", size: "3.1 MB", date: "Oct 21", log: "L-0069" },
  { name: "Drill-floor-walkthrough.mp4", type: "vid", size: "48 MB", date: "Oct 18", log: "L-0068" },
  { name: "Pipeline-anomaly-report.pdf", type: "pdf", size: "1.2 MB", date: "Oct 17", log: "L-0067" },
  { name: "HSE-drill-photos.zip", type: "doc", size: "12 MB", date: "Oct 16", log: "L-0066" },
];

function icon(t: string) {
  if (t === "img") return <ImageIcon className="size-5" />;
  if (t === "vid") return <FileVideo className="size-5" />;
  return <FileText className="size-5" />;
}

function EvidencePage() {
  return (
    <DashboardLayout role="student" title="Evidence vault" subtitle="42 files · 184 MB used of 2 GB"
      actions={<Button className="bg-pti text-pti-foreground hover:bg-pti/90"><Upload className="size-4" />Upload evidence</Button>}>
      <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 p-10 text-center mb-6">
        <Upload className="size-8 text-muted-foreground mx-auto mb-3" />
        <p className="font-semibold">Drag and drop files here</p>
        <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, XLSX, PNG, JPG, MP4 · max 50 MB per file</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map(f => (
          <div key={f.name} className="rounded-xl border border-border bg-card p-4 hover:border-pti/40 transition group">
            <div className="flex items-start justify-between mb-3">
              <div className="size-10 rounded-lg bg-pti/10 text-pti grid place-items-center">{icon(f.type)}</div>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100"><MoreHorizontal className="size-4" /></Button>
            </div>
            <p className="font-semibold text-sm truncate">{f.name}</p>
            <p className="text-xs text-muted-foreground mt-1">{f.size} · {f.date}</p>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <span className="text-[10px] font-mono font-bold text-pti">{f.log}</span>
              <Button variant="ghost" size="sm"><Download className="size-3.5" /></Button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
