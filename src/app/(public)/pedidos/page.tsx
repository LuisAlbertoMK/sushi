"use client";
// src/app/(public)/pedidos/page.tsx — Página de carrito de pedidos
// confidence: high
import { useCart } from "@/lib/cart-context";
import { formatearPrecio } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { CheckoutForm } from "@/components/pedidos/CheckoutForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { useState } from "react";

// Emojis/inline en lugar de lucide-react (no instalado)
function TrashIcon() {
  return <span className="text-red-500">🗑️</span>;
}
function PlusIcon() {
  return <span>➕</span>;
}
function MinusIcon() {
  return <span>➖</span>;
}

export default function PedidosPage() {
  const { items, removeItem, updateCantidad, total, clearCart } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);

  if (items.length === 0) {
    return (
      <EmptyState
        type="cart"
        className="min-h-[400px]"
      />
    );
  }

  if (showCheckout) {
    return <CheckoutForm items={items} total={total} onCancel={() => setShowCheckout(false)} />;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-primary-700 dark:text-primary-300 mb-6">🛒 Tu Carrito</h1>
      <div className="bg-card rounded-xl shadow-md overflow-hidden border border-border">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-4">Producto</th>
              <th className="text-center p-4">Cant.</th>
              <th className="text-right p-4">Precio</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.productoId} className="border-t">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                  {item.imagen ? (
                    <Image
                      src={item.imagen}
                      alt={item.nombre}
                      width={48}
                      height={48}
                      className="rounded object-cover"
                    />
                  ) : <span className="text-3xl" aria-hidden="true">🍣</span>}
                    <div>
                      <span className="font-medium">{item.nombre}</span>
                      {item.notas && <p className="text-xs text-gray-600">Nota: {item.notas}</p>}
                    </div>
                  </div>
                </td>
                <td className="text-center p-4">
                  <div className="flex justify-center items-center gap-1">
                    <button
                      onClick={() => updateCantidad(item.productoId, item.cantidad - 1)}
                      className="w-6 h-6 rounded bg-border hover:bg-accent flex items-center justify-center text-foreground"
                    >
                      <MinusIcon />
                    </button>
                    <span className="w-6 text-center">{item.cantidad}</span>
                    <button
                      onClick={() => updateCantidad(item.productoId, item.cantidad + 1)}
                      className="w-6 h-6 rounded bg-border hover:bg-accent flex items-center justify-center text-foreground"
                    >
                      <PlusIcon />
                    </button>
                  </div>
                </td>
                <td className="text-right p-4 font-bold">{formatearPrecio(item.precio * item.cantidad)}</td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => removeItem(item.productoId)}
                    className="hover:text-primary-700"
                  >
                    <TrashIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t p-4 flex justify-between items-center">
          <span className="text-lg font-bold">Total:</span>
          <span className="text-2xl font-bold text-primary-700">{formatearPrecio(total)}</span>
        </div>
      </div>
      <div className="mt-6 flex gap-4 justify-between">
        <button
          onClick={clearCart}
          className="text-gray-600 hover:text-primary-700"
        >
          Vaciar carrito
        </button>
        <button
          onClick={() => setShowCheckout(true)}
          className="bg-primary-700 dark:bg-primary-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-800 dark:hover:bg-primary-500 transition focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Continuar → Checkout
        </button>
      </div>
    </div>
  );
}
