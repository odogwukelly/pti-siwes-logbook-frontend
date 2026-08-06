import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ShieldCheck,
  Activity,
  ClipboardCheck,
  Building2,
  BarChart3,
  FileText,
  Sparkles,
  Quote,
} from "lucide-react";
import { PtiLogo } from "@/components/pti/logo";
import { Button } from "@/components/ui/button";
import { ActivityHeatmap } from "@/components/pti/activity-heatmap";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PTI e-SIWES — Digital Logbook for Industrial Training" },
      {
        name: "description",
        content:
          "The official Petroleum Training Institute electronic SIWES logbook system. Streamline daily logs, supervisor approvals, and ITF compliance.",
      },
      { property: "og:title", content: "PTI e-SIWES Logbook System" },
      {
        property: "og:description",
        content:
          "Digital SIWES Logbook for Smarter Industrial Training. Built for PTI students, industry & institution supervisors, and the ITF.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <Stats />
      <Features />
      <Roles />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <PtiLogo />
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition">Platform</a>
          <a href="#roles" className="hover:text-foreground transition">Roles</a>
          <a href="#stats" className="hover:text-foreground transition">Compliance</a>
          {/* <Link to="/dashboard" className="hover:text-foreground transition">Demo</Link> */}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild size="sm" className="bg-pti text-pti-foreground hover:bg-pti/90">
            <Link to="/register">
              Register <ArrowRight className="size-3.5 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,oklch(0.32_0.13_254/0.08),transparent)]" />
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-[11px] font-bold uppercase tracking-[0.14em] text-pti">
          <Sparkles className="size-3" /> ITF Form 8 Compliant · 2026
        </span>
        <h1 className="mt-6 text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance">
          Digital SIWES Logbook for{" "}
          <span className="bg-gradient-to-br from-pti to-pti-accent bg-clip-text text-transparent">
            Smarter Industrial Training
          </span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
          The unified platform for Petroleum Training Institute students and industry
          supervisors. Submit daily logs, capture evidence, and generate ITF-ready
          reports — all from one verified workspace.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="bg-pti text-pti-foreground hover:bg-pti/90 shadow-lg shadow-pti/20">
            <Link to="/register">
              Get started — it's free
              <ArrowRight className="size-4 ml-1" />
            </Link>
          </Button>
          {/* <Button asChild variant="outline" size="lg">
            <Link to="/dashboard">View live demo</Link>
          </Button> */}
        </div>

        <div className="mt-16 max-w-5xl mx-auto">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-2xl shadow-pti/10 overflow-hidden ring-1 ring-pti/5">
      <div className="h-9 flex items-center gap-1.5 px-4 border-b border-border bg-muted/30">
        <span className="size-2.5 rounded-full bg-destructive/40" />
        <span className="size-2.5 rounded-full bg-warning/60" />
        <span className="size-2.5 rounded-full bg-success/60" />
        <span className="ml-3 text-[11px] text-muted-foreground font-mono">
          pti-siwes.app/dashboard
        </span>
      </div>
      <div className="grid md:grid-cols-3 gap-6 p-6">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              SIWES Activity · 12 weeks
            </p>
            <span className="font-mono text-xs text-muted-foreground">Wk 14 / 24</span>
          </div>
          <ActivityHeatmap />
          <div className="grid grid-cols-3 gap-3 pt-4">
            {[
              { l: "Hours", v: "560.5" },
              { l: "Approvals", v: "94%" },
              { l: "Skills", v: "14" },
            ].map((s) => (
              <div key={s.l} className="p-3 rounded-lg border border-border bg-background">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  {s.l}
                </p>
                <p className="text-xl font-bold font-mono mt-0.5">{s.v}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3 border-l border-border md:pl-6">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Latest sign-offs
          </p>
          {[
            { t: "Calibration log", s: "approved" },
            { t: "HSE drill", s: "pending" },
            { t: "Mud rheology", s: "approved" },
          ].map((i) => (
            <div key={i.t} className="flex items-center justify-between text-xs p-2 rounded-md hover:bg-muted/50">
              <span className="font-medium">{i.t}</span>
              <span
                className={
                  "text-[10px] font-bold uppercase tracking-wider " +
                  (i.s === "approved" ? "text-success" : "text-warning-foreground")
                }
              >
                {i.s}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stats() {
  const stats = [
    { v: "12,400+", l: "Active student logbooks" },
    { v: "186", l: "Industry partners onboarded" },
    { v: "98.2%", l: "ITF compliance rate" },
    { v: "24/7", l: "Supervisor sign-off access" },
  ];
  return (
    <section id="stats" className="border-y border-border bg-card">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s) => (
          <div key={s.l}>
            <p className="text-3xl md:text-4xl font-bold tracking-tight font-mono text-pti">
              {s.v}
            </p>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mt-2 font-semibold">
              {s.l}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      i: ClipboardCheck,
      t: "Structured daily logs",
      d: "Capture activities, hours, skills and challenges with rich-text entries and instant draft saves.",
    },
    {
      i: ShieldCheck,
      t: "Verified sign-offs",
      d: "Industry & institution supervisors approve, comment and digitally sign — fully audit-trailed.",
    },
    {
      i: Activity,
      t: "Live progress tracking",
      d: "Heatmaps and weekly charts show training intensity, gaps and consistency at a glance.",
    },
    {
      i: FileText,
      t: "ITF Form 8 export",
      d: "Generate the official ITF report — formatted, signed and exportable to PDF in one click.",
    },
    {
      i: BarChart3,
      t: "Institutional analytics",
      d: "Department-wide compliance dashboards for ITF officers, HODs and SIWES coordinators.",
    },
    {
      i: Building2,
      t: "Evidence vault",
      d: "Upload geotagged photos, certificates and PDFs alongside every entry — never lose proof.",
    },
  ];
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-pti mb-3">
            Platform
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Everything PTI's SIWES program needs in a single workspace
          </h2>
          <p className="mt-4 text-muted-foreground">
            Designed with petroleum-engineering supervisors and ITF officers — so every
            log entry, signature and export meets institutional standards.
          </p>
        </div>
        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden border border-border">
          {features.map((f) => (
            <div key={f.t} className="bg-background p-7 hover:bg-card transition group">
              <div className="size-10 rounded-lg bg-pti/10 text-pti grid place-items-center mb-5 group-hover:bg-pti group-hover:text-pti-foreground transition">
                <f.i className="size-5" />
              </div>
              <h3 className="font-bold text-lg tracking-tight">{f.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Roles() {
  const roles = [
    { name: "Students", to: "/register", color: "from-pti to-pti-accent", desc: "Daily logs, weekly summaries, evidence uploads, ITF report export." },
    { name: "Industry Supervisors", to: "/login", color: "from-pti-accent to-success", desc: "Review trainee activity, sign weekly logs, raise comments and verify hours." },
    { name: "Institution Supervisors", to: "/login", color: "from-success to-pti", desc: "Monitor assigned students, run analytics, approve and export." },
    { name: "ITF / Admin", to: "/login", color: "from-pti to-info", desc: "Institution-wide oversight, audit trail, user & department management." },
  ];
  return (
    <section id="roles" className="py-24 px-6 bg-card border-y border-border">
      <div className="max-w-7xl mx-auto">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-pti mb-3">Built for every role</p>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight max-w-xl">
          One platform, four perspectives on the same logbook
        </h2>
        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {roles.map((r) => (
            <Link
              key={r.name}
              to={r.to}
              className="group relative p-6 rounded-2xl bg-background border border-border hover:border-pti transition overflow-hidden"
            >
              <div className={`absolute -top-px -left-px h-1 w-12 bg-gradient-to-r ${r.color}`} />
              <h3 className="font-bold text-lg tracking-tight">{r.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{r.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-pti opacity-0 group-hover:opacity-100 transition">
                Open portal <ArrowRight className="size-3" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    {
      q: "We replaced a paper logbook that nobody enjoyed reviewing. Now sign-offs take minutes — and our HSE audit trail is bulletproof.",
      n: "Engr. S. Adebayo",
      r: "Industry Supervisor · NNPC E&P",
    },
    {
      q: "The compliance dashboard tells me at a glance which students are slipping. ITF Form 8 generation alone saved us weeks each cycle.",
      n: "Dr. Ngozi Eze",
      r: "SIWES Coordinator · PTI Effurun",
    },
    {
      q: "I log my day in three minutes, my supervisor signs from the field, and my report is always export-ready. It just works.",
      n: "Efe Okoro",
      r: "ND II · Petroleum Engineering",
    },
  ];
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight max-w-xl">
          Trusted by supervisors, students, and the ITF
        </h2>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {items.map((t) => (
            <figure
              key={t.n}
              className="p-7 rounded-2xl border border-border bg-card flex flex-col"
            >
              <Quote className="size-6 text-pti/30 mb-4" />
              <blockquote className="text-sm leading-relaxed text-foreground flex-1">
                "{t.q}"
              </blockquote>
              <figcaption className="mt-6 pt-4 border-t border-border">
                <p className="font-semibold text-sm">{t.n}</p>
                <p className="text-xs text-muted-foreground">{t.r}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="px-6 pb-24">
      <div className="max-w-7xl mx-auto rounded-3xl bg-gradient-to-br from-pti via-pti to-pti-accent p-12 md:p-16 text-pti-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,white,transparent_50%)]" />
        <div className="relative max-w-2xl">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Modernize your SIWES program today.
          </h2>
          <p className="mt-4 text-pti-foreground/80 text-lg">
            Onboard your students, supervisors and ITF liaisons in minutes — no
            installation, no setup fees.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg" variant="secondary" className="bg-background text-foreground hover:bg-background/90">
              <Link to="/register">Create your account</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-pti-foreground/30 text-pti-foreground hover:bg-pti-foreground/10">
              <Link to="/login">I already have access</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <PtiLogo />
          <p className="mt-4 text-sm text-muted-foreground max-w-sm">
            The official electronic SIWES logbook of the Petroleum Training Institute,
            Effurun, Delta State, Nigeria.
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-3">Portals</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/login" className="hover:text-pti">Student login</Link></li>
            <li><Link to="/login" className="hover:text-pti">Supervisor access</Link></li>
            <li><Link to="/admin" className="hover:text-pti">ITF dashboard</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-3">Resources</p>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-pti">User manual</a></li>
            <li><a href="#" className="hover:text-pti">ITF Form 8 guide</a></li>
            <li><a href="#" className="hover:text-pti">Help desk</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© 2026 Petroleum Training Institute · e-SIWES Logbook System.</p>
          <p className="font-mono">Built for industrial excellence.</p>
        </div>
      </div>
    </footer>
  );
}
