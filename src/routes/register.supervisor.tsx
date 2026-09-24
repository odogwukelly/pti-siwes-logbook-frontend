import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AuthShell } from "@/components/pti/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";

// Zod validation schema for supervisors/staff
const supervisorRegisterSchema = z.object({
  title: z.string().min(1, "Title is required"),
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  organization: z.string().min(1, "Organization is required"),
  role: z.enum(["industry_supervisor", "institution_supervisor", "itf"], {
    errorMap: () => ({ message: "Please select a valid role" }),
  }),
  phone: z.string().min(10, "Valid phone number is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SupervisorRegisterFormValues = z.infer<typeof supervisorRegisterSchema>;

export const Route = createFileRoute("/register/supervisor")({
  head: () => ({ meta: [{ title: "Supervisor registration — PTI e-SIWES" }] }),
  component: SupervisorRegister,
});

function SupervisorRegister() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SupervisorRegisterFormValues>({
    resolver: zodResolver(supervisorRegisterSchema),
    defaultValues: {
      title: "",
      fullName: "",
      email: "",
      organization: "",
      role: undefined,
      phone: "",
      password: "",
    },
  });

  const titleValue = watch("title");
  const roleValue = watch("role");

  const onSubmit = async (data: SupervisorRegisterFormValues) => {
    setIsLoading(true);
    try {
      // Map frontend role to backend expectation (e.g., "industry" or "institution")
      const formattedFullName = `${data.title} ${data.fullName.trim()}`;

      const payload = {
        email: data.email,
        password: data.password,
        full_name: formattedFullName,
        role: data.role,
        organization: data.organization,
        phone: data.phone,
      };

      const otpPayload = {
        email: data.email,
        fullName: formattedFullName,
        role: data.role,
        matric_number: ""
      };

      const response = await fetch("http://localhost:8000/api/auth/user/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(otpPayload),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.detail !== "Failed to send OTP"){
          throw new Error(result.detail || "Failed to send verification OTP.");
        }
      }

      // Save registration data temporarily for the verification step
      localStorage.setItem("registration_data", JSON.stringify(payload));

      toast.success("Access requested! Please check your email for the OTP.");
      navigate({ to: "/verify-otp" });
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell title="Supervisor registration" subtitle="Request access to review and sign trainee logbooks.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Select value={titleValue} onValueChange={(val) => setValue("title", val, { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Engr." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Engr.">Engr.</SelectItem>
                <SelectItem value="Dr.">Dr.</SelectItem>
                <SelectItem value="Mr.">Mr.</SelectItem>
                <SelectItem value="Mrs.">Mrs.</SelectItem>
                <SelectItem value="Prof.">Prof.</SelectItem>
              </SelectContent>
            </Select>
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" placeholder="Samuel Adebayo" {...register("fullName")} />
            {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Work email</Label>
          <Input id="email" type="email" placeholder="sadebayo@nnpc.com" {...register("email")} />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="organization">Organization</Label>
            <Input id="organization" placeholder="NNPC E&P" {...register("organization")} />
            {errors.organization && <p className="text-xs text-red-500">{errors.organization.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={roleValue} onValueChange={(val: any) => setValue("role", val, { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="industry_supervisor">Industry Supervisor</SelectItem>
                <SelectItem value="institution_supervisor">Institution Supervisor</SelectItem>
                {/* <SelectItem value="itf">ITF Officer</SelectItem> */}
              </SelectContent>
            </Select>
            {errors.role && <p className="text-xs text-red-500">{errors.role.message}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" placeholder="+234 803 000 0000" {...register("phone")} />
          {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="At least 8 characters" {...register("password")} />
          {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-pti text-pti-foreground hover:bg-pti/90"
        >
          {isLoading ? "Submitting request..." : "Request access"}
        </Button>

        <p className="text-sm text-center text-muted-foreground">
          Already registered? <Link to="/login" className="text-pti font-semibold hover:underline">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}