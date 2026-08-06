import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/pti/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — PTI e-SIWES" }] }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your PTI e-SIWES workspace.">
      <form className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email or matric number</Label>
          <Input id="email" type="text" placeholder="efe.okoro@pti.edu.ng" />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs font-semibold text-pti hover:underline">Forgot?</Link>
          </div>
          <Input id="password" type="password" placeholder="••••••••" />
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground"><Checkbox /> Keep me signed in for 30 days</label>
        <Button asChild className="w-full bg-pti text-pti-foreground hover:bg-pti/90"><Link to="/dashboard">Sign in</Link></Button>
        <div className="grid grid-cols-3 gap-2 pt-2">
          <Button asChild variant="outline" size="sm"><Link to="/dashboard">Student</Link></Button>
          <Button asChild variant="outline" size="sm"><Link to="/supervisor">Industry</Link></Button>
          <Button asChild variant="outline" size="sm"><Link to="/institution">Institution</Link></Button>
        </div>
        <p className="text-sm text-center text-muted-foreground pt-2">
          New to PTI e-SIWES? <Link to="/register" className="text-pti font-semibold hover:underline">Create an account</Link>
        </p>
      </form>
    </AuthShell>
  );
}
