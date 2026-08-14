// src/lib/theme-config.ts — Tokens de diseño personalizables con OKLCH
// confidence: high — permite dark/light + personalización de color primario
// OKLCH (perceptual) asegura accesibilidad y consistencia visual entre temas
// Fuente: Tailwind CSS v4 color palette (convertido a OKLCH)

export type ThemeMode = "light" | "dark" | "auto";
export type ColorMode = "red" | "rose" | "blue" | "violet" | "green" | "amber";

export interface ThemeTokens {
  // Color primario (personalizable)
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  // Color de acento (derivado del primario)
  accent: {
    DEFAULT: string;
    foreground: string;
  };
  // Neutros
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  border: string;
  input: string;
  ring: string;
}

// Paleta de colores primarios personalizables (OKLCH)
const palettes: Record<ColorMode, ThemeTokens["primary"]> = {
  red: {
    50: "oklch(0.974 0.013 24.5)",
    100: "oklch(0.941 0.025 24.5)",
    200: "oklch(0.879 0.051 24.5)",
    300: "oklch(0.809 0.083 24.5)",
    400: "oklch(0.714 0.152 24.5)",
    500: "oklch(0.644 0.245 24.5)",
    600: "oklch(0.571 0.312 24.5)",
    700: "oklch(0.496 0.367 24.5)",
    800: "oklch(0.413 0.415 24.5)",
    900: "oklch(0.313 0.429 24.5)",
  },
  rose: {
    50: "oklch(0.974 0.013 340)",
    100: "oklch(0.941 0.025 340)",
    200: "oklch(0.879 0.051 340)",
    300: "oklch(0.809 0.083 340)",
    400: "oklch(0.714 0.152 340)",
    500: "oklch(0.644 0.245 340)",
    600: "oklch(0.571 0.312 340)",
    700: "oklch(0.496 0.367 340)",
    800: "oklch(0.413 0.415 340)",
    900: "oklch(0.313 0.429 340)",
  },
  blue: {
    50: "oklch(0.984 0.012 234)",
    100: "oklch(0.966 0.025 234)",
    200: "oklch(0.915 0.052 234)",
    300: "oklch(0.854 0.088 234)",
    400: "oklch(0.749 0.158 234)",
    500: "oklch(0.68 0.255 234)",
    600: "oklch(0.605 0.333 234)",
    700: "oklch(0.517 0.393 234)",
    800: "oklch(0.437 0.442 234)",
    900: "oklch(0.346 0.465 234)",
  },
  violet: {
    50: "oklch(0.984 0.012 291)",
    100: "oklch(0.966 0.025 291)",
    200: "oklch(0.915 0.052 291)",
    300: "oklch(0.854 0.088 291)",
    400: "oklch(0.749 0.158 291)",
    500: "oklch(0.68 0.255 291)",
    600: "oklch(0.605 0.333 291)",
    700: "oklch(0.517 0.393 291)",
    800: "oklch(0.437 0.442 291)",
    900: "oklch(0.346 0.465 291)",
  },
  green: {
    50: "oklch(0.984 0.015 160)",
    100: "oklch(0.966 0.028 160)",
    200: "oklch(0.915 0.058 160)",
    300: "oklch(0.854 0.095 160)",
    400: "oklch(0.749 0.172 160)",
    500: "oklch(0.68 0.272 160)",
    600: "oklch(0.605 0.358 160)",
    700: "oklch(0.517 0.429 160)",
    800: "oklch(0.437 0.49 160)",
    900: "oklch(0.346 0.553 160)",
  },
  amber: {
    50: "oklch(0.984 0.013 80)",
    100: "oklch(0.966 0.026 80)",
    200: "oklch(0.915 0.052 80)",
    300: "oklch(0.854 0.095 80)",
    400: "oklch(0.749 0.172 80)",
    500: "oklch(0.68 0.265 80)",
    600: "oklch(0.605 0.358 80)",
    700: "oklch(0.517 0.429 80)",
    800: "oklch(0.437 0.488 80)",
    900: "oklch(0.346 0.562 80)",
  },
};

// Tokens para dark mode
const lightTokens: ThemeTokens = {
  primary: palettes.red,
  accent: {
    DEFAULT: "oklch(0.644 0.245 24.5)",
    foreground: "oklch(1 0 0)",
  },
  background: "oklch(1 0 0)",
  foreground: "oklch(0.13 0 0)",
  card: "oklch(0.985 0 0)",
  cardForeground: "oklch(0.13 0 0)",
  border: "oklch(0.85 0 0)",
  input: "oklch(0.92 0 0)",
  ring: "oklch(0.644 0.245 24.5)",
};

const darkTokens: ThemeTokens = {
  primary: palettes.red,
  accent: {
    DEFAULT: "oklch(0.644 0.245 24.5)",
    foreground: "oklch(1 0 0)",
  },
  background: "oklch(0.13 0 0)",
  foreground: "oklch(0.92 0 0)",
  card: "oklch(0.17 0 0)",
  cardForeground: "oklch(0.92 0 0)",
  border: "oklch(0.27 0.04 0)",
  input: "oklch(0.22 0.03 0)",
  ring: "oklch(0.644 0.245 24.5)",
};

export { palettes, lightTokens, darkTokens };
