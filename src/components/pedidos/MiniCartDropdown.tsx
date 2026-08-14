"use client";

// src/components/pedidos/MiniCartDropdown.tsx — Mini carrito dropdown
// confidence: high
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatearPrecio } from "@/lib/utils";
import Image from "next/image";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function MiniCartDropdown({ open, onClose }: Props) {
  const { items, total, removeItem } = useCart();

  if (!open) return null;

  return (
    <div
      className="absolute top-full right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-2xl z-50 animate-in slide-in-from-top-2"
      onMouseLeave={onClose}
    >
      <div className="p-4 border-b border-border">
        <h3 className="font-bold text-lg text-foreground">Tu Carrito ({items.length})</h3>
      </div>

      {items.length === 0 ? (
        <div className="p-6 text-center text-muted-foreground">
          <span className="text-3xl mb-2 block">🛒</span>
          <p className="text-sm">Tu carrito está vacío</p>
        </div>
      ) : (
        <div className="max-h-64 overflow-y-auto">
          {items.map((item) => (
            <div key={item.productoId} className="p-3 flex items-center gap-3 border-b border-border last:border-0">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                {item.imagen ? (
                  <Image src={item.imagen} alt={item.nombre} width={48} height={48} className="object-cover rounded" />
                ) : (
                  <span className="text-xl" aria-hidden="true">🍣</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{item.nombre}</p>
                <p className="text-sm text-muted-foreground">
                  {item.cantidad}x {formatearPrecio(item.precio)} = {formatearPrecio(item.precio * item.cantidad)}
                </p>
              </div>
              <button
                onClick={() => removeItem(item.productoId)}
                className="text-red-500 hover:text-red-700 text-xs font-bold w-5 h-5 flex items-center justify-center rounded hover:bg-red-500/10"
                aria-label={`Eliminar ${item.nombre}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="p-4 border-t border-border">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-muted-foreground">Total:</span>
          <span className="font-bold text-xl text-primary-700 dark:text-primary-300">{formatearPrecio(total)}</span>
        </div>
        <Link
          href="/pedidos"
          onClick={onClose}
          className="block w-full bg-primary-700 dark:bg-primary-600 text-white py-2 rounded-lg font-bold text-center hover:bg-primary-800 dark:hover:bg-primary-500 transition focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Ir a Checkout →
        </Link>
      </div>
    </div>
  );
}
