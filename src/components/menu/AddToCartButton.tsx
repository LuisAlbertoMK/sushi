// src/components/menu/AddToCartButton.tsx
// confidence: high
// Botón "Agregar al carrito" — Client Component (necesario: el padre es Server Component)
// Usa el CartContext real (no fetch a /api/cart/add que no existe)
"use client";

import { useCart } from "@/lib/cart-context";

interface Props {
  producto: {
    id: string;
    nombre: string;
    precio: number;
    imagen: string | null;
    descripcion: string | null;
  };
}

export function AddToCartButton({ producto }: Props) {
  const { addItem } = useCart();

  const handleAdd = () => {
    addItem({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: producto.imagen,
      descripcion: producto.descripcion,
    } as any);
  };

  return (
    <button
      onClick={handleAdd}
      className="mt-6 w-full bg-primary-700 dark:bg-primary-600 text-white py-3 rounded-lg font-bold hover:bg-primary-800 dark:hover:bg-primary-500 transition focus:outline-none focus:ring-2 focus:ring-ring"
    >
      🛒 Agregar al carrito
    </button>
  );
}