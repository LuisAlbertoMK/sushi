// src/lib/types.ts — Tipos compartidos entre frontend y backend
// confidence: high — definidos a partir de prisma/schema.prisma

import { Prisma } from "@prisma/client";

// --- Prisma inferred types (para evitar repetir) ---
export type CategoriaWithProductos = Prisma.CategoriaGetPayload<{
  include: { productos: true };
}>;

export type ProductoWithCategoria = Prisma.ProductoGetPayload<{
  include: { categoria: true };
}>;

export type PedidoWithItems = Prisma.PedidoGetPayload<{
  include: { items: { include: { producto: true } }; user: true };
}>;

export type Reservacion = Prisma.ReservacionGetPayload<null>;
export type Promocion = Prisma.PromocionGetPayload<null>;
export type Publicacion = Prisma.PublicacionGetPayload<null>;

// --- Tipos de la UI ---
export interface CartItem {
  productoId: string;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen?: string | null;
  notas?: string;
}

export interface CartState {
  items: CartItem[];
  total: number;
}

// --- Form Schemas (validación con Zod en cada formulario) ---
export interface MenuFilters {
  categoriaId?: string;
  disponible?: boolean;
}

export interface CheckoutForm {
  nombre: string;
  email: string;
  telefono: string;
  notas?: string;
  metodo: "mercadopago" | "whatsapp";
}

export interface ReservaForm {
  nombre: string;
  email: string;
  telefono: string;
  fecha: string; // ISO date string
  personas: number;
  notas?: string;
}

export interface ProductoForm {
  nombre: string;
  descripcion?: string;
  precio: number;
  categoriaId: string;
  imagen?: string;
  disponible: boolean;
}

export interface CategoriaForm {
  nombre: string;
  orden: number;
  activo: boolean;
}

export interface PromocionForm {
  titulo: string;
  descripcion?: string;
  imagen?: string;
  tipo: "PORCENTUAL" | "MONTO_FIJO" | "ENVIO_GRATIS";
  valor?: number;
  codigo?: string;
  fechaInicio: string;
  fechaFin: string;
  activa: boolean;
}

export interface PublicacionForm {
  titulo: string;
  contenido?: string;
  imagen?: string;
  publicada: boolean;
  fechaPublica: string;
}
