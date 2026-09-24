import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/pti/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Search, Plus, UserMinus, Loader2, UserX, Mail } from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/institution/students")({
  head: () => ({ meta: [{ title: "Assigned Students — PTI e-SIWES" }] }),
  component: InstitutionStudentsPage,
});

interface StudentProfile {
  id: number | string;
  user_id: number | string;
  full_name: string;
  email: string;
  role: string;
  matric_number: string;
  department: string;
  industry_supervisor_id?: number | string | null;
  institution_supervisor_id?: number | string | null;
  industrial_organization?: string | null;
  week?: number;
  compliance?: number;
  status?: string;
}

function InstitutionStudentsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  // Retrieve current institution supervisor ID
  const currentUserId = useMemo(() => {
    if (typeof window === "undefined") return null;
    const userId = localStorage.getItem("user_id");
    if (userId) return userId;
    try {
      const userData = localStorage.getItem("user_data");
      return userData ? JSON.parse(userData).id : null;
    } catch {
      return null;
    }
  }, []);

  // Fetch live student records using the /all-user/student endpoint
  const { data: students = [], isLoading, error } = useQuery<StudentProfile[]>({
    queryKey: ["institution_assigned_students_endpoint"],
    queryFn: async () => {
      if (typeof window === "undefined") return [];
      const token = localStorage.getItem("access_token") || localStorage.getItem("token");
      if (!token) throw new Error("No access token found");

      const res = await fetch("http://localhost:8000/api/user/all-user/student", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to fetch assigned students");
      }
      return res.json();
    },
    enabled: typeof window !== "undefined",
  });

  // Mutation hook for unassigning student
  const { mutate: unassignStudent, variables: pendingStudentId } = useMutation({
    mutationFn: async (studentId: number | string) => {
      const token = localStorage.getItem("access_token") || localStorage.getItem("token");
      if (!token) throw new Error("No access token found");

      const res = await fetch(`http://localhost:8000/api/user/unassign-student/${studentId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to unassign student");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(data?.msg || "Student unassigned successfully!");
      queryClient.invalidateQueries({ queryKey: ["institution_assigned_students_endpoint"] });
      queryClient.invalidateQueries({ queryKey: ["institution_students_dashboard"] });
    },
    onError: (err: any) => {
      toast.error(`Unassignment failed: ${err.message || "Unknown error occurred"}`);
    },
  });

  // Filter students assigned to this institution supervisor, then apply search query
  const filteredStudents = useMemo(() => {
    const assignedStudents = students.filter((s) => {
      return currentUserId ? String(s.institution_supervisor_id) === String(currentUserId) : true;
    });

    if (!searchQuery.trim()) return assignedStudents;
    const query = searchQuery.toLowerCase();

    return assignedStudents.filter((s) => {
      const name = s.full_name?.toLowerCase() || "";
      const matric = s.matric_number?.toLowerCase() || "";
      const email = s.email?.toLowerCase() || "";
      const dept = s.department?.toLowerCase() || "";
      const org = s.industrial_organization?.toLowerCase() || "";

      return (
        name.includes(query) ||
        matric.includes(query) ||
        email.includes(query) ||
        dept.includes(query) ||
        org.includes(query)
      );
    });
  }, [students, currentUserId, searchQuery]);

  return (
    <DashboardLayout 
      role="institution" 
      title="Assigned students" 
      subtitle={`${filteredStudents.length} student${filteredStudents.length === 1 ? "" : "s"} under your supervision`}
      actions={
        <Link to="/institution/assign/students">
          <Button className="bg-pti text-pti-foreground hover:bg-pti/90 gap-1.5">
            <Plus className="size-4" /> Assign New Student
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
            placeholder="Search by name, matric number, department, or organization..." 
            className="w-full h-10 pl-9 pr-4 text-sm rounded-xl bg-card border border-border focus:border-pti outline-none transition shadow-sm"
          />
        </div>

        {/* Loading / Error States */}
        {isLoading && (
          <div className="py-12 text-center text-sm font-mono text-muted-foreground animate-pulse">
            Loading assigned students...
          </div>
        )}

        {error instanceof Error && (
          <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-sm">
            Failed to load assigned students: {error.message}
          </div>
        )}

        {/* Students Grid Layout */}
        {!isLoading && !error && (
          <>
            {filteredStudents.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStudents.map((s, idx) => {
                  const displayName = s.full_name || "Unknown Student";
                  const initials = displayName
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase();

                  const complianceVal = s.compliance ?? (idx % 2 === 0 ? 92 : 74);
                  const weekVal = s.week ?? 12;
                  const orgVal = s.industrial_organization || "NNPC E&P, Port Harcourt";
                  const isUnassigning = pendingStudentId === s.id;

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
                            <p className="text-xs text-muted-foreground truncate">{s.department || "Petroleum Engineering"}</p>
                          </div>
                        </div>

                        {/* Metrics Block */}
                        <div className="grid grid-cols-2 gap-2 text-center mb-3">
                          <div className="rounded-lg bg-secondary p-2">
                            <p className="text-lg font-bold font-mono">{weekVal}/24</p>
                            <p className="text-[10px] text-muted-foreground uppercase">Week</p>
                          </div>
                          <div className="rounded-lg bg-secondary p-2">
                            <p className="text-lg font-bold font-mono">{complianceVal}%</p>
                            <p className="text-[10px] text-muted-foreground uppercase">Compliance</p>
                          </div>
                        </div>

                        <div className="mb-3 text-[11px] text-muted-foreground bg-secondary/60 rounded-lg p-2 truncate">
                          🏢 {orgVal}
                        </div>

                        <div className="mb-4 text-[11px] text-muted-foreground bg-secondary/60 rounded-lg p-2 truncate">
                          📧 {s.email || "No email address"}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                          onClick={() => unassignStudent(s.id)}
                          disabled={isUnassigning}
                        >
                          {isUnassigning ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <UserMinus className="size-3.5" />
                          )}
                          {isUnassigning ? "Unassigning..." : "Unassign"}
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs" asChild>
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
                <h3 className="font-semibold text-base">No assigned students found</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  No assigned students match your query "{searchQuery}".
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