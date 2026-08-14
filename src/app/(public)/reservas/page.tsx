// src/app/(public)/reservas/page.tsx — Formulario de reservación
// confidence: high
// metadata está en: src/app/(public)/reservas/layout.tsx (server, envuelve cliente)
"use client";
import { useState, useId } from "react";

export default function ReservasPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const formId = useId();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const form = e.currentTarget;
    const data = new FormData(form);

    const fecha = new Date(data.get("fecha") as string);
    if (isNaN(fecha.getTime())) {
      setError("La fecha no es válida");
      setLoading(false);
      return;
    }
    if (fecha < new Date(Date.now() - 60000)) {
      setError("No podés reservar en el pasado");
      setLoading(false);
      return;
    }

    const payload = {
      nombre: data.get("nombre") as string,
      email: data.get("email") as string,
      telefono: data.get("telefono") as string,
      fecha: fecha.toISOString(),
      personas: parseInt(data.get("personas") as string, 10),
      notas: (data.get("notas") as string) || undefined,
    };

    try {
      const res = await fetch("/api/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(`Reserva confirmada para el ${fecha.toLocaleDateString("es-AR")} a las ${fecha.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })} para ${payload.personas} personas.`);
        form.reset();
      }
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <span className="text-5xl mb-2 block" aria-hidden="true">📅</span>
        <h1 className="text-4xl font-bold text-red-700 mb-2">Reservación de Mesa</h1>
        <p className="text-gray-600">Reservá tu mesa y disfrutá de una experiencia única</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-4">
        {error && (
          <div role="alert" className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        {success && (
          <div role="status" aria-live="polite" className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm">
            {success}
          </div>
        )}

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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:outline-red-700"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:outline-red-700"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:outline-red-700"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor={`${formId}-fecha`} className="block text-sm font-medium text-gray-700 mb-1">
              Fecha *
            </label>
            <input
              id={`${formId}-fecha`}
              name="fecha"
              type="date"
              required
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:outline-red-700"
            />
          </div>
          <div>
            <label htmlFor={`${formId}-personas`} className="block text-sm font-medium text-gray-700 mb-1">
              Personas *
            </label>
            <select
              id={`${formId}-personas`}
              name="personas"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white focus:outline-red-700"
            >
              <option value="2">2 personas</option>
              <option value="1">1 persona</option>
              <option value="3">3 personas</option>
              <option value="4">4 personas</option>
              <option value="5">5 personas</option>
              <option value="6">6 personas</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor={`${formId}-notas`} className="block text-sm font-medium text-gray-700 mb-1">
            Notas (opcional)
          </label>
          <textarea
            id={`${formId}-notas`}
            name="notas"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:outline-red-700"
            placeholder="Ej: terraza, cumpleaños, etc."
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-700 text-white py-3 rounded-lg font-bold hover:bg-red-800 transition disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          {loading ? "Reservando..." : "Confirmar Reserva"}
        </button>
      </form>
    </div>
  );
}
