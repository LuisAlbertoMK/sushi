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

      <form onSubmit={handleSubmit} className="bg-card rounded-xl shadow-md p-6 space-y-4 border border-border">
        {error && (
          <div role="alert" className="bg-destructive/10 dark:bg-destructive/20 border border-destructive/20 dark:border-destructive/30 text-destructive-600 dark:text-destructive-foreground p-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        {success && (
          <div role="status" aria-live="polite" className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-200 p-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor={`${formId}-nombre`} className="block text-sm font-medium text-foreground mb-1">
              Nombre completo *
            </label>
            <input
              id={`${formId}-nombre`}
              name="nombre"
              type="text"
              required
              autoComplete="name"
className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ring focus:outline-primary-500"
            />
          </div>
          <div>
            <label htmlFor={`${formId}-email`} className="block text-sm font-medium text-foreground mb-1">
              Email *
            </label>
            <input
              id={`${formId}-email`}
              name="email"
              type="email"
              required
              autoComplete="email"
className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ring focus:outline-primary-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor={`${formId}-tel`} className="block text-sm font-medium text-foreground mb-1">
            Teléfono *
          </label>
          <input
            id={`${formId}-tel`}
            name="telefono"
            type="tel"
            required
            autoComplete="tel"
            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ring focus:outline-primary-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor={`${formId}-fecha`} className="block text-sm font-medium text-foreground mb-1">
              Fecha *
            </label>
            <input
              id={`${formId}-fecha`}
              name="fecha"
              type="date"
              required
              min={new Date().toISOString().split("T")[0]}
className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ring focus:outline-primary-500"
            />
          </div>
          <div>
            <label htmlFor={`${formId}-personas`} className="block text-sm font-medium text-foreground mb-1">
              Personas *
            </label>
            <select
              id={`${formId}-personas`}
              name="personas"
              required
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-input text-foreground placeholder:text-gray-500 dark:placeholder:text-gray-400"
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
          <label htmlFor={`${formId}-notas`} className="block text-sm font-medium text-foreground mb-1">
            Notas (opcional)
          </label>
          <textarea
            id={`${formId}-notas`}
            name="notas"
            rows={3}
            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ring focus:outline-primary-500"
            placeholder="Ej: terraza, cumpleaños, etc."
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-700 text-white py-3 rounded-lg font-bold hover:bg-primary-800 transition disabled:cursor-not-allowed disabled:bg-primary-400 disabled:text-white focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {loading ? "Reservando..." : "Confirmar Reserva"}
        </button>
      </form>
    </div>
  );
}
