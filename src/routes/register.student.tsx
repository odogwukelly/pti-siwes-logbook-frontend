import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/pti/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export const Route = createFileRoute("/register/student")({
  head: () => ({ meta: [{ title: "Student registration — PTI e-SIWES" }] }),
  component: StudentRegister,
});

function StudentRegister() {
  return (
    <AuthShell title="Student registration" subtitle="Set up your SIWES logbook in under two minutes.">
      <form className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>First name</Label><Input placeholder="Efe" /></div>
          <div className="space-y-1.5"><Label>Surname</Label><Input placeholder="Okoro" /></div>
        </div>
        <div className="space-y-1.5"><Label>Matric number</Label><Input placeholder="PTI/PE/2021/0742" className="font-mono" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Department</Label>
            <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pe">Petroleum Engineering</SelectItem>
                <SelectItem value="me">Mechanical Engineering</SelectItem>
                <SelectItem value="ch">Chemical Engineering</SelectItem>
                <SelectItem value="el">Electrical Engineering</SelectItem>
                <SelectItem value="wf">Welding & Fabrication</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Level</Label>
            <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="nd1">ND I</SelectItem>
                <SelectItem value="nd2">ND II</SelectItem>
                <SelectItem value="hnd1">HND I</SelectItem>
                <SelectItem value="hnd2">HND II</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5"><Label>School email</Label><Input placeholder="efe.okoro@pti.edu.ng" type="email" /></div>
        <div className="space-y-1.5"><Label>Password</Label><Input type="password" placeholder="At least 8 characters" /></div>
        <Button asChild className="w-full bg-pti text-pti-foreground hover:bg-pti/90"><Link to="/verify-otp">Create account</Link></Button>
        <p className="text-sm text-center text-muted-foreground">Have an account? <Link to="/login" className="text-pti font-semibold hover:underline">Sign in</Link></p>
      </form>
    </AuthShell>
  );
}
