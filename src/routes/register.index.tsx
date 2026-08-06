import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/pti/auth-shell";
import { GraduationCap, BriefcaseBusiness, Building2, ShieldCheck, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/register/")({
  head: () => ({ meta: [{ title: "Register — PTI e-SIWES" }] }),
  component: RegisterPage,
});

const roles = [
  { to: "/register/student" as const, icon: GraduationCap, name: "Student", desc: "PTI student on industrial attachment." },
  { to: "/register/supervisor" as const, icon: BriefcaseBusiness, name: "Industry Supervisor", desc: "Reviewing and signing trainee logs." },
  { to: "/register/supervisor" as const, icon: Building2, name: "Institution Supervisor", desc: "PTI lecturer monitoring SIWES placements." },
  { to: "/register/supervisor" as const, icon: ShieldCheck, name: "ITF / Admin", desc: "Officers overseeing institutional compliance." },
];

function RegisterPage() {
  return (
    <AuthShell title="Choose your role" subtitle="Pick the profile that matches your work — you can request a different role later.">
      <div className="space-y-3">
        {roles.map((r) => (
          <Link key={r.name} to={r.to} className="group flex items-center gap-4 p-4 rounded-xl border border-border hover:border-pti hover:bg-pti/5 transition">
            <div className="size-10 rounded-lg bg-secondary text-pti grid place-items-center group-hover:bg-pti group-hover:text-pti-foreground transition"><r.icon className="size-5" /></div>
            <div className="flex-1"><p className="font-semibold text-sm">{r.name}</p><p className="text-xs text-muted-foreground">{r.desc}</p></div>
            <ArrowRight className="size-4 text-muted-foreground group-hover:text-pti group-hover:translate-x-1 transition" />
          </Link>
        ))}
        <p className="text-sm text-center text-muted-foreground pt-3">
          Already have an account? <Link to="/login" className="text-pti font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </AuthShell>
  );
}
