// src/lib/validations.ts — Schemas Zod para validación de formularios
// confidence: high

import { z } from "zod";

export const categoriaSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  orden: z.number().int().min(0).default(0),
  activo: z.boolean().default(true),
});

export const productoSchema = z.object({
  nombre: z.string().min(2, "El nombre es requerido"),
  descripcion: z.string().optional(),
  ingredientes: z.string().optional(),
  precio: z.number().min(0.01, "El precio debe ser mayor a 0"),
  categoriaId: z.string().min(1, "Debe seleccionar una categoría"),
  imagen: z.string().url("Debe ser una URL válida").optional(),
  disponible: z.boolean().default(true),
});

export const pedidoItemSchema = z.object({
  productoId: z.string().min(1),
  cantidad: z.number().int().min(1, "Debe ser al menos 1"),
  precio: z.number().min(0),
  notas: z.string().optional(),
});

export const pedidoSchema = z.object({
  nombre: z.string().min(2, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  telefono: z.string().min(6, "Teléfono inválido"),
  notas: z.string().optional(),
});

export const reservaSchema = z.object({
  nombre: z.string().min(2, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  telefono: z.string().min(6, "Teléfono inválido"),
  fecha: z.string().min(1, "La fecha es requerida"),
  personas: z.number().int().min(1, "Debe ser al menos 1").max(10, "Máximo 10 personas"),
  notas: z.string().optional(),
});

export const promocionSchema = z.object({
  titulo: z.string().min(2),
  descripcion: z.string().optional(),
  imagen: z.string().url("URL inválida").optional(),
  tipo: z.enum(["PORCENTUAL", "MONTO_FIJO", "ENVIO_GRATIS"]),
  valor: z.number().min(0).optional(),
  codigo: z.string().optional(),
  fechaInicio: z.string().min(1),
  fechaFin: z.string().min(1),
  activa: z.boolean().default(true),
});

export const publicacionSchema = z.object({
  titulo: z.string().min(2),
  contenido: z.string().optional(),
  imagen: z.string().url("URL inválida").optional(),
  publicada: z.boolean().default(false),
  fechaPublica: z.string().min(1),
});
