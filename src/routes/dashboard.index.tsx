import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/pti/dashboard-layout";
import { StatusPill } from "@/components/pti/status-pill";
import { Button } from "@/components/ui/button";
import { notifications } from "@/lib/mock-data";
import {
  Plus,
  FileDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Sparkles,
  Calendar,
  Building2,
  Bell,
  ArrowRight,
  FileText,
  CalendarDays,
} from "lucide-react";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ title: "Student Dashboard — PTI e-SIWES" }] }),
  component: StudentDashboard,
});

interface StudentLogItem {
  id: number;
  student_id: number;
  hours_worked: number;
  log_date: string;
  title: string;
  activity_description: string;
  skills_acquired?: string;
  challenges_faced?: string;
  evidence_file_url?: string;
  status: "pending" | "approved" | "rejected" | "draft";
  created_at: string;
}

function StudentDashboard() {
  const { data: authUser } = useAuthUser();
  const studentId = authUser?.student_id || authUser?.id || 1;

  const { data: logs = [], isLoading: logsLoading } = useQuery<StudentLogItem[]>({
    queryKey: ["student_logs", studentId],
    queryFn: async () => {
      if (typeof window === "undefined") return [];
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No access token found");

      const res = await fetch(`http://localhost:8000/api/log/all/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch log entries");
      return res.json();
    },
    enabled: !!authUser && typeof window !== "undefined",
  });

  // Extract fields from flattened UserData interface
  const fullName = authUser?.full_name;
  const firstName = fullName ? fullName.split(" ")[0] : "Student";
  
  const department = authUser?.department || "SIWES Trainee";
  const organization = authUser?.industrial_organization || "Assigned Organization";

  // Dynamic calculations from backend log items
  const entriesFiled = logs.length;
  const approvedCount = logs.filter((l) => l.status === "approved").length;
  const pendingCount = logs.filter((l) => l.status === "pending").length;
  const totalHoursWorked = logs.reduce((acc, log) => acc + (Number(log.hours_worked) || 0), 0);
  
  // Dynamic compliance calculation
  const compliance = entriesFiled > 0 ? Math.min(Math.round((approvedCount / entriesFiled) * 100), 100) : 0;

  // Dynamic week estimation based on logs or default start
  const currentWeek = useMemo(() => {
    if (logs.length === 0) return 1;
    const dates = logs.map((l) => new Date(l.log_date).getTime()).filter((t) => !isNaN(t));
    if (dates.length === 0) return 1;
    const earliest = Math.min(...dates);
    const diffWeeks = Math.ceil((Date.now() - earliest) / (7 * 24 * 60 * 60 * 1000));
    return Math.max(diffWeeks, 1);
  }, [logs]);

  return (
    <DashboardLayout
      role="student"
      title={`Welcome back, ${firstName}`}
      subtitle={`Industrial Training Placement · ${organization} (${department})`}
      actions={
        <>
          <Button variant="outline" asChild className="gap-2">
            <Link to="/dashboard/report"><FileDown className="size-4" />Generate report</Link>
          </Button>
          <Button asChild className="bg-pti text-pti-foreground hover:bg-pti/90 gap-2 shadow-sm">
            <Link to="/dashboard/daily-log"><Plus className="size-4" />New log entry</Link>
          </Button>
        </>
      }
    >
      {/* Premium Hero Status Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-r from-card via-card to-secondary/30 p-6 mb-6 shadow-sm">
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden md:block">
          <Sparkles className="size-40 text-pti" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-pti/10 text-pti text-xs font-semibold font-mono">
              <span className="size-2 rounded-full bg-pti animate-pulse" />
              Active Placement Status
            </div>
            <h2 className="text-xl font-bold tracking-tight">SIWES Portal Workspace</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1"><Building2 className="size-3.5 text-pti" /> {organization}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1"><Calendar className="size-3.5 text-pti" /> {department}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-border bg-card/80 px-4 py-2.5 text-center shadow-xs">
              <p className="text-[10px] uppercase font-bold text-muted-foreground font-mono">Est. Week</p>
              <p className="text-lg font-bold font-mono text-pti">Wk {currentWeek}</p>
            </div>
            <div className="rounded-xl border border-border bg-card/80 px-4 py-2.5 text-center shadow-xs">
              <p className="text-[10px] uppercase font-bold text-muted-foreground font-mono">Approval Rate</p>
              <p className="text-lg font-bold font-mono text-success">{compliance}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Kpi icon={Clock} label="Hours logged" value={String(totalHoursWorked)} delta="Total duration" tone="pti" />
        <Kpi icon={CheckCircle2} label="Entries filed" value={String(entriesFiled)} delta={`${approvedCount} approved`} tone="success" />
        <Kpi icon={AlertCircle} label="Pending review" value={String(pendingCount)} delta="Awaiting supervisor" tone="warning" />
        <Kpi icon={TrendingUp} label="Compliance" value={`${compliance}%`} delta="Verified status" tone="info" />
      </div>

      {/* Restructured Layout: Modern Card-Based Feed & Side Notifications */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent logs card list (Expanded to 2 Columns, No Table) */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-5 border-b border-border mb-5">
              <div>
                <h3 className="font-bold flex items-center gap-2"><FileText className="size-4 text-pti" /> Recent log entries</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Latest submissions and supervisor approval status</p>
              </div>
              <Button variant="outline" size="sm" asChild className="gap-1">
                <Link to="/dashboard/daily-log">View all <ArrowRight className="size-3" /></Link>
              </Button>
            </div>

            {/* Non-table modern card list */}
            <div className="space-y-3.5">
              {logsLoading ? (
                <div className="py-12 text-center font-mono text-sm text-muted-foreground animate-pulse">
                  Loading dynamic logs...
                </div>
              ) : logs.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground space-y-2">
                  <p className="text-sm font-medium">No log entries found</p>
                  <p className="text-xs text-muted-foreground">Get started by recording your daily industrial activities.</p>
                </div>
              ) : (
                logs.slice(0, 5).map((l) => (
                  <div key={l.id} className="group rounded-xl border border-border/70 bg-secondary/20 p-4 hover:border-pti/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded font-semibold">#{l.id}</span>
                        <span className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground">
                          <CalendarDays className="size-3 text-pti" /> {l.log_date}
                        </span>
                        <span className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground bg-card px-2 py-0.5 rounded border border-border/40">
                          <Clock className="size-3 text-pti" /> {l.hours_worked} hrs
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm truncate group-hover:text-pti transition">{l.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{l.activity_description}</p>
                    </div>
                    <div className="shrink-0 self-start sm:self-center">
                      <StatusPill status={l.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>Showing recent submissions</span>
            <span className="font-mono">{logs.length} total entries recorded</span>
          </div>
        </div>

        {/* Notifications Feed Column */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold flex items-center gap-2"><Bell className="size-4 text-pti" /> Notifications</h3>
              <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-2.5 py-1 rounded-full font-semibold">Live Feed</span>
            </div>
            <div className="space-y-3.5">
              {notifications.slice(0, 5).map((n) => (
                <div key={n.id} className="flex gap-3 p-3.5 rounded-xl bg-secondary/30 hover:bg-secondary/60 transition border border-border/40">
                  <span
                    className={
                      "size-2.5 rounded-full mt-1.5 shrink-0 " +
                      (n.type === "warning" ? "bg-warning" : n.type === "approval" ? "bg-success" : "bg-pti")
                    }
                  />
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-sm font-semibold truncate">{n.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{n.body}</p>
                    <p className="text-[10px] text-muted-foreground/70 pt-1 font-mono">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-border text-center">
            <p className="text-[11px] text-muted-foreground">All compliance updates sync automatically with your supervisor.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  delta,
  tone,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  delta: string;
  tone: "pti" | "success" | "warning" | "info";
}) {
  const toneCls = {
    pti: "bg-pti/10 text-pti",
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning-foreground",
    info: "bg-info/10 text-info",
  }[tone];
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className={`size-10 rounded-xl grid place-items-center ${toneCls}`}>
          <Icon className="size-5" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono bg-secondary px-2 py-0.5 rounded-md">
          {delta}
        </span>
      </div>
      <p className="text-2xl lg:text-3xl font-bold font-mono mt-4 tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground mt-1 font-medium">{label}</p>
    </div>
  );
}