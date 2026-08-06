import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/pti/dashboard-layout";
import { notifications } from "@/lib/mock-data";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/notifications")({
  head: () => ({ meta: [{ title: "Notifications — PTI e-SIWES" }] }),
  component: NotificationsPage,
});

function NotificationsPage() {
  return (
    <DashboardLayout role="student" title="Notifications" subtitle="Approvals, comments, deadlines and system alerts."
      actions={<Button variant="outline"><CheckCheck className="size-4" />Mark all as read</Button>}>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
          {[...notifications, ...notifications].map((n, i) => (
            <div key={i} className="flex items-start gap-4 p-5 hover:bg-muted/30 transition">
              <div className={"size-10 rounded-lg grid place-items-center shrink-0 " + (n.type === "warning" ? "bg-warning/15 text-warning-foreground" : n.type === "approval" ? "bg-success/10 text-success" : "bg-pti/10 text-pti")}>
                <Bell className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold">{n.title}</p>
                  <span className="text-[11px] font-mono text-muted-foreground whitespace-nowrap">{n.time}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{n.body}</p>
              </div>
              {n.unread && <span className="size-2 rounded-full bg-pti mt-2 shrink-0" />}
            </div>
          ))}
        </div>
        <aside className="rounded-2xl border border-border bg-card p-6 h-fit">
          <h3 className="font-bold mb-4">Filters</h3>
          <div className="space-y-2 text-sm">
            {["All", "Approvals", "Reminders", "Comments", "System"].map((f, i) => (
              <button key={f} className={"w-full text-left px-3 py-2 rounded-lg flex items-center justify-between " + (i === 0 ? "bg-pti text-pti-foreground" : "hover:bg-muted")}>
                <span>{f}</span>
                <span className={i === 0 ? "text-pti-foreground/70 text-xs font-mono" : "text-muted-foreground text-xs font-mono"}>{[12, 4, 3, 2, 3][i]}</span>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}
