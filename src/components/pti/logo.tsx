import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

interface PtiLogoProps {
  className?: string;
  redirectUrl?: string;
  compact?: boolean;
  logoSize?: number;
}

export function PtiLogo({ className, compact = false, logoSize = 10, redirectUrl="/" }: PtiLogoProps) {
  return (
    // REMOVED: href="/" to let TanStack Router handle SPA navigation cleanly via 'to'
    <Link to={cn(redirectUrl)} className={cn("flex items-center gap-2.5 group select-none", className)}>
      
      {/* 
        OPTIMIZATION: Added explicit size/contain constraints to the image 
        to prevent layout layout shift (CLS) while it loads.
      */}
      <img 
        src="/pti-logo.jpg" 
        alt="PTI Logo" 
        className={cn(`size-${logoSize} object-contain rounded-md`)}
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