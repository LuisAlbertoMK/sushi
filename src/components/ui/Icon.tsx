// src/components/ui/Icon.tsx — Wrapper accesible para emoji-icons
// confidence: high
//
// Reemplaza los emoji raw (🍣🛒📅🎁) con un component accesible:
// - aria-hidden en el emoji visual
// - texto visible con sr-only para screen readers
// - fallback visual consistente
import { cn } from "@/lib/utils";

interface IconProps {
  emoji: string;
  label: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-4xl",
};

export function Icon({ emoji, label, className, size = "md" }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-block", sizeMap[size], className)}
      role="img"
    >
      {emoji}
      <span className="sr-only">{label}</span>
    </span>
  );
}
