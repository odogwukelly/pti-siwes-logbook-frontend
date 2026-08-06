import { cn } from "@/lib/utils";
import { LogStatus } from "@/lib/mock-data";

const map: Record<LogStatus, { label: string; cls: string }> = {
  approved: { label: "Approved", cls: "bg-success/10 text-success ring-success/20" },
  pending: { label: "Pending", cls: "bg-warning/15 text-warning-foreground ring-warning/30" },
  rejected: { label: "Rejected", cls: "bg-destructive/10 text-destructive ring-destructive/20" },
  draft: { label: "Draft", cls: "bg-muted text-muted-foreground ring-border" },
};

export function StatusPill({ status }: { status: LogStatus }) {
  const m = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset",
        m.cls,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {m.label}
    </span>
  );
}