import { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { PtiLogo } from "./logo";
import { ShieldCheck, Activity, FileText } from "lucide-react";

export function AuthShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="flex flex-col p-6 lg:p-12">
        <PtiLogo />
        <div className="flex-1 flex items-center justify-center py-12">
          <div className="w-full max-w-md">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          By continuing you agree to PTI's{" "}
          <Link to="/" className="underline hover:text-foreground">terms</Link> &{" "}
          <Link to="/" className="underline hover:text-foreground">privacy policy</Link>.
        </p>
      </div>

      <div className="hidden lg:flex relative bg-pti text-pti-foreground p-12 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,oklch(0.65_0.16_230/0.5),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }} />
        <div className="relative flex flex-col justify-between w-full">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pti-foreground/10 text-[10px] font-bold uppercase tracking-[0.14em]">
              ITF Form 8 Compliant
            </span>
            <h2 className="mt-6 text-4xl font-bold tracking-tight max-w-md text-balance">
              The verified workspace for PTI's industrial training program.
            </h2>
            <p className="mt-4 text-pti-foreground/70 max-w-sm">
              Submit, sign, and audit every SIWES log entry without paper, email
              chains, or version chaos.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { i: ShieldCheck, t: "Tamper-proof digital signatures" },
              { i: Activity, t: "Live compliance & progress tracking" },
              { i: FileText, t: "One-click ITF Form 8 export" },
            ].map((f) => (
              <div key={f.t} className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-pti-foreground/10 grid place-items-center">
                  <f.i className="size-4" />
                </div>
                <span className="text-sm font-medium">{f.t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}