// src/app/(public)/reservas/page.tsx — Formulario de reservación
// confidence: high
// metadata está en: src/app/(public)/reservas/layout.tsx (server, envuelve cliente)
"use client";
import { useState } from "react";
import { Input, Textarea, Select } from "@/components/ui/Input";

export default function ReservasPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        <h1 className="font-display text-4xl font-bold text-primary-700 mb-2">Reservación de Mesa</h1>
        <p className="text-muted-foreground">Reservá tu mesa y disfrutá de una experiencia única</p>
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
          <Input label="Nombre completo *" name="nombre" type="text" required autoComplete="name" />
          <Input label="Email *" name="email" type="email" required autoComplete="email" />
        </div>

        <Input label="Teléfono *" name="telefono" type="tel" required autoComplete="tel" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Fecha *"
            name="fecha"
            type="date"
            required
            min={new Date().toISOString().split("T")[0]}
          />
          <Select label="Personas *" name="personas" required defaultValue="2">
            <option value="2">2 personas</option>
            <option value="1">1 persona</option>
            <option value="3">3 personas</option>
            <option value="4">4 personas</option>
            <option value="5">5 personas</option>
            <option value="6">6 personas</option>
          </Select>
        </div>

        <Textarea
          label="Notas (opcional)"
          name="notas"
          rows={3}
          placeholder="Ej: terraza, cumpleaños, etc."
        />

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
