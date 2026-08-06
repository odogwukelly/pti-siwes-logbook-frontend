import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/pti/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export const Route = createFileRoute("/register/supervisor")({
  head: () => ({ meta: [{ title: "Supervisor registration — PTI e-SIWES" }] }),
  component: SupervisorRegister,
});

function SupervisorRegister() {
  return (
    <AuthShell title="Supervisor registration" subtitle="Request access to review and sign trainee logbooks.">
      <form className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Title</Label>
            <Select><SelectTrigger><SelectValue placeholder="Engr." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="engr">Engr.</SelectItem>
                <SelectItem value="dr">Dr.</SelectItem>
                <SelectItem value="mr">Mr.</SelectItem>
                <SelectItem value="mrs">Mrs.</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Full name</Label><Input placeholder="Samuel Adebayo" /></div>
        </div>
        <div className="space-y-1.5"><Label>Work email</Label><Input type="email" placeholder="sadebayo@nnpc.com" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Organization</Label><Input placeholder="NNPC E&P" /></div>
          <div className="space-y-1.5"><Label>Role</Label>
            <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="industry">Industry Supervisor</SelectItem>
                <SelectItem value="institution">Institution Supervisor</SelectItem>
                <SelectItem value="itf">ITF Officer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5"><Label>Phone</Label><Input placeholder="+234 803 000 0000" /></div>
        <div className="space-y-1.5"><Label>Password</Label><Input type="password" placeholder="At least 8 characters" /></div>
        <Button asChild className="w-full bg-pti text-pti-foreground hover:bg-pti/90"><Link to="/verify-otp">Request access</Link></Button>
        <p className="text-sm text-center text-muted-foreground">Already registered? <Link to="/login" className="text-pti font-semibold hover:underline">Sign in</Link></p>
      </form>
    </AuthShell>
  );
}
