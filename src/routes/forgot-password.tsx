import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/pti/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot password — PTI e-SIWES" }] }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  return (
    <AuthShell title="Reset your password" subtitle="We'll send a one-time code to your registered email.">
      <form className="space-y-5">
        <div className="space-y-1.5"><Label>Email or matric number</Label><Input placeholder="efe.okoro@pti.edu.ng" /></div>
        <Button asChild className="w-full bg-pti text-pti-foreground hover:bg-pti/90"><Link to="/verify-otp">Send reset code</Link></Button>
        <p className="text-sm text-center text-muted-foreground">Remembered it? <Link to="/login" className="text-pti font-semibold hover:underline">Back to sign in</Link></p>
      </form>
    </AuthShell>
  );
}
