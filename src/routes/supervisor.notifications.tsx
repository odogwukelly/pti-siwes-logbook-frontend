import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/pti/dashboard-layout";
import { notifications } from "@/lib/mock-data";
import { Bell, CheckCircle2, AlertTriangle, Info } from "lucide-react";

export const Route = createFileRoute("/supervisor/notifications")({
  head: () => ({ meta: [{ title: "Notifications — PTI e-SIWES" }] }),
  component: SupNotifs,
});

const list = [
  { id: 1, type: "warning", title: "5 logs awaiting review", body: "Trainee Yusuf Ibrahim has 7 unsigned entries.", time: "Just now", unread: true },
  { id: 2, type: "approval", title: "Weekly batch signed", body: "12 logs from this week have been approved.", time: "2h", unread: true },
  { id: 3, type: "info", title: "ITF mid-cycle review", body: "Submit your supervisor evaluation form by Nov 5.", time: "Yesterday", unread: false },
  ...notifications,
];

function ico(t: string) {
  if (t === "approval") return <CheckCircle2 className="size-4 text-success" />;
  if (t === "warning") return <AlertTriangle className="size-4 text-warning" />;
  return <Info className="size-4 text-pti" />;
}

function SupNotifs() {
  return (
    <DashboardLayout role="industry" title="Notifications" subtitle="Inbox · 2 unread">
      <div className="rounded-2xl border border-border bg-card divide-y divide-border max-w-3xl">
        {list.map(n => (
          <div key={n.id} className={"p-5 flex gap-4 hover:bg-muted/30 " + (n.unread ? "bg-pti/[0.02]" : "")}>
            <div className="size-9 rounded-lg bg-secondary grid place-items-center shrink-0">{ico(n.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-sm">{n.title}</p>
                <span className="text-[11px] text-muted-foreground font-mono shrink-0">{n.time}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{n.body}</p>
            </div>
            {n.unread && <span className="size-2 rounded-full bg-pti shrink-0 mt-2" />}
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
