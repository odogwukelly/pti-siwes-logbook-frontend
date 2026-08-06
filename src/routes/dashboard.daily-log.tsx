import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/pti/dashboard-layout";
import { StatusPill } from "@/components/pti/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { recentLogs } from "@/lib/mock-data";
import { UploadCloud, Save, Send, X } from "lucide-react";

export const Route = createFileRoute("/dashboard/daily-log")({
  head: () => ({ meta: [{ title: "Daily Log — PTI e-SIWES" }] }),
  component: DailyLogPage,
});

function DailyLogPage() {
  return (
    <DashboardLayout
      role="student"
      title="Daily log entry"
      subtitle="Document today's activities — saved drafts auto-sync every 30 seconds."
    >
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 lg:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input type="date" defaultValue="2024-10-25" className="font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label>Hours worked</Label>
              <Input type="number" defaultValue={8} className="font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label>Department / Unit</Label>
              <Select defaultValue="rig">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="rig">Rig Maintenance</SelectItem>
                  <SelectItem value="hse">HSE</SelectItem>
                  <SelectItem value="lab">Drilling Lab</SelectItem>
                  <SelectItem value="proc">Process Control</SelectItem>
                  <SelectItem value="geo">Geophysics</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Activity description</Label>
            <Textarea
              rows={6}
              placeholder="Describe technical tasks performed, methodology, equipment used and outcomes…"
              defaultValue="Conducted pressure tests on segment 4B pipeline using hydrostatic pump. Documented psi drop over 4-hour interval, prepared anomaly report for senior engineer review."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Skills acquired</Label>
              <Input placeholder="e.g. Hydrostatic testing, Reporting" defaultValue="Hydrostatic testing, Anomaly reporting" />
            </div>
            <div className="space-y-1.5">
              <Label>Challenges encountered</Label>
              <Input placeholder="What slowed you down?" defaultValue="Calibration drift in pressure gauge" />
            </div>
          </div>

          <div>
            <Label>Evidence (photos, certificates, PDFs)</Label>
            <div className="mt-1.5 border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-pti hover:bg-pti/5 transition cursor-pointer">
              <UploadCloud className="size-8 mx-auto text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">Drop files here or click to upload</p>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG, PDF · max 10 MB · geotag preserved</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {["IMG_20241025_0942.jpg", "pressure_log.pdf"].map((f) => (
                <span key={f} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary text-xs font-mono">
                  {f}
                  <X className="size-3 text-muted-foreground hover:text-destructive cursor-pointer" />
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Submitting will route to <span className="font-semibold text-foreground">Engr. Samuel Adebayo</span> for approval.
            </p>
            <div className="flex gap-2">
              <Button variant="outline"><Save className="size-4" />Save draft</Button>
              <Button className="bg-pti text-pti-foreground hover:bg-pti/90"><Send className="size-4" />Submit for review</Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-bold mb-4">This week so far</h3>
            <div className="space-y-3">
              {[
                ["Mon", 8, "approved"],
                ["Tue", 7, "approved"],
                ["Wed", 8, "pending"],
                ["Thu", 0, "draft"],
                ["Fri", 0, "draft"],
              ].map(([d, h, s]) => (
                <div key={d as string} className="flex items-center gap-3">
                  <span className="font-mono text-xs w-8 text-muted-foreground">{d}</span>
                  <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-pti rounded-full" style={{ width: `${((h as number) / 8) * 100}%` }} />
                  </div>
                  <span className="font-mono text-xs w-8 text-right">{h}h</span>
                  <StatusPill status={s as "approved" | "pending" | "draft"} />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-bold mb-4">Recent submissions</h3>
            <div className="space-y-3">
              {recentLogs.slice(0, 4).map((l) => (
                <div key={l.id} className="flex items-start justify-between gap-3 pb-3 last:pb-0 last:border-0 border-b border-border">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{l.unit}</p>
                    <p className="text-[11px] text-muted-foreground font-mono">{l.date} · {l.id}</p>
                  </div>
                  <StatusPill status={l.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}