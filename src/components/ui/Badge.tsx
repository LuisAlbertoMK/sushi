// src/components/ui/Badge.tsx
// confidence: high
import { cn } from "@/lib/utils";

export interface BadgeProps {
  variant?: "pending" | "cooking" | "ready" | "delivered" | "cancelled" | "default";
  children: React.ReactNode;
  className?: string;
}

const variantMap = {
  pending: "bg-yellow-100 text-yellow-800",
  cooking: "bg-orange-100 text-orange-800",
  ready: "bg-blue-100 text-blue-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  default: "bg-gray-100 text-gray-800",
};

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variantMap[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
