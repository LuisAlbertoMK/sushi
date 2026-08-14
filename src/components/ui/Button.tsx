// src/components/ui/Button.tsx
// confidence: high
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  const base = "rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 disabled:hover:bg-gray-300";
  const variants = {
    primary: "bg-primary-700 text-white hover:bg-primary-800 shadow-sm hover:shadow disabled:bg-primary-400 disabled:text-white",
    secondary: "bg-card text-foreground hover:bg-accent disabled:bg-gray-300",
    outline: "border-2 border-primary-700 text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-950/30 disabled:border-muted disabled:text-muted-foreground disabled:bg-card",
    ghost: "text-foreground hover:bg-accent disabled:text-gray-400",
    danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400 disabled:text-white",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
