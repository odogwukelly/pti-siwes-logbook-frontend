import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/pti/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Mail, Plus, Search, UserMinus, UserX } from "lucide-react";
import { useState, useMemo } from "react";
import { UserProfileItem, useUsersByRole } from "@/hooks/useUser";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/supervisor/trainees")({
  head: () => ({ meta: [{ title: "My Trainees — PTI e-SIWES" }] }),
  component: TraineesPage,
});

interface AssignedStudentSummary {
  id: number;
  name: string;
  matric: string;
  dept: string;
  week: number;
  compliance: number;
  pending: number;
}

function TraineesPage() {
  const queryClient = useQueryClient();
  
  // Fetch active trainees live using your role-based endpoint
  const { data: trainees = [], isLoading, error } = useUsersByRole("student");

  // Fetch supervisor students summary statistics (provides dynamic week, compliance, and pending metrics)
  const { data: studentSummaries = [] } = useQuery<AssignedStudentSummary[]>({
    queryKey: ["supervisor_students"],
    queryFn: async () => {
      if (typeof window === "undefined") return [];
      const token = localStorage.getItem("access_token");
      if (!token) return [];

      const res = await fetch(`http://localhost:8000/api/log/supervisor/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: typeof window !== "undefined",
  });
  
  // Retrieve current logged-in supervisor ID from localStorage
  const supervisorId = useMemo(() => {
    try {
      const supervisorData = localStorage.getItem("user_data");
      return supervisorData ? JSON.parse(supervisorData).id : null;
    } catch {
      return null;
    }
  }, []);

  // Search state filter term
  const [searchQuery, setSearchQuery] = useState("");

  // Mutation to unassign student
  const { mutate: unassignStudent, variables: pendingStudentId } = useMutation({
    mutationFn: async (studentId: number | string) => {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No access token found");

      const response = await fetch(`http://localhost:8000/api/user/unassign-student/${studentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to unassign student");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate the query cache to instantly sync the UI list
      queryClient.invalidateQueries({ queryKey: ["users_by_role", "student"] });
      queryClient.invalidateQueries({ queryKey: ["supervisor_students"] });
    },
  });

  // Filter trainees belonging to this supervisor, then apply search query filtering
  const filteredTrainees = useMemo(() => {
    const assignedTrainees = trainees.filter((s) => {
      return supervisorId ? s.industry_supervisor_id === supervisorId : true;
    });

    if (!searchQuery.trim()) return assignedTrainees;

    const query = searchQuery.toLowerCase();
    return assignedTrainees.filter((s) => {
      const name = s.full_name?.toLowerCase() || "";
      const matric = s.matric_number?.toLowerCase() || "";
      const email = s.email?.toLowerCase() || "";
      const dept = s.department?.toLowerCase() || "";

      return (
        name.includes(query) ||
        matric.includes(query) ||
        email.includes(query) ||
        dept.includes(query)
      );
    });
  }, [trainees, supervisorId, searchQuery]);

  return (
    <DashboardLayout
      role="industry"
      title="My trainees"
      subtitle={`${filteredTrainees.length} active SIWES placement${filteredTrainees.length === 1 ? "" : "s"} under your supervision`}
      actions={
        <Link to="/supervisor/new/trainees">
          <Button className="bg-pti text-pti-foreground hover:bg-pti/90 gap-1.5">
            <Plus className="size-4" /> New Trainee
          </Button>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Search Bar Filter Control */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, matric number, email, or department..."
            className="w-full h-10 pl-9 pr-4 text-sm rounded-xl bg-card border border-border focus:border-pti outline-none transition shadow-sm"
          />
        </div>

        {/* Loading / Error States */}
        {isLoading && (
          <div className="py-12 text-center text-sm font-mono text-muted-foreground animate-pulse">
            Loading active trainees...
          </div>
        )}

        {error instanceof Error && (
          <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-sm">
            Failed to load trainees: {error.message}
          </div>
        )}

        {/* Trainees Grid Layout */}
        {!isLoading && !error && (
          <>
            {filteredTrainees.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTrainees.map((s: UserProfileItem) => {
                  const displayName = s.full_name || "Unknown Student";
                  const initials = displayName
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase();

                  const isUnassigning = pendingStudentId === s.id;

                  // Find matching metrics from studentSummaries
                  const summary = studentSummaries.find((item) => item.id === s.id);
                  const traineeWeek = summary ? summary.week : "--";
                  const traineeCompliance = summary ? `${summary.compliance}%` : "--";
                  const traineePending = summary ? summary.pending : "--";

                  return (
                    <div key={s.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex items-start gap-3 mb-4">
                          <div className="size-12 rounded-full bg-pti text-pti-foreground grid place-items-center font-bold text-sm shrink-0">
                            {initials || "ST"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{displayName}</p>
                            <p className="text-[11px] font-mono text-muted-foreground truncate">{s.matric_number || "No Matric No."}</p>
                            <p className="text-xs text-muted-foreground truncate">{s.department || "No Department"}</p>
                          </div>
                        </div>

                        {/* Dynamic Metrics Block */}
                        <div className="grid grid-cols-3 gap-2 text-center mb-4">
                          <div className="rounded-lg bg-secondary p-2">
                            <p className="text-lg font-bold font-mono">{traineeWeek}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">Week</p>
                          </div>
                          <div className="rounded-lg bg-secondary p-2">
                            <p className="text-lg font-bold font-mono">{traineeCompliance}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">Compl.</p>
                          </div>
                          <div className="rounded-lg bg-secondary p-2">
                            <p className="text-lg font-bold font-mono">{traineePending}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">Pending</p>
                          </div>
                        </div>

                        <div className="mb-4 text-[11px] text-muted-foreground bg-secondary/60 rounded-lg p-2 truncate">
                          📧 {s.email || "No email address"}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                          onClick={() => unassignStudent(s.id)}
                          disabled={isUnassigning}
                        >
                          <UserMinus className="size-3.5" /> 
                          {isUnassigning ? "Unassigning..." : "Unassign"}
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1.5" asChild>
                          <a href={`mailto:${s.email}`}>
                            <Mail className="size-3.5" /> Email
                          </a>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card p-12 text-center space-y-3">
                <div className="size-12 rounded-full bg-muted text-muted-foreground grid place-items-center mx-auto">
                  <UserX className="size-6" />
                </div>
                <h3 className="font-semibold text-base">No matching trainees found</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  No assigned student records match your query "{searchQuery}".
                </p>
                {searchQuery && (
                  <Button variant="outline" size="sm" onClick={() => setSearchQuery("")} className="mt-2">
                    Clear Search
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}