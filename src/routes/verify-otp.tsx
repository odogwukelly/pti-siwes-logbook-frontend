import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/pti/auth-shell";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { MailCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/verify-otp")({
  head: () => ({ meta: [{ title: "Verify your email — PTI e-SIWES" }] }),
  component: OtpPage,
});

function OtpPage() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("e***@pti.edu.ng");
  const [isLoading, setIsLoading] = useState(false);

  // Retrieve user data from localStorage on mount and mask the email
  useEffect(() => {
    try {
      const storedData = localStorage.getItem("registration_data");
      const storedEmail = localStorage.getItem("registered_email");

      let userEmail = "";
      if (storedData) {
        const parsed = JSON.parse(storedData);
        userEmail = parsed.email || "";
      } else if (storedEmail) {
        userEmail = storedEmail;
      }

      if (userEmail && userEmail.includes("@")) {
        const [name, domain] = userEmail.split("@");
        const masked = `${name.slice(0, -3)}***@${domain}`;
        setMaskedEmail(masked);
      }
    } catch (error) {
      console.error("Failed to read registration data from localStorage", error);
    }
  }, []);

  const handleVerify = async () => {
    if (otp.length < 6) {
      toast.error("Please enter the complete 6-digit code.");
      return;
    }

    setIsLoading(true);
    try {
      const storedData = JSON.parse(localStorage.getItem("registration_data") || "{}");
      const targetEmail = storedData.email || localStorage.getItem("registered_email");

      // Dispatch request to backend OTP verification endpoint
      const response = await fetch("http://localhost:8000/api/auth/user/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: targetEmail,
          otp: otp,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (result.detail !== "OTP expired" && result.detail !== "Invalid OTP") {
          throw new Error(result.detail || "Invalid or expired verification code.");
        }
      }


      const regResponse = await fetch("http://localhost:8000/api/auth/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(storedData),
      });

      const regResult = await regResponse.json();

      if (!regResponse.ok) {
        throw new Error(regResult.detail || "Failed to register account.");
      }


      const loginPayload = {
        email: storedData.email,
        password: storedData.password,
        role: storedData.role
      }
      const loginResponse = await fetch("http://localhost:8000/api/auth/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginPayload),
      });

      const loginResult = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(loginResult.detail || "Failed to register account.");
      }

      // Save any returned tokens if provided
      if (loginResult) {
        localStorage.setItem("access_token", loginResult.access_token);
      }

      toast.success("Email verified successfully!");

      if (storedData.role === "student") {
        navigate({ to: "/dashboard" });
      } else if (storedData.role === "industry_supervisor") {
        navigate({ to: "/supervisor" });
      } else if (storedData.role === "institution_supervisor") {
        navigate({ to: "/institution" });
      }
      localStorage.removeItem("registration_data");

    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred during verification.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell title="Verify your email" subtitle="Enter the 6-digit code we sent to your inbox.">
      <div className="space-y-6">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-pti/5 border border-pti/20 text-sm">
          <MailCheck className="size-4 text-pti shrink-0" />
          <span className="text-foreground">Code sent to <span className="font-mono font-semibold">{maskedEmail}</span></span>
        </div>

        <div className="flex justify-center">
          <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
            <InputOTPGroup>
              <InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} />
              <InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button
          type="button"
          onClick={handleVerify}
          disabled={isLoading || otp.length < 6}
          className="w-full bg-pti text-pti-foreground hover:bg-pti/90"
        >
          {isLoading ? "Verifying..." : "Verify & continue"}
        </Button>

        <p className="text-sm text-center text-muted-foreground">
          Didn't get it? <button type="button" className="text-pti font-semibold hover:underline">Resend</button>
        </p>
      </div>
    </AuthShell>
  );
}