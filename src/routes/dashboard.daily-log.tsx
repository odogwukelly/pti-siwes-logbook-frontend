import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/pti/dashboard-layout";
import { StatusPill } from "@/components/pti/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, FileText, Calendar, Clock, 
  MessageSquare, Send, Wrench, AlertTriangle, 
  CheckCircle2, AlertCircle, Eye, Download, FileDown 
} from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthUser } from "@/hooks/useAuthUser";

export const Route = createFileRoute("/dashboard/daily-log")({
  head: () => ({ meta: [{ title: "My SIWES Logbook — PTI e-SIWES" }] }),
  component: StudentLogbookPage,
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

interface LogComment {
  id: string;
  author: string;
  role: string;
  text: string;
  created_at: string;
}

function StudentLogbookPage() {
  const { data: user } = useAuthUser();

  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected" | "draft">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [inspectingLog, setInspectingLog] = useState<StudentLogItem | null>(null);
  const [commentInput, setCommentInput] = useState("");
  const [logComments, setLogComments] = useState<Record<number, LogComment[]>>({});

  // Resolve student ID safely (fallback to 1 only if user.id is completely missing after load)
  const studentId =  user?.student_id;

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
      
      const json = await res.json();
      
      // Robust parser: Handles both raw arrays and wrapped backend objects (e.g., { logs: [...] } or { data: [...] })
      if (Array.isArray(json)) return json;
      return json.logs || json.data || json.items || [];
    },
    // Only fire query when studentId is fully resolved to prevent fetching with undefined/wrong IDs
    enabled: !!studentId && typeof window !== "undefined",
  });

  const filteredQueue = useMemo(() => {
    let result = [...logs];

    if (statusFilter !== "all") {
      result = result.filter((l) => l.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.activity_description.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime());
    return result;
  }, [logs, statusFilter, searchQuery]);

  const handlePostComment = (logId: number) => {
    if (!commentInput.trim()) {
      toast.error("Please enter a comment.");
      return;
    }
    const newComment: LogComment = {
      id: Math.random().toString(36).substring(7),
      author: user?.full_name || "Student Trainee",
      role: "Trainee",
      text: commentInput.trim(),
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setLogComments((prev) => ({
      ...prev,
      [logId]: [...(prev[logId] || []), newComment],
    }));

    setCommentInput("");
    toast.success("Comment posted.");
  };

  const totalHours = logs.reduce((acc, curr) => acc + (Number(curr.hours_worked) || 0), 0);
  const pendingCount = logs.filter(l => l.status === "pending").length;
const navigate = useNavigate()
  return (
    <DashboardLayout
      role="student"
      title="My SIWES Logbook"
      subtitle="Record daily engineering activities, track supervisor approvals, and monitor your internship progress"
      actions={
        <Button 
          className="h-9 px-4 text-xs font-medium bg-pti text-pti-foreground hover:bg-pti/90 shadow-sm transition-all"
          onClick={()=> {navigate({ to: "/dashboard/new/daily-log" })}}
        >
          <Plus className="size-3.5 mr-1.5" /> New Log Entry
        </Button>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs flex items-center gap-4">
          <div className="size-11 rounded-xl bg-pti/10 text-pti grid place-items-center font-bold">
            <FileText className="size-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Total Entries</p>
            <p className="text-xl font-bold font-mono mt-0.5">{logs.length}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs flex items-center gap-4">
          <div className="size-11 rounded-xl bg-success/10 text-success grid place-items-center font-bold">
            <CheckCircle2 className="size-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Total Hours</p>
            <p className="text-xl font-bold font-mono mt-0.5">{totalHours} hrs</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs flex items-center gap-4">
          <div className="size-11 rounded-xl bg-amber-500/10 text-amber-600 grid place-items-center font-bold">
            <AlertCircle className="size-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Pending Review</p>
            <p className="text-xl font-bold font-mono mt-0.5">{pendingCount}</p>
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-2 border-b border-border pb-4 overflow-x-auto">
        {(["all", "pending", "approved", "rejected", "draft"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition flex items-center gap-2 ${
              statusFilter === tab 
                ? "bg-pti text-pti-foreground shadow-xs" 
                : "bg-card text-muted-foreground hover:bg-muted/60 border border-border/80"
            }`}
          >
            {tab === "all" ? "All Logs" : tab}
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${statusFilter === tab ? "bg-pti-foreground/20 text-pti-foreground" : "bg-muted text-muted-foreground"}`}>
              {tab === "all" ? logs.length : logs.filter(l => l.status === tab).length}
            </span>
          </button>
        ))}
      </div>

      <div className="mb-6">
        <Input 
          placeholder="Search entries by title or description..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md bg-card text-xs h-10 border-border/80"
        />
      </div>

      <div className="rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-muted/50 border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              <tr className="text-left">
                <th className="px-6 py-4">Reference</th>
                <th className="px-6 py-4">Activity Title</th>
                <th className="px-6 py-4">Date Logged</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {logsLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground text-xs">
                    <div className="flex flex-col items-center gap-2">
                      <div className="size-6 rounded-full border-2 border-pti border-t-transparent animate-spin" />
                      Loading your logbook entries...
                    </div>
                  </td>
                </tr>
              ) : filteredQueue.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground text-xs">
                    <p className="font-semibold text-foreground text-sm">No log entries found</p>
                    <p className="text-muted-foreground mt-1">Create a new entry using the button above.</p>
                  </td>
                </tr>
              ) : (
                filteredQueue.map((l) => (
                  <tr key={l.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-foreground">#{l.id}</td>
                    <td className="px-6 py-4 max-w-[280px]">
                      <p className="font-medium text-foreground text-xs truncate" title={l.title}>{l.title}</p>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{l.log_date}</td>
                    <td className="px-6 py-4 font-mono text-xs font-medium">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground">
                        {l.hours_worked} hrs
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusPill status={l.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-7 px-2.5 text-xs font-medium text-pti hover:bg-pti/10 rounded-md transition"
                        onClick={() => setInspectingLog(l)}
                      >
                        <Eye className="size-3.5 mr-1" /> View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {inspectingLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-pti/10 text-pti grid place-items-center font-bold">
                  <FileText className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-pti">Log #{inspectingLog.id}</span>
                    <StatusPill status={inspectingLog.status} />
                  </div>
                  <h2 className="text-base font-bold text-foreground mt-0.5">{inspectingLog.title}</h2>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="size-8 rounded-full" onClick={() => setInspectingLog(null)}>
                ✕
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6 p-6 overflow-y-auto flex-1">
              <div className="space-y-4">
                <div className="rounded-xl border border-border/80 bg-background p-4 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Log Details</h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground">Date</p>
                      <p className="font-mono font-semibold text-foreground mt-0.5 flex items-center gap-1">
                        <Calendar className="size-3 text-pti" /> {inspectingLog.log_date}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Hours Worked</p>
                      <p className="font-mono font-semibold text-foreground mt-0.5 flex items-center gap-1">
                        <Clock className="size-3 text-pti" /> {inspectingLog.hours_worked} hours
                      </p>
                    </div>
                  </div>
                  {inspectingLog.evidence_file_url && (
                    <div className="pt-2 border-t border-border flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <FileDown className="size-3.5 text-pti" /> Evidence Attachment
                      </span>
                      <a 
                        href={`http://localhost:8000/${inspectingLog.evidence_file_url}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-pti hover:underline"
                      >
                        <Download className="size-3" /> Download PDF/File
                      </a>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-border/80 bg-background p-4 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <FileText className="size-3.5 text-pti" /> Activity Description
                  </h3>
                  <div className="rounded-lg bg-muted/30 border border-border/60 p-3 text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap border-l-4 border-l-pti">
                    {inspectingLog.activity_description}
                  </div>
                </div>

                <div className="rounded-xl border border-border/80 bg-background p-4 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Wrench className="size-3.5 text-pti" /> Skills Acquired
                  </h3>
                  <div className="rounded-lg bg-muted/30 border border-border/60 p-3 text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap border-l-4 border-l-pti">
                    {inspectingLog.skills_acquired || <span className="text-muted-foreground italic">None listed.</span>}
                  </div>
                </div>

                <div className="rounded-xl border border-border/80 bg-background p-4 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <AlertTriangle className="size-3.5 text-amber-500" /> Challenges Faced
                  </h3>
                  <div className="rounded-lg bg-muted/30 border border-border/60 p-3 text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap border-l-4 border-l-amber-500">
                    {inspectingLog.challenges_faced || <span className="text-muted-foreground italic">None reported.</span>}
                  </div>
                </div>
              </div>

              <div className="flex flex-col rounded-xl border border-border/80 bg-background p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <MessageSquare className="size-3.5 text-pti" /> Supervisor Feedback & Notes
                  </h3>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {(logComments[inspectingLog.id] || []).length} comments
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-60 pr-1">
                  {(!logComments[inspectingLog.id] || logComments[inspectingLog.id].length === 0) ? (
                    <p className="text-xs text-muted-foreground italic py-2">No comments yet.</p>
                  ) : (
                    logComments[inspectingLog.id].map((c) => (
                      <div key={c.id} className="p-3 rounded-lg bg-muted/40 border border-border/60 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground">{c.author} <span className="text-[10px] text-pti">({c.role})</span></span>
                          <span className="font-mono text-[10px] text-muted-foreground">{c.created_at}</span>
                        </div>
                        <p className="text-muted-foreground">{c.text}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex gap-2 pt-2 border-t border-border">
                  <Textarea 
                    placeholder="Type reply or note for supervisor..."
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    rows={2}
                    className="text-xs bg-card"
                  />
                  <Button 
                    size="sm" 
                    className="bg-pti text-pti-foreground hover:bg-pti/90 h-auto px-3"
                    onClick={() => handlePostComment(inspectingLog.id)}
                  >
                    <Send className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}