import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/pti/dashboard-layout";
import { StatusPill } from "@/components/pti/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Check, X, ShieldCheck, User, Building, Hash, 
  ChevronRight, Eye, Search, ArrowUpDown, FileText, Download, 
  MessageSquare, Send, Calendar, Clock, Users, Wrench, AlertTriangle 
} from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthUser } from "@/hooks/useAuthUser";

export const Route = createFileRoute("/supervisor/approvals")({
  head: () => ({ meta: [{ title: "Trainee Log Approvals — PTI e-SIWES" }] }),
  component: ApprovalsPage,
});

interface LogApprovalItem {
  id: number;
  student_id: number;
  student_name: string;
  matric_number: string;
  log_date: string;
  title: string;
  hours_worked: number;
  activity_description: string;
  skills_acquired?: string;
  challenges_faced?: string;
  status: "pending" | "approved" | "rejected" | "draft";
  pdf_url?: string;
}

interface AssignedStudent {
  id: number;
  name: string;
  matric: string;
  dept: string;
  week: number;
  compliance: number;
  pending: number;
}

interface LogComment {
  id: string;
  author: string;
  role: string;
  text: string;
  created_at: string;
}

function ApprovalsPage() {
  const queryClient = useQueryClient();
  const { data: user } = useAuthUser();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [activeStudentId, setActiveStudentId] = useState<number | null>(null);
  const navigate = useNavigate();

  // Search, Status Tab, & Filtering state
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date_desc" | "date_asc" | "hours_desc" | "student">("date_desc");

  // Modal inspection state
  const [inspectingLog, setInspectingLog] = useState<LogApprovalItem | null>(null);
  const [commentInput, setCommentInput] = useState("");
  const [logComments, setLogComments] = useState<Record<number, LogComment[]>>({});

  // 1. Fetch ALL logs using your backend /supervisor/all-logs endpoint
  const { data: logs = [], isLoading: logsLoading } = useQuery<LogApprovalItem[]>({
    queryKey: ["supervisor_all_logs", user?.id],
    queryFn: async () => {
      if (typeof window === "undefined") return [];
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No access token found");

      const res = await fetch(`http://localhost:8000/api/log/supervisor/all-logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch supervisor logs");
      return res.json();
    },
    enabled: !!user && typeof window !== "undefined",
  });

  // 2. Fetch assigned trainees list for the dropdown filter using /supervisor/students
  const { data: trainees = [] } = useQuery<AssignedStudent[]>({
    queryKey: ["supervisor_students", user?.id],
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

  // Get active student details from the fetched trainees list
  const activeStudent = trainees.find((s) => s.id === activeStudentId);

  // 3. Mutation to update single log status via PUT /api/log/update/{log_id}
  const { mutate: updateStatus } = useMutation({
    mutationFn: async ({ logId, status }: { logId: number; status: "approved" | "rejected" }) => {
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
        throw new Error(err.detail || `Failed to update log #${logId}`);
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      toast.success(`Log entry #${variables.logId} ${variables.status}.`);
      queryClient.invalidateQueries({ queryKey: ["supervisor_all_logs"] });
      queryClient.invalidateQueries({ queryKey: ["supervisor_students"] });
      if (inspectingLog?.id === variables.logId) {
        setInspectingLog(null);
      }
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  // Filtered and Sorted queue computation
  const filteredQueue = useMemo(() => {
    let result = [...logs];

    // Status tab filter
    if (statusFilter !== "all") {
      result = result.filter((l) => l.status === statusFilter);
    }

    // Search query filter (matches title, description, trainee name, or matric number)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.activity_description.toLowerCase().includes(q) ||
          (l.student_name && l.student_name.toLowerCase().includes(q)) ||
          (l.matric_number && l.matric_number.toLowerCase().includes(q))
      );
    }

    // Active student filter from banner or trainee selection dropdown
    if (activeStudentId !== null) {
      result = result.filter((l) => l.student_id === activeStudentId);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "date_desc") {
        return new Date(b.log_date).getTime() - new Date(a.log_date).getTime();
      }
      if (sortBy === "date_asc") {
        return new Date(a.log_date).getTime() - new Date(b.log_date).getTime();
      }
      if (sortBy === "hours_desc") {
        return b.hours_worked - a.hours_worked;
      }
      if (sortBy === "student") {
        return (a.student_name || "").localeCompare(b.student_name || "");
      }
      return 0;
    });

    return result;
  }, [logs, statusFilter, searchQuery, activeStudentId, sortBy]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredQueue.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredQueue.map((l) => l.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkSign = () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one log entry to bulk sign.");
      return;
    }
    toast.success(`Bulk signing initiated for ${selectedIds.length} entries.`);
    selectedIds.forEach((id) => {
      updateStatus({ logId: id, status: "approved" });
    });
    setSelectedIds([]);
  };

  const handlePostComment = (logId: number) => {
    if (!commentInput.trim()) {
      toast.error("Please enter a comment or feedback message.");
      return;
    }
    const newComment: LogComment = {
      id: Math.random().toString(36).substring(7),
      author: user?.full_name || "Industry Supervisor",
      role: "Industry Supervisor",
      text: commentInput.trim(),
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setLogComments((prev) => ({
      ...prev,
      [logId]: [...(prev[logId] || []), newComment],
    }));

    setCommentInput("");
    toast.success("Feedback comment posted successfully.");
  };

  // Count metrics for tabs
  const pendingCount = logs.filter(l => l.status === "pending").length;
  const approvedCount = logs.filter(l => l.status === "approved").length;
  const rejectedCount = logs.filter(l => l.status === "rejected").length;

  return (
    <DashboardLayout
      role="industry"
      title="Trainee Log Approvals"
      subtitle={`Review, validate, and manage all ${logs.length} submitted log entries across your assigned trainees`}
      actions={
        <div className="flex items-center gap-2">
          <Button 
            className="h-9 px-4 text-xs font-medium bg-pti text-pti-foreground hover:bg-pti/90 shadow-sm transition-all"
            onClick={handleBulkSign}
          >
            <ShieldCheck className="size-3.5 mr-1.5" />Bulk Sign Selected ({selectedIds.length})
          </Button>
        </div>
      }
    >
      {/* Status Tab Filter Bar */}
      <div className="mb-6 flex items-center gap-2 border-b border-border pb-4 overflow-x-auto">
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
            statusFilter === "all" 
              ? "bg-pti text-pti-foreground shadow-xs" 
              : "bg-card text-muted-foreground hover:bg-muted/60 border border-border/80"
          }`}
        >
          All Logs
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${statusFilter === "all" ? "bg-pti-foreground/20 text-pti-foreground" : "bg-muted text-muted-foreground"}`}>
            {logs.length}
          </span>
        </button>
        <button
          onClick={() => setStatusFilter("pending")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
            statusFilter === "pending" 
              ? "bg-pti text-pti-foreground shadow-xs" 
              : "bg-card text-muted-foreground hover:bg-muted/60 border border-border/80"
          }`}
        >
          Pending Review
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${statusFilter === "pending" ? "bg-pti-foreground/20 text-pti-foreground" : "bg-amber-500/10 text-amber-600 font-bold"}`}>
            {pendingCount}
          </span>
        </button>
        <button
          onClick={() => setStatusFilter("approved")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
            statusFilter === "approved" 
              ? "bg-pti text-pti-foreground shadow-xs" 
              : "bg-card text-muted-foreground hover:bg-muted/60 border border-border/80"
          }`}
        >
          Approved
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${statusFilter === "approved" ? "bg-pti-foreground/20 text-pti-foreground" : "bg-success/10 text-success font-bold"}`}>
            {approvedCount}
          </span>
        </button>
        <button
          onClick={() => setStatusFilter("rejected")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
            statusFilter === "rejected" 
              ? "bg-pti text-pti-foreground shadow-xs" 
              : "bg-card text-muted-foreground hover:bg-muted/60 border border-border/80"
          }`}
        >
          Rejected
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${statusFilter === "rejected" ? "bg-pti-foreground/20 text-pti-foreground" : "bg-destructive/10 text-destructive font-bold"}`}>
            {rejectedCount}
          </span>
        </button>
      </div>

      {/* Filtering and Search Controls Bar */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="relative md:col-span-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input 
            placeholder="Search by title, student, or matric..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card text-xs h-10 border-border/80"
          />
        </div>

        <div className="flex items-center gap-3 md:col-span-2 justify-end flex-wrap">
          <div className="flex items-center gap-2 bg-card border border-border/80 rounded-lg px-3 h-10">
            <Users className="size-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Trainee:</span>
            <select
              value={activeStudentId ?? "all"}
              onChange={(e) => setActiveStudentId(e.target.value === "all" ? null : Number(e.target.value))}
              className="bg-transparent text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
            >
              <option value="all">All   ({trainees.length})</option>
              {trainees.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.matric})
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
              <option value="date_desc">Newest Log Date</option>
              <option value="date_asc">Oldest Log Date</option>
              <option value="hours_desc">Highest Hours Worked</option>
              <option value="student">Trainee Name (A-Z)</option>
            </select>
          </div>

          {(searchQuery || activeStudentId !== null || statusFilter !== "all" || sortBy !== "date_desc") && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-10 px-3 text-muted-foreground hover:text-foreground"
              onClick={() => {
                setSearchQuery("");
                setActiveStudentId(null);
                setStatusFilter("all");
                setSortBy("date_desc");
              }}
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Active Trainee Inspector Bar */}
      {activeStudent && (
        <div className="mb-6 rounded-2xl border border-border/80 bg-gradient-to-r from-card via-card/90 to-muted/20 p-5 shadow-lg flex items-center justify-between backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-4">
            <div className="size-11 rounded-xl bg-pti/10 text-pti grid place-items-center font-bold ring-2 ring-pti/20">
              <User className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-mono tracking-wider text-pti font-bold px-2 py-0.5 rounded bg-pti/10">
                  Filtered Trainee Profile
                </span>
              </div>
              <p className="text-base font-bold mt-1">{activeStudent.name}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                <span className="flex items-center gap-1 font-mono"><Hash className="size-3 text-pti" />{activeStudent.matric}</span>
                <span className="flex items-center gap-1"><Building className="size-3 text-pti" />{activeStudent.dept}</span>
                <span className="flex items-center gap-1 font-mono">Week {activeStudent.week}/24 · {activeStudent.compliance}% Compliance</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-xs h-8 text-muted-foreground hover:text-foreground" onClick={
            () => {
              setActiveStudentId(null)
              navigate({ to: "/supervisor/trainees" });
            }}>
            Show All Trainees
          </Button>
        </div>
      )}

      {/* Premium Table Container */}
      <div className="rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-muted/50 border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              <tr className="text-left">
                <th className="px-6 py-4 w-10">
                  <input 
                    type="checkbox" 
                    className="rounded border-border text-pti focus:ring-pti/20 size-4 cursor-pointer"
                    checked={filteredQueue.length > 0 && selectedIds.length === filteredQueue.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-4">Log Reference</th>
                <th className="px-6 py-4">Trainee Information</th>
                <th className="px-6 py-4">Activity Title</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {logsLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground text-xs">
                    <div className="flex flex-col items-center gap-2">
                      <div className="size-6 rounded-full border-2 border-pti border-t-transparent animate-spin" />
                      Loading all supervisor logs...
                    </div>
                  </td>
                </tr>
              ) : filteredQueue.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground text-xs">
                    <div className="max-w-xs mx-auto space-y-1">
                      <p className="font-semibold text-foreground text-sm">No log entries found</p>
                      <p className="text-muted-foreground">Try clearing your filters or selecting a different status tab.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredQueue.map((l) => (
                  <tr key={l.id} className="hover:bg-muted/40 transition-colors group">
                    <td className="px-6 py-4 align-middle">
                      <input 
                        type="checkbox" 
                        className="rounded border-border text-pti focus:ring-pti/20 size-4 cursor-pointer"
                        checked={selectedIds.includes(l.id)}
                        onChange={() => toggleSelectOne(l.id)}
                      />
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <p className="font-mono font-bold text-foreground">#{l.id}</p>
                      <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{l.log_date}</p>
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <button 
                        onClick={() => setActiveStudentId(l.student_id)}
                        className="text-left group/btn focus:outline-none"
                      >
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-foreground group-hover/btn:text-pti transition-colors">
                            {l.student_name}
                          </p>
                          <ChevronRight className="size-3.5 text-muted-foreground opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-[11px] font-mono text-muted-foreground">{l.matric_number}</p>
                      </button>
                    </td>
                    <td className="px-6 py-4 align-middle max-w-[220px]">
                      <p className="font-medium text-foreground text-xs truncate" title={l.title}>{l.title}</p>
                    </td>
                    <td className="px-6 py-4 align-middle font-mono font-medium text-xs">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground">
                        {l.hours_worked} hrs
                      </span>
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <StatusPill status={l.status} />
                    </td>
                    <td className="px-6 py-4 align-middle text-right">
                      <div className="inline-flex items-center gap-1.5 bg-background border border-border/60 rounded-lg p-1 shadow-xs">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 px-2 text-xs font-medium text-pti hover:bg-pti/10 rounded-md transition flex items-center gap-1"
                          onClick={() => setInspectingLog(l)}
                          title="View full log details"
                        >
                          <Eye className="size-3.5" /> View
                        </Button>
                        <div className="h-4 w-[1px] bg-border" />
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="size-7 text-success hover:bg-success/10 hover:text-success rounded-md transition"
                          onClick={() => updateStatus({ logId: l.id, status: "approved" })}
                          title="Approve log entry"
                        >
                          <Check className="size-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="size-7 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-md transition"
                          onClick={() => updateStatus({ logId: l.id, status: "rejected" })}
                          title="Reject log entry"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILED LOG INSPECTION MODAL */}
      {inspectingLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-pti/10 text-pti grid place-items-center font-bold">
                  <FileText className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-pti">Log Report #{inspectingLog.id}</span>
                    <StatusPill status={inspectingLog.status} />
                  </div>
                  <h2 className="text-base font-bold text-foreground mt-0.5">{inspectingLog.title}</h2>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="size-8 rounded-full"
                onClick={() => setInspectingLog(null)}
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6 p-6 overflow-y-auto flex-1">
              <div className="space-y-6">
                <div className="rounded-xl border border-border/80 bg-background p-4 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Trainee & Submission Info</h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground">Trainee Name</p>
                      <p className="font-semibold text-foreground mt-0.5">{inspectingLog.student_name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Matric Number</p>
                      <p className="font-mono font-semibold text-foreground mt-0.5">{inspectingLog.matric_number}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Log Date</p>
                      <p className="font-mono font-semibold text-foreground mt-0.5 flex items-center gap-1">
                        <Calendar className="size-3 text-pti" /> {inspectingLog.log_date}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Hours Logged</p>
                      <p className="font-mono font-semibold text-foreground mt-0.5 flex items-center gap-1">
                        <Clock className="size-3 text-pti" /> {inspectingLog.hours_worked} hours
                      </p>
                    </div>
                  </div>
                </div>

                {/* ACTIVITY DESCRIPTION SECTION (Styled & Polished) */}
                <div className="rounded-xl border border-border/80 bg-background p-4 space-y-2.5 shadow-xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <FileText className="size-3.5 text-pti" /> Activity Description
                  </h3>
                  <div className="rounded-lg bg-muted/30 border border-border/60 p-3.5 text-xs text-foreground/90 leading-relaxed font-sans whitespace-pre-wrap border-l-4 border-l-pti">
                    {inspectingLog.activity_description || <span className="text-muted-foreground italic">No description provided.</span>}
                  </div>
                </div>

                {/* SKILLS ACQUIRED SECTION (Styled & Polished) */}
                <div className="rounded-xl border border-border/80 bg-background p-4 space-y-2.5 shadow-xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Wrench className="size-3.5 text-pti" /> Skills Acquired
                  </h3>
                  <div className="rounded-lg bg-muted/30 border border-border/60 p-3.5 text-xs text-foreground/90 leading-relaxed font-sans whitespace-pre-wrap border-l-4 border-l-pti">
                    {inspectingLog.skills_acquired || <span className="text-muted-foreground italic">No specific skills listed for this entry.</span>}
                  </div>
                </div>

                {/* CHALLENGES FACED SECTION (Styled & Polished) */}
                <div className="rounded-xl border border-border/80 bg-background p-4 space-y-2.5 shadow-xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <AlertTriangle className="size-3.5 text-amber-500" /> Challenges Faced & Resolutions
                  </h3>
                  <div className="rounded-lg bg-muted/30 border border-border/60 p-3.5 text-xs text-foreground/90 leading-relaxed font-sans whitespace-pre-wrap border-l-4 border-l-amber-500">
                    {inspectingLog.challenges_faced || <span className="text-muted-foreground italic">No challenges reported for this log entry.</span>}
                  </div>
                </div>

                <div className="rounded-xl border border-border/80 bg-background p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <MessageSquare className="size-3.5 text-pti" /> Supervisor Feedback & Notes
                    </h3>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {(logComments[inspectingLog.id] || []).length} comments
                    </span>
                  </div>

                  <div className="space-y-3 max-h-44 overflow-y-auto pr-1">
                    {(!logComments[inspectingLog.id] || logComments[inspectingLog.id].length === 0) ? (
                      <p className="text-xs text-muted-foreground italic py-2">No comments added yet. Provide feedback below if revisions are needed.</p>
                    ) : (
                      logComments[inspectingLog.id].map((c) => (
                        <div key={c.id} className="p-3 rounded-lg bg-muted/40 border border-border/60 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-foreground">{c.author} <span className="text-[10px] text-pti font-normal">({c.role})</span></span>
                            <span className="font-mono text-[10px] text-muted-foreground">{c.created_at}</span>
                          </div>
                          <p className="text-muted-foreground">{c.text}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Textarea 
                      placeholder="Type feedback or revision requests for student..."
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

              <div className="flex flex-col rounded-xl border border-border/80 bg-muted/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <FileText className="size-3.5 text-pti" /> Attached PDF Log Sheet Preview
                  </h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-xs gap-1"
                    onClick={() => toast.success("Downloading PDF log attachment...")}
                  >
                    <Download className="size-3" /> Download PDF
                  </Button>
                </div>

                <div className="flex-1 rounded-lg border border-border bg-card overflow-hidden flex flex-col items-center justify-center min-h-[360px] relative shadow-inner">
                  <div className="text-center p-8 space-y-3 max-w-sm">
                    <div className="size-16 rounded-2xl bg-pti/10 text-pti mx-auto grid place-items-center">
                      <FileText className="size-8" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">PTI SIWES Weekly Log Document</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Log #{inspectingLog.id} — {inspectingLog.log_date} ({inspectingLog.hours_worked} hours verified)
                      </p>
                    </div>
                    <div className="pt-2 flex flex-col gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-xs"
                        onClick={() => toast.info("Opening full screen document viewer...")}
                      >
                        <Eye className="size-3.5 mr-1.5" /> Preview Full Document
                      </Button>
                      <p className="text-[11px] text-muted-foreground italic">
                        Document verified via PTI secure gateway storage.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setInspectingLog(null)}
              >
                Close Inspector
              </Button>
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => updateStatus({ logId: inspectingLog.id, status: "rejected" })}
                >
                  <X className="size-3.5 mr-1.5" /> Reject Log
                </Button>
                <Button 
                  size="sm" 
                  className="bg-success text-success-foreground hover:bg-success/90"
                  onClick={() => updateStatus({ logId: inspectingLog.id, status: "approved" })}
                >
                  <Check className="size-3.5 mr-1.5" /> Approve & Sign Log
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}