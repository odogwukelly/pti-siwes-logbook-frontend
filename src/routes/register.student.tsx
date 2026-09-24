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

// Zod validation schema matching backend expectations
const studentRegisterSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  surname: z.string().min(1, "Surname is required"),
  matricNumber: z.string().min(1, "Matric number is required"),
  department: z.string().min(1, "Department is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  industrialOrganization: z.string().min(1, "Industrial organization is required"),
});

type StudentRegisterFormValues = z.infer<typeof studentRegisterSchema>;

export const Route = createFileRoute("/register/student")({
  head: () => ({ meta: [{ title: "Student registration — PTI e-SIWES" }] }),
  component: StudentRegister,
});

function StudentRegister() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StudentRegisterFormValues>({
    resolver: zodResolver(studentRegisterSchema),
    defaultValues: {
      firstName: "",
      surname: "",
      matricNumber: "",
      department: "",
      email: "",
      password: "",
      industrialOrganization: "",
    },
  });

  const departmentValue = watch("department");

 const onSubmit = async (data: StudentRegisterFormValues) => {
    setIsLoading(true);
    try {
      // Combine first and last name into full_name as expected by your FastAPI backend
      const fullName = `${data.firstName.trim()} ${data.surname.trim()}`;
      
      const payload = {
        email: data.email,
        password: data.password,
        full_name: fullName,
        role: "student",
        matric_number: data.matricNumber,
        department: data.department,
        industrial_organization: data.industrialOrganization,
      };

      const otpPayload = {
        email: data.email,
        fullName: fullName,
        matric_number: data.matricNumber,
        role: "student",
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
          throw new Error(result.detail || "Failed to register account.");
        }
        // toast.error(result.detail || "Failed to register account.");
      }

      // Save form data and backend result into localStorage
      localStorage.setItem("registration_data", JSON.stringify(payload));

      toast.success("Registration successful! Please check your email to verify.");

      // Navigate to verification or login page
      navigate({ to: "/verify-otp" });
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell title="Student registration" subtitle="Set up your SIWES logbook in under two minutes.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" placeholder="Efe" {...register("firstName")} />
            {errors.firstName && <p className="text-xs text-red-500">{errors.firstName.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="surname">Surname</Label>
            <Input id="surname" placeholder="Okoro" {...register("surname")} />
            {errors.surname && <p className="text-xs text-red-500">{errors.surname.message}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="matricNumber">Matric number</Label>
          <Input id="matricNumber" placeholder="PTI/PE/2021/0742" className="font-mono" {...register("matricNumber")} />
          {errors.matricNumber && <p className="text-xs text-red-500">{errors.matricNumber.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Department</Label>
            <Select value={departmentValue} onValueChange={(val) => setValue("department", val, { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mechanical">Mechanical Engineering</SelectItem>
                <SelectItem value="petroleum">Petroleum Engineering</SelectItem>
                <SelectItem value="chemical">Chemical Engineering</SelectItem>
                <SelectItem value="electrical">Electrical Engineering</SelectItem>
                <SelectItem value="welding">Welding & Fabrication</SelectItem>
              </SelectContent>
            </Select>
            {errors.department && <p className="text-xs text-red-500">{errors.department.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="industrialOrganization">Industrial Organization</Label>
            <Input id="industrialOrganization" placeholder="Company Name" {...register("industrialOrganization")} />
            {errors.industrialOrganization && <p className="text-xs text-red-500">{errors.industrialOrganization.message}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">School email</Label>
          <Input id="email" placeholder="efe.okoro@pti.edu.ng" type="email" {...register("email")} />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="At least 6 characters" {...register("password")} />
          {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-pti text-pti-foreground hover:bg-pti/90"
        >
          {isLoading ? "Creating account..." : "Create account"}
        </Button>

        <p className="text-sm text-center text-muted-foreground">
          Have an account? <Link to="/login" className="text-pti font-semibold hover:underline">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}