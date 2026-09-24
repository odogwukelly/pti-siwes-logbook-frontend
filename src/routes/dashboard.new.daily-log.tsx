import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/pti/dashboard-layout";
import { StatusPill } from "@/components/pti/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UploadCloud, Send, FileText, X, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLogs } from "@/hooks/useLog";
import { useAuthUser } from "@/hooks/useAuthUser";
import { getUserById } from "@/hooks/useUser";

export const Route = createFileRoute("/dashboard/new/daily-log")({
  head: () => ({ meta: [{ title: "Daily Log — PTI e-SIWES" }] }),
  component: DailyLogPage,
});

function DailyLogPage() {
  const queryClient = useQueryClient();
  const { data: authUser } = useAuthUser();
  const { data: supervisor } = getUserById(authUser.industry_supervisor_id);

  const { data: logs = [] } = useLogs(authUser?.student_id);

  // Form states matching your FastAPI endpoint parameters
  const [logDate, setLogDate] = useState("");
  const [hoursWorked, setHoursWorked] = useState("");
  const [title, setTitle] = useState("");
  const [activityDescription, setActivityDescription] = useState("");
  const [skillsAcquired, setSkillsAcquired] = useState("");
  const [challengesFaced, setChallengesFaced] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Mutation for posting the log entry
  const { mutate: createLog, isPending } = useMutation({
    mutationFn: async (formData: FormData) => {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No access token found. Please log in again.");

      const response = await fetch("http://localhost:8000/api/log/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to create log entry.");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Daily log submitted successfully for review!");
      setErrorMessage(null);
      setLogDate("");
      setHoursWorked("");
      setTitle("");
      setActivityDescription("");
      setSkillsAcquired("");
      setChallengesFaced("");
      setSelectedFile(null);

      queryClient.invalidateQueries({ queryKey: ["daily_logs"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
      setSuccessMessage(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!selectedFile) {
      toast.error("Please attach an evidence file (PDF).");
      return;
    }

    const formData = new FormData();
    formData.append("log_date", logDate);
    formData.append("title", title);
    formData.append("hours_worked", hoursWorked);
    formData.append("activity_description", activityDescription);
    if (skillsAcquired) formData.append("skills_acquired", skillsAcquired);
    if (challengesFaced) formData.append("challenges_faced", challengesFaced);
    formData.append("file", selectedFile);

    createLog(formData);
  };

  // Helper to construct "This week so far" dynamically from backend logs
  // Maps weekdays to matching logs by date or falls back to empty state
  const weekDays = [
    { label: "Mon", dayIndex: 1 },
    { label: "Tue", dayIndex: 2 },
    { label: "Wed", dayIndex: 3 },
    { label: "Thu", dayIndex: 4 },
    { label: "Fri", dayIndex: 5 },
  ];

  return (
    <DashboardLayout
      role="student"
      title="Daily log entry"
      subtitle="Document today's activities — saved drafts auto-sync every 30 seconds."
      actions={
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2 text-muted-foreground hover:text-foreground">
            <Link to="/dashboard/daily-log">
              <ArrowLeft className="size-4" /> Back to My Logs
            </Link>
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 lg:p-8 space-y-6">

          {errorMessage && (
            <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-sm">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 text-sm font-medium">
              {successMessage}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Date *</Label>
              <Input
                type="date"
                className="font-mono"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Hours worked *</Label>
              <Input
                type="number"
                className="font-mono"
                value={hoursWorked}
                onChange={(e) => setHoursWorked(e.target.value)}
                placeholder="e.g. 8"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Task Title *</Label>
            <Input
              type="text"
              className="font-mono"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Stator coil reconfiguration"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Activity description *</Label>
            <Textarea
              rows={6}
              value={activityDescription}
              onChange={(e) => setActivityDescription(e.target.value)}
              placeholder="Describe technical tasks performed, methodology, equipment used and outcomes…"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Skills acquired *</Label>
              <Input
                value={skillsAcquired}
                onChange={(e) => setSkillsAcquired(e.target.value)}
                placeholder="e.g. Hydrostatic testing, Reporting"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Challenges encountered *</Label>
              <Input
                value={challengesFaced}
                onChange={(e) => setChallengesFaced(e.target.value)}
                placeholder="What slowed you down?"
                required
              />
            </div>
          </div>

          <div>
            <Label>Evidence (PDF) *</Label>
            <div className="mt-1.5 border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-pti hover:bg-pti/5 transition relative cursor-pointer">
              <input
                type="file"
                accept=".pdf"
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
              />
              {selectedFile ? (
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-foreground">
                  <FileText className="size-5 text-pti" />
                  <span>{selectedFile.name}</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                    className="p-1 hover:bg-muted rounded-full ml-2 text-muted-foreground hover:text-destructive"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <>
                  <UploadCloud className="size-8 mx-auto text-muted-foreground" />
                  <p className="mt-3 text-sm font-medium">Drop files here or click to browse</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF · max 10 MB</p>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
            {supervisor ?
              <>
                <p className="text-xs text-muted-foreground">
                  Submitting will route to your assigned supervisor <strong className="capitalize">{supervisor?.full_name}</strong> for approval.
                </p>
              </>
              :
              <>
                <p className="text-xs text-destructive">
                  Can not submit log without an assigned supervisor for approval.
                </p>
              </>}


            <div className="flex gap-2">
              <Button
                type="submit"
                className="bg-pti text-pti-foreground hover:bg-pti/90"
                disabled={isPending || !supervisor}

              >
                <Send className="size-4 mr-1.5" />
                {isPending ? "Submitting..." : "Submit for review"}
              </Button>
            </div>
          </div>
        </div>

        {/* Dynamic Sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-bold mb-4">This week so far</h3>
            <div className="space-y-3">
              {weekDays.map(({ label }) => {
                // Find log matching this weekday if available, otherwise mock representation
                const matchedLog = logs.find(l => {
                  const logDayName = new Date(l.log_date).toLocaleDateString('en-US', { weekday: 'short' });
                  return logDayName === label;
                });

                const hours = matchedLog ? (matchedLog.hours_worked || 8) : 0;
                const status = matchedLog ? matchedLog.status : "draft";

                return (
                  <div key={label} className="flex items-center gap-3">
                    <span className="font-mono text-xs w-8 text-muted-foreground">{label}</span>
                    <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full bg-pti rounded-full" style={{ width: `${(hours / 8) * 100}%` }} />
                    </div>
                    <span className="font-mono text-xs w-8 text-right">{hours}h</span>
                    <StatusPill status={status as "approved" | "pending" | "draft" | "rejected"} />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-bold mb-4">Recent submissions</h3>
            <div className="space-y-3">
              {logs.length === 0 ? (
                <p className="text-xs text-muted-foreground">No recent submissions found.</p>
              ) : (
                logs.slice(0, 4).map((l) => (
                  <div key={l.id} className="flex items-start justify-between gap-3 pb-3 last:pb-0 last:border-0 border-b border-border">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{l.title}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">{l.log_date} · #{l.id}</p>
                    </div>
                    <StatusPill status={l.status} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}