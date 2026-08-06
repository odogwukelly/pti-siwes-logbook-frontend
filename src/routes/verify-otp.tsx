import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/pti/auth-shell";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { MailCheck } from "lucide-react";

export const Route = createFileRoute("/verify-otp")({
  head: () => ({ meta: [{ title: "Verify your email — PTI e-SIWES" }] }),
  component: OtpPage,
});

function OtpPage() {
  return (
    <AuthShell title="Verify your email" subtitle="Enter the 6-digit code we sent to your inbox.">
      <div className="space-y-6">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-pti/5 border border-pti/20 text-sm">
          <MailCheck className="size-4 text-pti" />
          <span className="text-foreground">Code sent to <span className="font-mono font-semibold">e***@pti.edu.ng</span></span>
        </div>
        <div className="flex justify-center">
          <InputOTP maxLength={6}>
            <InputOTPGroup>
              <InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} />
              <InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button asChild className="w-full bg-pti text-pti-foreground hover:bg-pti/90"><Link to="/dashboard">Verify & continue</Link></Button>
        <p className="text-sm text-center text-muted-foreground">Didn't get it? <button className="text-pti font-semibold hover:underline">Resend in 30s</button></p>
      </div>
    </AuthShell>
  );
}
