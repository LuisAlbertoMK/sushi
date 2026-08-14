// src/lib/utils.ts — Utilidades compartidas
// confidence: high

import { type ClassValue, clsx } from "clsx";

// Simple merge de class names (clsx solo — sin tailwind-merge para evitar dep extra)
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Genera número de pedido único: PED-YYYYMMDD-XXXX
export function generarNumeroPedido(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `PED-${date}-${random}`;
}

// Formatea precio a moneda USD/ARS
export function formatearPrecio(precio: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: process.env.NEXT_PUBLIC_CURRENCY || "USD",
    minimumFractionDigits: 2,
  }).format(precio);
}

// Valida formato de email
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Trunca texto a N caracteres
export function truncar(texto: string, max: number = 60): string {
  if (texto.length <= max) return texto;
  return texto.slice(0, max) + "...";
}
