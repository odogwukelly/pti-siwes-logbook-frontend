import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthShell } from "@/components/pti/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export type Role = "student" | "industry_supervisor" | "institution_supervisor";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — PTI e-SIWES" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch("http://localhost:8000/api/auth/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Invalid credentials or login failed.");
      }

      const data = await response.json();

      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);
      }

      // If your login response includes user details, cache them immediately 
      // so the dashboard populates instantly without requiring a refresh.
      // if (data.user_data || data.user) {
      //   const raw = data.user_data || data.user;
      //   const profile = data.profile_data || {};
        
      //   const flattenedUser = {
      //     id: raw.id,
      //     email: raw.email,
      //     full_name: raw.full_name,
      //     role: raw.role,
      //     matric_number: profile.matric_number || raw.matric_number,
      //     department: profile.department || raw.department,
      //     industrial_organization: profile.industrial_organization || raw.industrial_organization,
      //   };

      //   localStorage.setItem("user_data", JSON.stringify(flattenedUser));
      // }

      toast.success("Welcome Back!");

      // Route dynamically based on the selected role toggle
      if (role === "student") {
        navigate({ to: "/dashboard" });
      } else if (role === "industry_supervisor") {
        navigate({ to: "/supervisor" });
      } else if (role === "institution_supervisor") {
        navigate({ to: "/institution" });
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your PTI e-SIWES workspace.">
      <form onSubmit={handleLogin} className="space-y-5">
        {errorMsg && (
          <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg">
            {errorMsg}
          </div>
        )}

        {/* Role Toggle Segmented Control */}
        <div className="space-y-1.5">
          <Label>I am signing in as</Label>
          <div className="grid grid-cols-3 gap-1 p-1 bg-secondary rounded-lg">
            {(["student", "industry_supervisor", "institution_supervisor"] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={cn(
                  "py-2 text-xs font-semibold capitalize rounded-md transition-all",
                  role === r
                    ? "bg-pti text-pti-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {r === "industry_supervisor" ? "Industry" : r === "institution_supervisor" ? "Institution" : "Student"}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">
            {role === "student" ? "Email or matric number" : "Work email address"}
          </Label>
          <Input
            id="email"
            type="text"
            placeholder={role === "student" ? "efe.okoro@pti.edu.ng" : "supervisor@organization.com"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs font-semibold text-pti hover:underline">Forgot?</Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Checkbox /> Keep me signed in for 30 days
        </label>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-pti text-pti-foreground hover:bg-pti/90"
        >
          {loading ? "Signing in..." : `Sign in as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
        </Button>

        <p className="text-sm text-center text-muted-foreground pt-2">
          New to PTI e-SIWES? <Link to="/register" className="text-pti font-semibold hover:underline">Create an account</Link>
        </p>
      </form>
    </AuthShell>
  );
}