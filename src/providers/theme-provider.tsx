"use client";

// src/providers/theme-provider.tsx — Gestión de tema + personalización de color
// confidence: high
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { ThemeMode, ColorMode, palettes, lightTokens, darkTokens, ThemeTokens } from "@/lib/theme-config";

export interface ThemeContextValue {
  theme: ThemeMode;
  colorMode: ColorMode;
  tokens: ThemeTokens;
  resolvedTheme: "light" | "dark"; // "auto" resuelto a light/dark
  setTheme: (theme: ThemeMode) => void;
  setColorMode: (colorMode: ColorMode) => void;
  toggleTheme: () => void;
  toggleColorMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY_THEME = "sushi-theme";
const STORAGE_KEY_COLOR = "sushi-color";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Detectar preferencia del sistema
  const getSystemTheme = useCallback((): "light" | "dark" => {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }, []);

  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "auto";
    return (window.localStorage.getItem(STORAGE_KEY_THEME) as ThemeMode) || "auto";
  });
  const [colorMode, setColorModeState] = useState<ColorMode>(() => {
    if (typeof window === "undefined") return "red";
    return (window.localStorage.getItem(STORAGE_KEY_COLOR) as ColorMode) || "red";
  });
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const resolve = () => setResolvedTheme(theme === "auto" ? getSystemTheme() : theme);
    resolve();

    if (theme === "auto") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", resolve);
      return () => mq.removeEventListener("change", resolve);
    }
  }, [theme, getSystemTheme]);

  // Aplicar clase .dark al html para override manual
  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [resolvedTheme]);

  // Aplicar tokens CSS al documento
  useEffect(() => {
    const root = document.documentElement;
    const palette = palettes[colorMode];
    const primary700 = palette[700];

    root.style.setProperty("--color-primary", primary700);
    root.style.setProperty("--color-primary-foreground", "oklch(1 0 0)");
    root.style.setProperty("--color-primary-50", palette[50]);
    root.style.setProperty("--color-primary-100", palette[100]);
    root.style.setProperty("--color-primary-200", palette[200]);
    root.style.setProperty("--color-primary-300", palette[300]);
    root.style.setProperty("--color-primary-400", palette[400]);
    root.style.setProperty("--color-primary-500", palette[500]);
    root.style.setProperty("--color-primary-600", palette[600]);
    root.style.setProperty("--color-primary-700", primary700);
    root.style.setProperty("--color-primary-800", palette[800]);
    root.style.setProperty("--color-primary-900", palette[900]);

    const resolvedTokens = resolvedTheme === "dark" ? darkTokens : lightTokens;
    root.style.setProperty("--background", resolvedTokens.background);
    root.style.setProperty("--foreground", resolvedTokens.foreground);
    root.style.setProperty("--card", resolvedTokens.card);
    root.style.setProperty("--card-foreground", resolvedTokens.cardForeground);
    root.style.setProperty("--border", resolvedTokens.border);
    root.style.setProperty("--input", resolvedTokens.input);
    root.style.setProperty("--ring", primary700);
  }, [resolvedTheme, colorMode]);

  const setTheme = useCallback((t: ThemeMode) => {
    setThemeState(t);
    window.localStorage.setItem(STORAGE_KEY_THEME, t);
  }, []);

  const setColorMode = useCallback((c: ColorMode) => {
    setColorModeState(c);
    window.localStorage.setItem(STORAGE_KEY_COLOR, c);
  }, []);

  const toggleTheme = useCallback(() => {
    const next: ThemeMode = theme === "light" ? "dark" : theme === "dark" ? "auto" : "light";
    setTheme(next);
  }, [theme, setTheme]);

  const toggleColorMode = useCallback(() => {
    const modes: ColorMode[] = ["red", "rose", "blue", "violet", "green", "amber"];
    const idx = modes.indexOf(colorMode);
    setColorMode(modes[(idx + 1) % modes.length]);
  }, [colorMode, setColorMode]);

  const tokens = resolvedTheme === "dark" ? { ...darkTokens, primary: palettes[colorMode] } : { ...lightTokens, primary: palettes[colorMode] };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colorMode,
        tokens,
        resolvedTheme,
        setTheme,
        setColorMode,
        toggleTheme,
        toggleColorMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme debe usarse dentro de ThemeProvider");
  }
  return ctx;
}
