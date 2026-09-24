import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/pti/dashboard-layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, MessageSquare, Plus, Search, UserX } from "lucide-react";
import { useState, useMemo } from "react";
import { UserProfileItem, useUsersByRole } from "@/hooks/useUser";
import { toast } from "sonner";

export const Route = createFileRoute("/supervisor/new/trainees")({
  head: () => ({ meta: [{ title: "My Trainees — PTI e-SIWES" }] }),
  component: TraineesPage,
});

function TraineesPage() {
  const navigate = useNavigate();

  // Fetch students live using your role-based endpoint
  const { data: trainees = [], isLoading, error } = useUsersByRole("student");

  // Search state filter term
  const [searchQuery, setSearchQuery] = useState("");

  // Filter students based on name, matric number, email, or department
  const filteredTrainees = useMemo(() => {
    if (!searchQuery.trim()) return trainees;
    const query = searchQuery.toLowerCase();

    return trainees.filter((s) => {
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
  }, [trainees, searchQuery]);

  // Function to handle assigning the student (accepting string or number for ID safety)
  const handleAssign = async (studentId: string | number, studentName: string) => {
    try {
      const token = localStorage.getItem("access_token") || localStorage.getItem("token");
      
      const response = await fetch(`http://localhost:8000/api/user/assign-student/${studentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to assign student.");
      }

      const result = await response.json();
      toast.success(result.msg || `Successfully assigned ${studentName}!`);
      
      // Redirect back to main trainees list upon successful assignment
      navigate({ to: "/supervisor/trainees" });
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    }
  };

  return (
    <DashboardLayout 
      role="industry" 
      title="Add New Trainee" 
      subtitle="Register a student under your industrial supervision"
      actions={
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2 text-muted-foreground hover:text-foreground">
            <Link to="/supervisor/trainees">
              <ArrowLeft className="size-4" /> Back to My Trainees
            </Link>
          </Button>
        </div>
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
            Loading student records...
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

                        {/* Email badge row */}
                        <div className="mb-4 text-[11px] text-muted-foreground bg-secondary/60 rounded-lg p-2 truncate">
                          📧 {s.email || "No email address"}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => handleAssign(s.id, displayName)}
                        >
                          <Plus className="size-3.5" /> Add
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
                  No student records match your current search query "{searchQuery}". Try clearing your search terms.
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