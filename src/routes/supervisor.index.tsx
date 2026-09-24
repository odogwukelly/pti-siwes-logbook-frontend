import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/pti/dashboard-layout";
import { StatusPill } from "@/components/pti/status-pill";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, MessageSquare, ShieldCheck, PenLine, UserCheck, Users, RotateCcw, Clock } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthUser } from "@/hooks/useAuthUser";
import { LogEntry } from "@/hooks/useLog";

export const Route = createFileRoute("/supervisor/")({
  head: () => ({ meta: [{ title: "Industry Supervisor — PTI e-SIWES" }] }),
  component: SupervisorDashboard,
});

interface StudentInfo {
  id: number;
  name: string;
  matric: string;
  dept: string;
  week: number;
  compliance: number;
  pending: number;
}

interface DetailedStudent {
  id: number;
  full_name: string;
  matric_number: string;
  department: string;
  email: string;
}

interface SupervisorLogEntry extends LogEntry {
  student_id: number;
  student_name: string;
  matric_number: string;
}

function SupervisorDashboard() {
  const queryClient = useQueryClient();
  const { data: user } = useAuthUser();
  const [commentText, setCommentText] = useState("");
  const [selectedLogId, setSelectedLogId] = useState<number | null>(null);
  const [activeStudentId, setActiveStudentId] = useState<number | undefined>(undefined);

  // 1. Fetch assigned trainees list
  const { data: trainees = [] } = useQuery<StudentInfo[]>({
    queryKey: ["supervisor_trainees", user?.id],
    queryFn: async () => {
      if (typeof window === "undefined") return [];
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No token found");

      const res = await fetch(`http://localhost:8000/api/log/supervisor/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user && typeof window !== "undefined",
  });

  // 2. Fetch all logs using the dedicated supervisor endpoint
  const { data: allTraineesLogs = [], isLoading: logsLoading } = useQuery<SupervisorLogEntry[]>({
    queryKey: ["supervisor_all_logs", user?.id],
    queryFn: async () => {
      if (typeof window === "undefined") return [];
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No token found");

      const res = await fetch(`http://localhost:8000/api/log/supervisor/all-logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch supervisor logs");
      return res.json();
    },
    enabled: !!user && typeof window !== "undefined",
  });

  // Fetch active student details if one is explicitly selected from the table
  const { data: activeStudent } = useQuery<DetailedStudent>({
    queryKey: ["student_details", activeStudentId],
    queryFn: async () => {
      if (!activeStudentId || typeof window === "undefined") return null;
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No token found");

      const res = await fetch(`http://localhost:8000/api/user/${activeStudentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch student details");
      return res.json();
    },
    enabled: !!activeStudentId && typeof window !== "undefined",
  });

  // Filter logs based on active selection first
  const studentFilteredLogs = activeStudentId
    ? allTraineesLogs.filter((l) => l.student_id === activeStudentId)
    : allTraineesLogs;

  // Further filter to show ONLY pending logs in the primary review queue
  const displayedLogs = studentFilteredLogs.filter((l) => l.status === "pending");

  // Mutation to update log status (Approve / Reject)
  const { mutate: updateLogStatus } = useMutation({
    mutationFn: async ({ logId, status }: { logId: number; status: string }) => {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No token found");

      const formData = new FormData();
      formData.append("status", status);

      const res = await fetch(`http://localhost:8000/api/log/update/${logId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to update log status");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Log status updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["supervisor_all_logs"] });
      queryClient.invalidateQueries({ queryKey: ["supervisor_pending_approvals"] });
      queryClient.invalidateQueries({ queryKey: ["supervisor_trainees"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  // Metrics across all trainees
  const totalPendingAll = allTraineesLogs.filter((l) => l.status === "pending").length;
  const activeTraineesCount = trainees.length;
  const approvedThisWeek = allTraineesLogs.filter((l) => l.status === "approved").length;

  return (
    <DashboardLayout
      role="industry"
      title={`Welcome back, ${user?.full_name || "Supervisor"}`}
      subtitle={`${totalPendingAll} total pending logs awaiting sign-off across ${activeTraineesCount} trainees`}
      actions={
        <Button 
          className="bg-pti text-pti-foreground hover:bg-pti/90"
          onClick={() => toast.success("Batch signing initiated for all pending entries.")}
        >
          <ShieldCheck className="size-4 mr-1.5" />Sign weekly batch
        </Button>
      }
    >
      {/* Active Filter Bar / Status Banner */}
      <div className="mb-6 rounded-xl border border-border bg-muted/20 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-pti/10 text-pti grid place-items-center font-bold">
            {activeStudentId ? <UserCheck className="size-5" /> : <Users className="size-5" />}
          </div>
          <div>
            <p className="text-sm font-semibold">
              {activeStudentId ? `Viewing Trainee: ${activeStudent?.full_name}` : "Viewing All Assigned Trainees"}
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              {activeStudentId
                ? `${activeStudent?.matric_number} · ${activeStudent?.department}`
                : `Managing ${activeTraineesCount} active interns in your queue`}
            </p>
          </div>
        </div>
        {activeStudentId && (
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8"
            onClick={() => setActiveStudentId(undefined)}
          >
            <RotateCcw className="size-3.5 mr-1.5" /> View All Trainees
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { l: "Pending review", v: totalPendingAll.toString(), s: "warning" },
          { l: "Approved logs", v: approvedThisWeek.toString(), s: "success" },
          { l: "Active trainees", v: activeTraineesCount.toString(), s: "pti" },
          { l: "Avg. response", v: "1.2d", s: "info" },
        ].map((k) => (
          <div key={k.l} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground">{k.l}</p>
            <p className="text-3xl font-bold font-mono mt-2 tracking-tight">{k.v}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Pending Log History Section */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card overflow-hidden">
          <div className="p-6 pb-4 flex items-center justify-between border-b border-border/60">
            <div>
              <h3 className="font-bold flex items-center gap-2">
                <Clock className="size-4 text-warning" />
                {activeStudentId ? `Pending Logs for ${activeStudent?.full_name}` : "Pending Log Submissions"}
              </h3>
              <p className="text-xs text-muted-foreground">Entries requiring your immediate review, approval, or rejection</p>
            </div>
            <span className="text-xs font-mono bg-warning/10 text-warning px-2.5 py-1 rounded-lg border border-warning/20">
              Pending: {displayedLogs.length}
            </span>
          </div>
          <div className="divide-y divide-border/60 max-h-[600px] overflow-y-auto">
            {logsLoading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">Loading pending logs...</div>
            ) : displayedLogs.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-2">
                <ShieldCheck className="size-8 text-success opacity-80" />
                <p className="font-medium text-foreground">All caught up!</p>
                <p className="text-xs">No pending log submissions to review {activeStudentId ? `for ${activeStudent?.full_name}` : "across any trainees"}.</p>
              </div>
            ) : (
              displayedLogs.map((l: SupervisorLogEntry) => (
                <div key={l.id} className="p-5 hover:bg-muted/30 transition">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <p className="font-semibold text-sm">
                        {l.title}{" "}
                        <span className="text-pti font-medium">· {l.student_name || "Trainee"}</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        #{l.id} · {l.log_date} · {l.hours_worked}h ({l.matric_number})
                      </p>
                    </div>
                    <StatusPill status={l.status} />
                  </div>
                  {/* Shortened activity description with line-clamp */}
                  <div className="mb-3 text-xs text-muted-foreground bg-muted/20 px-3 py-2.5 rounded-lg border border-border/40 overflow-hidden">
                    <p className="line-clamp-2 leading-relaxed">{l.activity_description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      size="sm" 
                      className="bg-success text-success-foreground hover:bg-success/90 shadow-xs h-7 text-xs"
                      onClick={() => updateLogStatus({ logId: l.id, status: "approved" })}
                    >
                      <Check className="size-3 mr-1" />Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="shadow-xs h-7 text-xs"
                      onClick={() => { setSelectedLogId(l.id); toast.info(`Selected ${l.student_name || "Trainee"} log #${l.id} for commenting.`); }}
                    >
                      <MessageSquare className="size-3 mr-1" />Comment
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-destructive hover:text-destructive shadow-xs h-7 text-xs"
                      onClick={() => updateLogStatus({ logId: l.id, status: "rejected" })}
                    >
                      <X className="size-3 mr-1" />Reject
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Comment + Submission Velocity */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-bold mb-3">Add comment {selectedLogId ? `(Log #${selectedLogId})` : ""}</h3>
            <Textarea 
              rows={4} 
              placeholder="Provide feedback to your trainee…" 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <Button 
              className="w-full mt-3 bg-pti text-pti-foreground hover:bg-pti/90"
              onClick={() => {
                if (!commentText.trim()) {
                  toast.error("Please enter a comment before posting.");
                  return;
                }
                toast.success("Feedback posted successfully.");
                setCommentText("");
                setSelectedLogId(null);
              }}
            >
              Post comment
            </Button>
          </div>
          
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-bold mb-1">Submission velocity</h3>
            <p className="text-xs text-muted-foreground mb-5">
              {activeStudentId ? `Hours worked for ${activeStudent?.full_name}` : "Hours worked across all trainees"}
            </p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentFilteredLogs.map((l) => ({ week: l.log_date, hours: l.hours_worked }))}>
                  <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="hours" fill="var(--color-pti)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Trainees Table + Digital Signature */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card overflow-hidden">
          <div className="p-6 pb-4">
            <h3 className="font-bold">My trainees ({trainees.length})</h3>
            <p className="text-xs text-muted-foreground">Click any student to filter their pending logs and inspect details</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-y border-border text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr className="text-left">
                  <th className="px-6 py-3 font-bold">Student</th>
                  <th className="px-6 py-3 font-bold">Dept</th>
                  <th className="px-6 py-3 font-bold">Week</th>
                  <th className="px-6 py-3 font-bold">Compliance</th>
                  <th className="px-6 py-3 font-bold text-right">Pending</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {trainees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-6 text-center text-muted-foreground text-xs">
                      No assigned trainees found.
                    </td>
                  </tr>
                ) : (
                  trainees.map((s) => (
                    <tr 
                      key={s.id} 
                      className={`cursor-pointer hover:bg-muted/30 transition ${activeStudentId === s.id ? "bg-muted/30 font-medium" : ""}`}
                      onClick={() => {
                        setActiveStudentId(s.id);
                        toast.info(`Filtered pending view to ${s.name}`);
                      }}
                    >
                      <td className="px-6 py-3">
                        <p className="font-semibold">{s.name}</p>
                        <p className="text-[11px] font-mono text-muted-foreground">{s.matric}</p>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">{s.dept}</td>
                      <td className="px-6 py-3 font-mono">{s.week}/24</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 bg-secondary rounded-full overflow-hidden">
                            <div className={"h-full rounded-full " + (s.compliance > 85 ? "bg-success" : s.compliance > 70 ? "bg-warning" : "bg-destructive")} style={{ width: `${s.compliance}%` }} />
                          </div>
                          <span className="font-mono text-xs">{s.compliance}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-right font-mono font-semibold">{s.pending}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-bold mb-3">Digital signature</h3>
          <div className="rounded-lg border-2 border-dashed border-border h-28 grid place-items-center font-serif italic text-muted-foreground">
            {user?.full_name || "Supervisor Signature"}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <Button variant="outline" size="sm" onClick={() => toast.info("Re-signing unlocked.")}>
              <PenLine className="size-3.5 mr-1" />Re-sign
            </Button>
            <Button size="sm" className="bg-pti text-pti-foreground hover:bg-pti/90" onClick={() => toast.success("Signature applied to batch.")}>
              <ShieldCheck className="size-3.5 mr-1" />Apply
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}