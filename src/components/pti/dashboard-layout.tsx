import { ReactNode, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  NotebookPen,
  CalendarDays,
  FileText,
  Bell,
  Users,
  ShieldCheck,
  Building2,
  Settings,
  LogOut,
  Search,
  Menu,
  X,
  ChevronDown,
  BarChart3,
  ClipboardCheck,
  FolderArchive,
  ScrollText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PtiLogo } from "./logo";
import { Button } from "@/components/ui/button";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useQueryClient } from "@tanstack/react-query";


export type Role = "student" | "industry" | "institution" | "admin";

type NavItem = { label: string; to: string; icon: typeof LayoutDashboard; badge?: string };

const navByRole: Record<Role, { section: string; items: NavItem[] }[]> = {
  student: [
    {
      section: "Workspace",
      items: [
        { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
        { label: "Daily Log", to: "/dashboard/daily-log", icon: NotebookPen },
        { label: "Notifications", to: "/dashboard/notifications", icon: Bell, badge: "3" },
      ],
    },
    {
      section: "Reporting",
      items: [
        { label: "ITF Report", to: "/dashboard/report", icon: FileText },
      ],
    },
  ],
  industry: [
    {
      section: "Review",
      items: [
        { label: "Dashboard", to: "/supervisor", icon: LayoutDashboard },
        { label: "Approvals", to: "/supervisor/approvals", icon: ClipboardCheck },
        { label: "My Trainees", to: "/supervisor/trainees", icon: Users },
        { label: "Notifications", to: "/supervisor/notifications", icon: Bell },
      ],
    },
    {
      section: "Sign-off",
      items: [{ label: "Digital Signature", to: "/supervisor/signature", icon: ShieldCheck }],
    },
  ],
  institution: [
    {
      section: "Monitoring",
      items: [
        { label: "Dashboard", to: "/institution", icon: LayoutDashboard },
        { label: "Assigned Students", to: "/institution/students", icon: Users },
        // { label: "Analytics", to: "/institution/analytics", icon: BarChart3 },
        { label: "Approvals", to: "/institution/approvals", icon: ClipboardCheck },
      ],
    },
    {
      section: "Reports",
      items: [{ label: "Export", to: "/institution/export", icon: FileText }],
    },
  ],
  admin: [
    {
      section: "Operations",
      items: [
        { label: "Overview", to: "/admin", icon: LayoutDashboard },
        { label: "Users", to: "/admin/users", icon: Users },
        { label: "Departments", to: "/admin/departments", icon: Building2 },
        { label: "Audit Logs", to: "/admin/audit", icon: ScrollText },
      ],
    },
    {
      section: "System",
      items: [{ label: "Settings", to: "/admin/settings", icon: Settings }],
    },
  ],
};

export function DashboardLayout({
  role,
  children,
  title,
  subtitle,
  actions,
}: {
  role: Role;
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const sections = navByRole[role];
  const queryClient = useQueryClient();

  // Fetch authenticated user (flattened by useAuthUser hook)
  const { data: authUser } = useAuthUser();

  // Extract fields directly from the flattened UserData interface
  const fullName = authUser?.full_name;
  const department = authUser?.department;
  const userRole = authUser?.role;

  const user = {
    name: fullName || (
      role === "student" ? "" :
        role === "industry" ? "Engr. S. Adebayo" :
          role === "institution" ? "Dr. Ngozi Eze" : "ITF Officer"
    ),
    sub: role === "student"
      ? (department ? `Student · ${department} Dept.` : "")
      : role === "industry" ? "Industry Supervisor"
        : role === "institution" ? "Institution Supervisor"
          : "Admin · ITF Liaison",
    initials: fullName
      ? fullName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
      : role === "student" ? "SU" : role === "industry" ? "SA" : role === "institution" ? "NE" : "IT",
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-64 border-r border-border bg-sidebar flex flex-col transition-transform",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="h-16 px-5 border-b border-border flex items-center justify-between">
          <PtiLogo />
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden text-muted-foreground p-1"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
          {sections.map((section) => (
            <div key={section.section}>
              <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                {section.section}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        active
                          ? "bg-pti text-pti-foreground shadow-sm shadow-pti/20"
                          : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                      )}
                    >
                      <item.icon className="size-4 shrink-0" />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <span
                          className={cn(
                            "text-[10px] font-bold font-mono px-1.5 py-0.5 rounded",
                            active
                              ? "bg-pti-foreground/20 text-pti-foreground"
                              : "bg-pti/10 text-pti",
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-sidebar-accent cursor-pointer">
            <div className="size-9 rounded-full bg-pti text-pti-foreground grid place-items-center text-xs font-bold">
              {user.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold capitalize truncate">{user.name}</p>
              <p className="text-[11px] text-muted-foreground truncate capitalize">{user.sub}</p>
            </div>
            <ChevronDown className="size-4 text-muted-foreground" />
          </div>
          <Link
            to="/login"
            onClick={() => {
              // Clear local storage
              localStorage.removeItem("access_token");
              localStorage.removeItem("user_data");
              localStorage.removeItem("registration_data");

              // Clear TanStack Query memory cache so old user data doesn't bleed over
              queryClient.clear();
            }}
            className="mt-1 flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
          >
            <LogOut className="size-4" /> Sign out
          </Link>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-foreground/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur sticky top-0 z-20 flex items-center gap-4 px-4 lg:px-8">
          <button
            className="lg:hidden p-2 -ml-2 text-foreground"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
          <div className="flex-1 max-w-md relative hidden md:block">
            <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search logs, students, reports…"
              className="w-full h-9 pl-9 pr-3 text-sm rounded-lg bg-secondary border border-transparent focus:border-pti focus:bg-background outline-none transition"
            />
          </div>
          <div className="flex-1 md:hidden" />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              {userRole === "student" ?
                <>
                  <Link to="/dashboard/notifications">
                    <Bell className="size-4" />
                    <span className="absolute top-2 right-2 size-1.5 rounded-full bg-pti-accent" />
                  </Link>
                </>
                :
                <>
                  <Link to="/supervisor/notifications">
                    <Bell className="size-4" />
                    <span className="absolute top-2 right-2 size-1.5 rounded-full bg-pti-accent" />
                  </Link>
                </>
              }


            </Button>
            <div className="size-9 rounded-full bg-secondary text-foreground grid place-items-center text-xs font-bold border border-border">
              {user.initials}
            </div>
          </div>
        </header>

        <div className="px-4 lg:px-8 py-6 lg:py-8 max-w-[1500px] w-full mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
              )}
            </div>
            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}