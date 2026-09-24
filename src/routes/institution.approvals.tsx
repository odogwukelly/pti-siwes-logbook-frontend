import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/pti/dashboard-layout";
import { StatusPill } from "@/components/pti/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Check, X, ShieldCheck, User, Building, Hash, 
  ChevronRight, Eye, Search, ArrowUpDown, FileText, 
  MessageSquare, Clock, Users, Wrench, AlertTriangle, GraduationCap
} from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthUser } from "@/hooks/useAuthUser";

export const Route = createFileRoute("/institution/approvals")({
  head: () => ({ meta: [{ title: "Institution Final Approvals — PTI e-SIWES" }] }),
  component: InstApprovalsPage,
});

interface InstitutionLogItem {
  id: number;
  student_id: number;
  student_name: string;
  matric_number: string;
  department: string;
  log_date: string;
  title: string;
  hours_worked: number;
  activity_description: string;
  skills_acquired?: string;
  challenges_faced?: string;
  industry_supervisor_name?: string;
  industry_signed_at?: string;
  status: "pending_institution" | "approved" | "rejected" | "pending";
}

interface InstitutionStudent {
  id: number;
  name: string;
  matric: string;
  dept: string;
  week: number;
  compliance: number;
  pending: number;
  total_logs: number;
}

function InstApprovalsPage() {
  const queryClient = useQueryClient();
  const { data: user } = useAuthUser();
  const [activeStudentId, setActiveStudentId] = useState<number | null>(null);
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "compliance_desc" | "week_desc">("name");

  // 1. Fetch institution logs queue
  const { data: logs = [], isLoading: logsLoading } = useQuery<InstitutionLogItem[]>({
    queryKey: ["institution_all_logs", user?.id],
    queryFn: async () => {
      if (typeof window === "undefined") return [];
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No access token found");

      const res = await fetch(`http://localhost:8000/api/log/supervisor/all-logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch institution approval logs");
      return res.json();
    },
    enabled: !!user && typeof window !== "undefined",
  });

  // 2. Fetch assigned students list and compute accurate metrics dynamically from their logs
  const { data: students = [], isLoading: studentsLoading } = useQuery<InstitutionStudent[]>({
    queryKey: ["institution_students", user?.id],
    queryFn: async () => {
      if (typeof window === "undefined") return [];
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No token found");

      let apiStudents: any[] = [];
      const res = await fetch(`http://localhost:8000/api/log/supervisor/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          apiStudents = data;
        }
      }

      const result: InstitutionStudent[] = await Promise.all(
        apiStudents.map(async (s) => {
          const studentId = s.id;
          let studentLogs: any[] = [];

          try {
            const logsRes = await fetch(`http://localhost:8000/api/log/all/${studentId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (logsRes.ok) {
              const logsData = await logsRes.json();
              if (Array.isArray(logsData)) {
                studentLogs = logsData;
              }
            }
          } catch (err) {
            // Fallback to basic numbers if individual fetch fails
          }

          const total = studentLogs.length > 0 ? studentLogs.length : (s.total_logs || 0);
          
          const pending = studentLogs.length > 0 
            ? studentLogs.filter((l: any) => l.status === "pending_institution" || l.status === "pending").length 
            : (s.pending_logs || 0);

          const approved = studentLogs.length > 0
            ? studentLogs.filter((l: any) => l.status === "approved").length
            : Math.max(0, total - pending);

          const complianceRate = total > 0 ? Math.round((approved / total) * 100) : 100;

          return {
            id: s.id,
            name: s.name || s.full_name,
            matric: s.matric || s.matric_number || "N/A",
            dept: s.dept || s.department || "General",
            week: Math.min(Math.max(Math.ceil(total / 2), 1), 24),
            compliance: complianceRate,
            pending: pending,
            total_logs: total,
          };
        })
      );

      return result;
    },
    enabled: !!user && typeof window !== "undefined",
  });

  // 3. Fetch logs for the currently active/selected student
  const { data: activeStudentLogs = [], isLoading: activeLogsLoading } = useQuery<InstitutionLogItem[]>({
    queryKey: ["student_individual_logs", activeStudentId],
    queryFn: async () => {
      if (typeof window === "undefined" || activeStudentId === null) return [];
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No access token found");

      const res = await fetch(`http://localhost:8000/api/log/all/${activeStudentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch individual student logs");
      return res.json();
    },
    enabled: activeStudentId !== null && typeof window !== "undefined",
  });

  const activeStudent = students.find((s) => s.id === activeStudentId);

  // Mutation to sign/approve or reject individual logs
  const reviewMutation = useMutation({
    mutationFn: async ({ logId, action }: { logId: number; action: "approve" | "reject" }) => {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No access token found");
      const res = await fetch(`http://localhost:8000/api/log/supervisor/review/${logId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error(`Failed to ${action} log entry`);
      return res.json();
    },
    onSuccess: () => {
      toast.success("Log status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["student_individual_logs", activeStudentId] });
      queryClient.invalidateQueries({ queryKey: ["institution_all_logs"] });
      queryClient.invalidateQueries({ queryKey: ["institution_students"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to process review action");
    }
  });

  const filteredStudents = useMemo(() => {
    let result = [...students];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.matric.toLowerCase().includes(q) ||
          s.dept.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "compliance_desc") {
        return b.compliance - a.compliance;
      }
      if (sortBy === "week_desc") {
        return b.week - a.week;
      }
      return 0;
    });

    return result;
  }, [students, searchQuery, sortBy]);

  const totalPendingCount = students.reduce((acc, s) => acc + s.pending, 0);

  return (
    <DashboardLayout
      role="institution"
      title="Final Approvals & Co-sign"
      subtitle="Co-sign weekly summaries and log entries cleared by industry supervisors"
    >
      <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Overview Summary:</span>
          <span className="px-2.5 py-1 rounded-md bg-pti/10 text-pti font-mono text-xs font-bold">
            {students.length} Total Students
          </span>
          <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 font-mono text-xs font-bold">
            {totalPendingCount} Pending Logs
          </span>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="relative md:col-span-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input 
            placeholder="Search students by name, matric, or dept..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card text-xs h-10 border-border/80"
          />
        </div>

        <div className="flex items-center gap-3 md:col-span-2 justify-end flex-wrap">
          <div className="flex items-center gap-2 bg-card border border-border/80 rounded-lg px-3 h-10">
            <Users className="size-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Student Quick Filter:</span>
            <select
              value={activeStudentId ?? "all"}
              onChange={(e) => {
                const val = e.target.value;
                if (val !== "all") setActiveStudentId(Number(val));
              }}
              className="bg-transparent text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
            >
              <option value="all">Select student to inspect...</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.matric}) — {s.pending} pending
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-card border border-border/80 rounded-lg px-3 h-10">
            <ArrowUpDown className="size-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
            >
              <option value="name">Student Name (A-Z)</option>
              <option value="compliance_desc">Highest Compliance Rate</option>
              <option value="week_desc">Highest Active Week</option>
            </select>
          </div>
        </div>
      </div>

      {/* Restructured Student Detail Modal */}
      {activeStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-border bg-gradient-to-r from-muted/60 to-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-pti/10 text-pti grid place-items-center font-bold ring-2 ring-pti/20 shadow-inner">
                  <User className="size-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-lg font-bold text-foreground">{activeStudent.name}</h3>
                    <span className="text-xs font-mono font-bold text-pti px-2.5 py-0.5 rounded-full bg-pti/10">
                      {activeStudentLogs.length} Total Logs
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-600 px-2.5 py-0.5 rounded-full bg-amber-500/10">
                      {activeStudent.pending} Pending Review
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5 font-mono"><Hash className="size-3.5 text-pti" />{activeStudent.matric}</span>
                    <span className="flex items-center gap-1.5"><Building className="size-3.5 text-pti" />{activeStudent.dept}</span>
                    <span className="font-mono">Week {activeStudent.week}/24 · {activeStudent.compliance}% Compliance</span>
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="size-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted" 
                onClick={() => setActiveStudentId(null)}
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Modal Body: Two-Column or Clean Streamlined Layout */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-background/40">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-foreground">Log Review & Approval Stream</h4>
                  <p className="text-xs text-muted-foreground">Inspect submitted activity details, skills gained, and execute final co-signs</p>
                </div>
                <span className="text-xs font-mono text-muted-foreground bg-muted px-3 py-1 rounded-md">
                  Showing all logs for {activeStudent.name}
                </span>
              </div>

              {activeLogsLoading ? (
                <div className="text-center py-16 border border-dashed border-border rounded-xl bg-card">
                  <p className="text-xs text-muted-foreground animate-pulse">Loading student log entries...</p>
                </div>
              ) : activeStudentLogs.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-border rounded-xl bg-card space-y-2">
                  <FileText className="size-10 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-sm font-semibold text-foreground">No log entries submitted yet</p>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">This student has not submitted any weekly activity logs or reports for inspection.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {activeStudentLogs.map((log) => (
                    <div 
                      key={log.id} 
                      className="border border-border/80 rounded-xl bg-card p-5 shadow-xs hover:shadow-md transition-all space-y-4"
                    >
                      {/* Top Bar: Date, Title & Status */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-mono text-xs font-bold text-pti px-2.5 py-1 rounded-md bg-pti/10 border border-pti/20">
                            {log.log_date}
                          </span>
                          <h5 className="text-sm font-bold text-foreground tracking-tight">{log.title || "Untitled Activity"}</h5>
                        </div>
                        {/* <StatusPill status={log.status} /> */}
                      </div>

                      {/* Description */}
                      <div className="bg-muted/30 p-3.5 rounded-xl border border-border/50 text-xs text-muted-foreground leading-relaxed">
                        <p className="font-medium text-foreground mb-1">Activity Description:</p>
                        {log.activity_description}
                      </div>

                      {/* Skills & Challenges Grid */}
                      {(log.skills_acquired || log.challenges_faced) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          {log.skills_acquired && (
                            <div className="bg-success/5 p-3 rounded-lg border border-success/20">
                              <span className="font-semibold text-success block mb-0.5">Skills Acquired:</span>
                              <span className="text-muted-foreground">{log.skills_acquired}</span>
                            </div>
                          )}
                          {log.challenges_faced && (
                            <div className="bg-amber-500/5 p-3 rounded-lg border border-amber-500/20">
                              <span className="font-semibold text-amber-600 block mb-0.5">Challenges Faced:</span>
                              <span className="text-muted-foreground">{log.challenges_faced}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Footer Info & Action Buttons */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-border/60 text-xs">
                        <div className="flex items-center gap-4 text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1 font-mono bg-muted px-2 py-1 rounded">
                            <Clock className="size-3 text-pti" /> {log.hours_worked} hours worked
                          </span>
                          {log.industry_supervisor_name && (
                            <span className="text-foreground/80">
                              Industry Sign: <strong className="text-foreground font-semibold">{log.industry_supervisor_name}</strong>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2.5 self-end sm:self-auto">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 px-3 text-xs text-destructive hover:bg-destructive/10 border-destructive/30"
                            disabled={reviewMutation.isPending}
                            onClick={() => reviewMutation.mutate({ logId: log.id, action: "reject" })}
                          >
                            <X className="size-3.5 mr-1" /> Reject
                          </Button>
                          <Button 
                            size="sm" 
                            className="h-8 px-3 text-xs bg-success text-success-foreground hover:bg-success/90 shadow-xs"
                            disabled={reviewMutation.isPending}
                            onClick={() => reviewMutation.mutate({ logId: log.id, action: "approve" })}
                          >
                            <Check className="size-3.5 mr-1" /> Approve & Co-sign
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-border bg-muted/40 flex justify-between items-center">
              <span className="text-xs text-muted-foreground font-mono">
                Student ID: #{activeStudent.id}
              </span>
              <Button variant="outline" size="sm" className="text-xs px-4" onClick={() => setActiveStudentId(null)}>
                Close Window
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Assigned Students Summary Table (Pending Log Column Removed) */}
      <div className="rounded-2xl border border-border/85 bg-card shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-pti/10 text-pti grid place-items-center">
              <GraduationCap className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Assigned Students Roster</h3>
              <p className="text-xs text-muted-foreground">Overview of trainees assigned to your institution supervision queue</p>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground">
            Showing {filteredStudents.length} of {students.length} students
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-muted/50 border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              <tr className="text-left">
                <th className="px-6 py-3.5">Student Name & Matric</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Active Week</th>
                <th className="px-6 py-3.5">Compliance Rate</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {studentsLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground text-xs">
                    Loading student roster and calculating compliance metrics...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground text-xs">
                    No assigned students found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-6 py-3.5 align-middle">
                      <p className="font-semibold text-foreground">{st.name}</p>
                      <p className="text-[11px] font-mono text-muted-foreground">{st.matric}</p>
                    </td>
                    <td className="px-6 py-3.5 align-middle text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Building className="size-3 text-pti" /> {st.dept}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 align-middle font-mono text-xs">
                      Week {st.week} / 24
                    </td>
                    <td className="px-6 py-3.5 align-middle font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-28 bg-muted h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${st.compliance >= 70 ? 'bg-success' : st.compliance >= 40 ? 'bg-amber-500' : 'bg-destructive'}`} 
                            style={{ width: `${st.compliance}%` }}
                          />
                        </div>
                        <span className="font-semibold">{st.compliance}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 align-middle text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-3 text-xs text-foreground"
                        onClick={() => setActiveStudentId(st.id)}
                      >
                        <Eye className="size-3 mr-1" /> View Logs
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}