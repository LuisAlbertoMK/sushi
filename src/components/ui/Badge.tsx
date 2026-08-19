// src/components/ui/Badge.tsx — Badge con texto accesible (no solo color)
// confidence: high
import { cn } from "@/lib/utils";

export interface BadgeProps {
  variant?: "pending" | "cooking" | "ready" | "delivered" | "cancelled" | "default";
  children: React.ReactNode;
  className?: string;
}

const variantConfig: Record<NonNullable<BadgeProps["variant"]>, string> = {
  pending: "bg-status-pending-bg text-status-pending-fg",
  cooking: "bg-status-cooking-bg text-status-cooking-fg",
  ready: "bg-status-ready-bg text-status-ready-fg",
  delivered: "bg-status-delivered-bg text-status-delivered-fg",
  cancelled: "bg-status-cancelled-bg text-status-cancelled-fg",
  default: "bg-muted text-foreground",
};

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium",
        variantConfig[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
