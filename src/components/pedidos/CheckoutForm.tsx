// src/components/pedidos/CheckoutForm.tsx
// confidence: high
"use client";
import { useCart } from "@/lib/cart-context";
import { formatearPrecio } from "@/lib/utils";
import { useState, useId } from "react";
import { useRouter } from "next/navigation";
import { CartItem } from "@/lib/types";

interface Props {
  items: CartItem[];
  total: number;
  onCancel: () => void;
}

export function CheckoutForm({ items, total, onCancel }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const formId = useId();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const form = e.currentTarget;
    const data = new FormData(form);

    const pedido = {
      nombre: data.get("nombre") as string,
      email: data.get("email") as string,
      telefono: data.get("telefono") as string,
      notas: (data.get("notas") as string) || undefined,
      items: items.map((i) => ({
        productoId: i.productoId,
        cantidad: i.cantidad,
        precio: i.precio,
        notas: i.notas || undefined,
      })),
    };

    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedido),
      });
      const result = await res.json();

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(`¡Pedido ${result.pedido.numero} creado!`);
        setTimeout(() => {
          router.push(`/pedidos/track?numero=${result.pedido.numero}`);
        }, 1500);
      }
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-red-700 mb-6">💳 Checkout</h2>

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <p className="font-medium">Resumen del pedido:</p>
        <ul className="text-sm text-gray-600 mt-2 space-y-1">
          {items.map((i) => (
            <li key={i.productoId}>{i.cantidad}x {i.nombre} — {formatearPrecio(i.precio * i.cantidad)}</li>
          ))}
        </ul>
        <p className="font-bold text-lg mt-2">TOTAL: {formatearPrecio(total)}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-md">
        {error && <div role="alert" className="text-red-600 bg-red-50 p-3 rounded">{error}</div>}
        {success && <div role="status" aria-live="polite" className="text-green-600 bg-green-50 p-3 rounded">{success}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor={`${formId}-nombre`} className="block text-sm font-medium text-gray-700 mb-1">
              Nombre completo *
            </label>
            <input
              id={`${formId}-nombre`}
              name="nombre"
              type="text"
              required
              autoComplete="name"
              className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:outline-red-700"
            />
          </div>
          <div>
            <label htmlFor={`${formId}-email`} className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              id={`${formId}-email`}
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:outline-red-700"
            />
          </div>
        </div>

        <div>
          <label htmlFor={`${formId}-tel`} className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono *
          </label>
          <input
            id={`${formId}-tel`}
            name="telefono"
            type="tel"
            required
            autoComplete="tel"
            className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:outline-red-700"
          />
        </div>

        <div>
          <label htmlFor={`${formId}-notas`} className="block text-sm font-medium text-gray-700 mb-1">
            Notas (opcional)
          </label>
          <textarea
            id={`${formId}-notas`}
            name="notas"
            rows={3}
            className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:outline-red-700"
            placeholder="Ej: sin wasabi, por favor"
          ></textarea>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-300 transition focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            ← Volver al carrito
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-red-700 text-white py-3 rounded-lg font-bold hover:bg-red-800 transition disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {loading ? "Procesando..." : "Confirmar Pedido"}
          </button>
        </div>
      </form>
    </div>
  );
}
