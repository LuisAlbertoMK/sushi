// src/lib/cart-context.tsx — Context de carrito de pedidos
// confidence: high
"use client";

import { createContext, useContext, useState, useMemo, ReactNode } from "react";
import { CartItem, ProductoWithCategoria } from "@/lib/types";

interface CartContextType {
  items: CartItem[];
  addItem: (producto: ProductoWithCategoria, cantidad?: number, notas?: string) => void;
  removeItem: (productoId: string) => void;
  updateCantidad: (productoId: string, cantidad: number) => void;
  updateNotas: (productoId: string, notas: string) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (producto: ProductoWithCategoria, cantidad = 1, notas?: string) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productoId === producto.id);
      const qty = existing ? existing.cantidad + cantidad : cantidad;
      if (existing) {
        return prev.map((i) =>
          i.productoId === producto.id
            ? { ...i, cantidad: qty, notas: notas || i.notas }
            : i
        );
      }
      return [...prev, {
        productoId: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: qty,
        imagen: producto.imagen,
        notas,
      }];
    });
  };

  const removeItem = (productoId: string) => {
    setItems((prev) => prev.filter((i) => i.productoId !== productoId));
  };

  const updateCantidad = (productoId: string, cantidad: number) => {
    if (cantidad <= 0) {
      removeItem(productoId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.productoId === productoId ? { ...i, cantidad } : i))
    );
  };

  const updateNotas = (productoId: string, notas: string) => {
    setItems((prev) =>
      prev.map((i) => (i.productoId === productoId ? { ...i, notas } : i))
    );
  };

  const clearCart = () => setItems([]);

  const total = useMemo(() => {
    return items.reduce((sum, i) => sum + i.precio * i.cantidad, 0);
  }, [items]);

  const itemCount = items.reduce((sum, i) => sum + i.cantidad, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateCantidad,
        updateNotas,
        clearCart,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
