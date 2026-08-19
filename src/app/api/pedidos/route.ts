// src/app/api/pedidos/route.ts
// confidence: high
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generarNumeroPedido } from "@/lib/utils";
import { pedidoSchema, pedidoItemSchema } from "@/lib/validations";

// POST público → crear pedido + items
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar datos del cliente
    const parsed = pedidoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const items = Array.isArray(body.items) ? body.items : [];
    if (items.length === 0) {
      return NextResponse.json(
        { error: "El carrito está vacío" },
        { status: 400 }
      );
    }

    // Validar cada item contra schema y verificar productos existen
    const validatedItems = [];
    let total = 0;
    for (const item of items) {
      const parsedItem = pedidoItemSchema.safeParse(item);
      if (!parsedItem.success) {
        return NextResponse.json(
          { error: "Item inválido", details: parsedItem.error.errors },
          { status: 400 }
        );
      }
      const producto = await db.producto.findUnique({
        where: { id: item.productoId },
      });
      if (!producto) {
        return NextResponse.json(
          { error: `Producto no encontrado: ${item.productoId}` },
          { status: 404 }
        );
      }
      const itemTotal = producto.precio * item.cantidad;
      total += itemTotal;
      validatedItems.push({
        productoId: producto.id,
        cantidad: item.cantidad,
        precio: producto.precio,
        notas: item.notas || undefined,
      });
    }

    // Crear pedido con items en transacción
    const numero = generarNumeroPedido();
    const pedido = await db.pedido.create({
      data: {
        numero,
        nombre: parsed.data.nombre,
        email: parsed.data.email,
        telefono: parsed.data.telefono || undefined,
        notas: parsed.data.notas || undefined,
        total,
        items: { create: validatedItems },
      },
      include: { items: { include: { producto: true } } },
    });

    return NextResponse.json({
      success: true,
      pedido: {
        id: pedido.id,
        numero: pedido.numero,
        total: pedido.total,
        estado: pedido.estado,
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Error creando pedido:", error);
    }
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
