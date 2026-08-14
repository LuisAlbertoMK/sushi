"use client";

// src/components/ui/ThemeToggle.tsx — Toggle dark/light + personalización de color
// confidence: high
import { useTheme } from "@/providers/theme-provider";
import { Icon } from "@/components/ui/Icon";

export function ThemeToggle() {
  const { theme, colorMode, resolvedTheme, toggleTheme, toggleColorMode } = useTheme();

  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-2 z-50">
      {/* Toggle color primario (personalización) */}
      <button
        onClick={toggleColorMode}
        aria-label="Cambiar color del tema"
        title="Cambiar color primario"
        className="bg-card border border-border text-foreground hover:bg-primary hover:text-primary-foreground transition-all rounded-full p-2 shadow-md hover:shadow-lg"
      >
        <Icon emoji="🎨" label="Cambiar color" className="w-5 h-5" />
      </button>

      {/* Toggle dark/light */}
      <button
        onClick={toggleTheme}
        aria-label={`Cambiar a modo ${resolvedTheme === "dark" ? "claro" : "oscuro"}`}
        title={`Modo ${resolvedTheme === "dark" ? "claro" : "oscuro"}`}
        className="bg-card border border-border text-foreground hover:bg-primary hover:text-primary-foreground transition-all rounded-full p-2 shadow-md hover:shadow-lg"
      >
        {resolvedTheme === "dark" ? (
          <Icon emoji="☀️" label="Modo claro" />
        ) : (
          <Icon emoji="🌙" label="Modo oscuro" />
        )}
      </button>

      {/* Indicador del tema actual */}
      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
        {resolvedTheme === "dark" ? "dark" : "light"}
      </span>
    </div>
  );
}
