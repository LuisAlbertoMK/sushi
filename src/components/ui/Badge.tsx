// src/components/ui/Badge.tsx — Badge con texto accesible (no solo color)
// confidence: high
import { cn } from "@/lib/utils";

export interface BadgeProps {
  variant?: "pending" | "cooking" | "ready" | "delivered" | "cancelled" | "default";
  children: React.ReactNode;
  className?: string;
}

const variantConfig: Record<NonNullable<BadgeProps["variant"]>, string> = {
  pending: "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200",
  cooking: "bg-orange-100 text-orange-900 dark:bg-orange-500/20 dark:text-orange-200",
  ready: "bg-blue-100 text-blue-900 dark:bg-blue-500/20 dark:text-blue-200",
  delivered: "bg-green-100 text-green-900 dark:bg-green-500/20 dark:text-green-200",
  cancelled: "bg-red-100 text-red-900 dark:bg-red-500/20 dark:text-red-200",
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
