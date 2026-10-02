// src/components/ui/Icon.tsx — Wrapper accesible para emoji-icons
// confidence: high
//
// Reemplaza los emoji raw (🍣🛒📅🎁) con un component accesible:
// - el contenedor expone el nombre accesible (role="img" + aria-label)
// - el emoji visual queda oculto para screen readers
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
      role="img"
      aria-label={label}
      className={cn("inline-block", sizeMap[size], className)}
    >
      <span aria-hidden="true">{emoji}</span>
    </span>
  );
}
