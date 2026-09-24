import { createFileRoute, useRouter } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/pti/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Search, ArrowLeft, UserPlus, Loader2, UserX } from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/institution/assign/students")({
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
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  // Retrieve current user ID from localStorage to compare assignments
  const currentUserId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;

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

  // Mutation hook for assigning student with redirect on success
  const assignMutation = useMutation({
    mutationFn: async (studentId: number | string) => {
      const token = localStorage.getItem("access_token") || localStorage.getItem("token");
      if (!token) throw new Error("No access token found");

      const res = await fetch(`http://localhost:8000/api/user/assign-student/${studentId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to assign student");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(data?.msg || "Student assigned successfully!");
      queryClient.invalidateQueries({ queryKey: ["institution_assigned_students_endpoint"] });
      queryClient.invalidateQueries({ queryKey: ["institution_students_dashboard"] });
      
      // Redirect to the assigned students view
      router.navigate({ to: "/institution/students" });
    },
    onError: (err: any) => {
      toast.error(`Assignment failed: ${err.message || "Unknown error occurred"}`);
    },
  });

  // Filter students based on search query
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const query = searchQuery.toLowerCase();

    return students.filter((s) => {
      const name = s.full_name?.toLowerCase() || "";
      const matric = s.matric_number?.toLowerCase() || "";
      const dept = s.department?.toLowerCase() || "";
      const org = s.industrial_organization?.toLowerCase() || "";

      return (
        name.includes(query) ||
        matric.includes(query) ||
        dept.includes(query) ||
        org.includes(query)
      );
    });
  }, [students, searchQuery]);

  return (
    <DashboardLayout 
      role="institution" 
      title="Assign New students" 
      subtitle={`${filteredStudents.length} student${filteredStudents.length === 1 ? "" : "s"} available for assignment under your supervision`}
      actions={
        <Button variant="outline" onClick={() => router.history.back()} className="gap-1.5">
          <ArrowLeft className="size-4" /> Back
        </Button>
      }
    >
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm space-y-4">
        {/* Search Bar Filter Control */}
        <div className="p-4 border-b border-border flex gap-3 bg-secondary/20">
          <div className="flex-1 relative max-w-md">
            <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, matric, department, or organization..." 
              className="w-full h-10 pl-9 pr-3 text-sm rounded-xl bg-card border border-border focus:border-pti outline-none transition shadow-sm"
            />
          </div>
        </div>

        {/* Loading / Error States */}
        {isLoading && (
          <div className="py-16 text-center text-sm font-mono text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="size-5 animate-spin text-pti" /> Loading assigned students...
          </div>
        )}

        {error instanceof Error && (
          <div className="p-6 m-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-sm font-mono">
            Failed to load assigned students: {error.message}
          </div>
        )}

        {/* Data Table */}
        {!isLoading && !error && (
          <div className="overflow-x-auto">
            {filteredStudents.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
                  <tr className="text-left">
                    <th className="px-6 py-3 font-bold">Student</th>
                    <th className="px-6 py-3 font-bold">Department</th>
                    <th className="px-6 py-3 font-bold">Placement</th>
                    <th className="px-6 py-3 font-bold">Week</th>
                    <th className="px-6 py-3 font-bold">Compliance</th>
                    <th className="px-6 py-3 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredStudents.map((s, idx) => {
                    const complianceVal = s.compliance ?? (idx % 2 === 0 ? 92 : 74);
                    const weekVal = s.week ?? 12;
                    const orgVal = s.industrial_organization || "NNPC E&P, Port Harcourt";
                    
                    const isAssignedToMe = currentUserId ? String(s.institution_supervisor_id) === String(currentUserId) : false;
                    const isPendingMutation = assignMutation.isPending && assignMutation.variables === s.id;

                    return (
                      <tr key={s.id} className="hover:bg-muted/30 transition">
                        <td className="px-6 py-3">
                          <p className="font-semibold">{s.full_name}</p>
                          <p className="text-[11px] font-mono text-muted-foreground">{s.matric_number || "N/A"}</p>
                        </td>
                        <td className="px-6 py-3 text-muted-foreground">{s.department || "Petroleum Engineering"}</td>
                        <td className="px-6 py-3 text-muted-foreground">{orgVal}</td>
                        <td className="px-6 py-3 font-mono">{weekVal}/24</td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-20 bg-secondary rounded-full overflow-hidden">
                              <div 
                                className={
                                  "h-full rounded-full " + 
                                  (complianceVal > 85 ? "bg-success" : complianceVal > 70 ? "bg-warning" : "bg-destructive")
                                } 
                                style={{ width: `${Math.min(Math.max(complianceVal, 0), 100)}%` }} 
                              />
                            </div>
                            <span className="font-mono text-xs">{complianceVal}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <Button 
                            variant={isAssignedToMe ? "secondary" : "outline"} 
                            size="sm" 
                            disabled={isPendingMutation}
                            onClick={() => assignMutation.mutate(s.id)}
                            className="h-8 gap-1.5 text-xs font-medium"
                          >
                            {isPendingMutation ? (
                              <Loader2 className="size-3.5 animate-spin text-pti" />
                            ) : (
                              <UserPlus className="size-3.5 text-pti" />
                            )}
                            {isAssignedToMe ? "Re-assign" : "Assign Student"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center space-y-3">
                <div className="size-12 rounded-full bg-muted text-muted-foreground grid place-items-center mx-auto">
                  <UserX className="size-6" />
                </div>
                <h3 className="font-semibold text-base">No matching students found</h3>
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
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}