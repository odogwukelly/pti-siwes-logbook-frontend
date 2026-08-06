// import { Link } from "@tanstack/react-router";
// import { cn } from "@/lib/utils";

// export function PtiLogo({ className, compact = false }: { className?: string; compact?: boolean }) {
//   return (
//     <Link to="/" href="/" className={cn("flex items-center gap-2.5 group", className)}>
//       {/* <div className="relative size-9 rounded-lg bg-pti text-pti-foreground grid place-items-center font-bold text-lg shadow-sm shadow-pti/30">
//         <span className="font-mono">P</span>
//         <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-pti-accent ring-2 ring-background" />
//       </div> */}
//       <img src="/pti-logo.jpg" alt="PTI Logo " />
//       {!compact && (
//         <div className="leading-tight">
//           <p className="font-bold text-[15px] tracking-tight text-foreground">PTI e-SIWES</p>
//           <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-medium">
//             Logbook System
//           </p>
//         </div>
//       )}
//     </Link>
//   );
// }

import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

interface PtiLogoProps {
  className?: string;
  compact?: boolean;
}

export function PtiLogo({ className, compact = false }: PtiLogoProps) {
  return (
    // REMOVED: href="/" to let TanStack Router handle SPA navigation cleanly via 'to'
    <Link to="/" className={cn("flex items-center gap-2.5 group select-none", className)}>
      
      {/* 
        OPTIMIZATION: Added explicit size/contain constraints to the image 
        to prevent layout layout shift (CLS) while it loads.
      */}
      <img 
        src="/pti-logo.jpg" 
        alt="PTI Logo" 
        className="size-9 object-contain rounded-md" 
      />
      
      {!compact && (
        <div className="leading-tight">
          <p className="font-bold text-[15px] tracking-tight text-foreground transition-colors group-hover:text-pti">
            PTI e-SIWES
          </p>
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-medium">
            Logbook System
          </p>
        </div>
      )}
    </Link>
  );
}