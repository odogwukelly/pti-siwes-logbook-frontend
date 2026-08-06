import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/pti/dashboard-layout";
import { Button } from "@/components/ui/button";
import { recentLogs } from "@/lib/mock-data";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

export const Route = createFileRoute("/dashboard/calendar")({
  head: () => ({ meta: [{ title: "Calendar — PTI e-SIWES" }] }),
  component: CalendarPage,
});

function CalendarPage() {
  const days = Array.from({ length: 35 }, (_, i) => i - 2);
  const today = 24;
  const logged = new Set([2, 3, 4, 7, 8, 9, 10, 11, 14, 15, 16, 17, 18, 21, 22, 23, 24]);
  const pending = new Set([23]);
  return (
    <DashboardLayout role="student" title="Activity calendar" subtitle="October 2024 · 17 of 23 working days logged"
      actions={<Button className="bg-pti text-pti-foreground hover:bg-pti/90"><Plus className="size-4" />Log today</Button>}>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">October 2024</h3>
            <div className="flex gap-1">
              <Button variant="outline" size="icon"><ChevronLeft className="size-4" /></Button>
              <Button variant="outline" size="icon"><ChevronRight className="size-4" /></Button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-2">
            {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => <div key={d} className="px-2">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {days.map((d, i) => {
              const valid = d > 0 && d <= 31;
              const isToday = d === today;
              const has = logged.has(d);
              const pend = pending.has(d);
              return (
                <div key={i} className={`aspect-square rounded-lg border p-2 text-xs ${!valid ? "opacity-30 border-transparent" : "border-border hover:border-pti cursor-pointer"} ${isToday ? "bg-pti text-pti-foreground border-pti" : has ? "bg-success/10 border-success/30" : pend ? "bg-warning/10 border-warning/30" : ""}`}>
                  <div className="font-mono font-bold">{valid ? d : ""}</div>
                  {has && !isToday && <div className="text-[9px] mt-1 text-success font-semibold">8h</div>}
                  {pend && <div className="text-[9px] mt-1 text-warning font-semibold">7h</div>}
                  {isToday && <div className="text-[9px] mt-1">Today</div>}
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-4 mt-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-2"><span className="size-3 rounded bg-success/20 border border-success/40" />Approved</span>
            <span className="flex items-center gap-2"><span className="size-3 rounded bg-warning/20 border border-warning/40" />Pending</span>
            <span className="flex items-center gap-2"><span className="size-3 rounded bg-pti" />Today</span>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-bold mb-4">Recent entries</h3>
          <div className="space-y-4">
            {recentLogs.slice(0, 5).map(l => (
              <div key={l.id} className="border-l-2 border-pti pl-3">
                <p className="text-xs font-mono text-muted-foreground">{l.date}</p>
                <p className="text-sm font-semibold">{l.unit}</p>
                <p className="text-xs text-muted-foreground">{l.hours}h · {l.status}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
