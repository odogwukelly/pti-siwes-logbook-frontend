import { activityHeatmap } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const days = ["M", "T", "W", "T", "F", "S", "S"];

const intensity = [
  "bg-secondary",
  "bg-pti/15",
  "bg-pti/40",
  "bg-pti/70",
  "bg-pti",
];

export function ActivityHeatmap() {
  return (
    <div className="flex gap-2">
      <div className="flex flex-col justify-between text-[9px] font-mono text-muted-foreground py-0.5">
        {days.map((d, i) => (
          <span key={i} className="h-3 leading-3">
            {i % 2 === 0 ? d : ""}
          </span>
        ))}
      </div>
      <div className="flex gap-1 flex-1">
        {activityHeatmap.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1 flex-1">
            {week.map((v, di) => (
              <div
                key={di}
                className={cn(
                  "h-3 rounded-[3px] ring-1 ring-inset ring-border/40",
                  intensity[v],
                )}
                title={`Week ${wi + 1}, day ${di + 1}: ${v} entries`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}