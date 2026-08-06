import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/pti/dashboard-layout";
import { ActivityHeatmap } from "@/components/pti/activity-heatmap";
import { StatusPill } from "@/components/pti/status-pill";
import { Button } from "@/components/ui/button";
import {
  currentStudent,
  recentLogs,
  weeklyHours,
  skillBreakdown,
  notifications,
} from "@/lib/mock-data";
import {
  Plus,
  FileDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ title: "Student Dashboard — PTI e-SIWES" }] }),
  component: StudentDashboard,
});

const COLORS = ["var(--color-pti)", "var(--color-pti-accent)", "var(--color-success)", "var(--color-warning)", "var(--color-info)"];

function StudentDashboard() {
  return (
    <DashboardLayout
      role="student"
      title={`Good morning, ${currentStudent.name.split(" ")[0]}`}
      subtitle={`Week ${currentStudent.weekCurrent} of ${currentStudent.weekTotal} · ${currentStudent.company}`}
      actions={
        <>
          <Button variant="outline" asChild>
            <Link to="/dashboard/report"><FileDown className="size-4" />Generate report</Link>
          </Button>
          <Button asChild className="bg-pti text-pti-foreground hover:bg-pti/90">
            <Link to="/dashboard/daily-log"><Plus className="size-4" />New log entry</Link>
          </Button>
        </>
      }
    >
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Kpi icon={Clock} label="Hours logged" value={String(currentStudent.hoursLogged)} delta="+18.5 this wk" tone="pti" />
        <Kpi icon={CheckCircle2} label="Entries filed" value={String(currentStudent.entriesFiled)} delta={`${currentStudent.approvals} approved`} tone="success" />
        <Kpi icon={AlertCircle} label="Pending review" value="4" delta="Avg. 2.1 days" tone="warning" />
        <Kpi icon={TrendingUp} label="Compliance" value={`${currentStudent.compliance}%`} delta="+2.4% vs last wk" tone="info" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Progress + heatmap */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">SIWES Progress</p>
              <h3 className="text-lg font-bold mt-1">Industrial training timeline</h3>
            </div>
            <span className="font-mono text-sm bg-secondary px-2.5 py-1 rounded-md font-semibold">
              Wk {currentStudent.weekCurrent} / {currentStudent.weekTotal}
            </span>
          </div>
          <div className="relative h-2.5 bg-secondary rounded-full overflow-hidden mb-2">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-pti to-pti-accent rounded-full"
              style={{ width: `${(currentStudent.weekCurrent / currentStudent.weekTotal) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-muted-foreground font-mono mb-6">
            <span>Aug 5</span><span>Today</span><span>Jan 30</span>
          </div>
          <div className="pt-4 border-t border-border">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Activity heatmap · last 12 weeks</p>
            <ActivityHeatmap />
            <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
              <span>Less</span>
              <div className="flex gap-1 items-center">
                <span className="size-3 rounded-[3px] bg-secondary ring-1 ring-border/40" />
                <span className="size-3 rounded-[3px] bg-pti/15 ring-1 ring-border/40" />
                <span className="size-3 rounded-[3px] bg-pti/40 ring-1 ring-border/40" />
                <span className="size-3 rounded-[3px] bg-pti/70 ring-1 ring-border/40" />
                <span className="size-3 rounded-[3px] bg-pti ring-1 ring-border/40" />
              </div>
              <span>More</span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold">Notifications</h3>
            <Link to="/dashboard/notifications" className="text-xs font-semibold text-pti hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {notifications.slice(0, 4).map((n) => (
              <div key={n.id} className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition">
                <span
                  className={
                    "size-2 rounded-full mt-1.5 shrink-0 " +
                    (n.type === "warning" ? "bg-warning" : n.type === "approval" ? "bg-success" : "bg-pti")
                  }
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{n.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{n.body}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1 font-mono">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
          <h3 className="font-bold mb-1">Weekly hours logged</h3>
          <p className="text-xs text-muted-foreground mb-5">Trailing 7 weeks · target 40h/wk</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyHours}>
                <defs>
                  <linearGradient id="hours" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-pti)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-pti)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="week" stroke="var(--color-muted-foreground)" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="hours" stroke="var(--color-pti)" strokeWidth={2} fill="url(#hours)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-bold mb-1">Skills acquired</h3>
          <p className="text-xs text-muted-foreground mb-5">Distribution by category</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={skillBreakdown} dataKey="value" innerRadius={45} outerRadius={75} paddingAngle={2}>
                  {skillBreakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-3">
            {skillBreakdown.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className="size-2 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
                  {s.name}
                </span>
                <span className="font-mono text-muted-foreground">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent logs table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between p-6 pb-4">
          <div>
            <h3 className="font-bold">Recent log entries</h3>
            <p className="text-xs text-muted-foreground">Latest submissions and their approval status</p>
          </div>
          <Button variant="outline" size="sm" asChild><Link to="/dashboard/daily-log">View all</Link></Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-y border-border">
              <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3 font-bold">ID</th>
                <th className="px-6 py-3 font-bold">Date</th>
                <th className="px-6 py-3 font-bold">Unit</th>
                <th className="px-6 py-3 font-bold">Activity</th>
                <th className="px-6 py-3 font-bold text-right">Hours</th>
                <th className="px-6 py-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentLogs.map((l) => (
                <tr key={l.id} className="hover:bg-muted/30 transition">
                  <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{l.id}</td>
                  <td className="px-6 py-4 font-mono text-xs whitespace-nowrap">{l.date}</td>
                  <td className="px-6 py-4 font-medium whitespace-nowrap">{l.unit}</td>
                  <td className="px-6 py-4 max-w-md text-muted-foreground truncate">{l.activity}</td>
                  <td className="px-6 py-4 text-right font-mono">{l.hours}</td>
                  <td className="px-6 py-4"><StatusPill status={l.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
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
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div className={`size-9 rounded-lg grid place-items-center ${toneCls}`}>
          <Icon className="size-4" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {delta}
        </span>
      </div>
      <p className="text-2xl lg:text-3xl font-bold font-mono mt-4 tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}