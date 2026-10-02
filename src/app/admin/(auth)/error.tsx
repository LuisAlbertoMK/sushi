"use client";

// src/app/admin/(auth)/error.tsx — Error boundary del panel admin
// confidence: high
// Sin este boundary, un fallo de render mostraba la pantalla por defecto del
// framework (o un frame vacío) delante del cliente.
import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin render error:", error);
  }, [error]);

  return (
    <div className="max-w-xl bg-card border border-border rounded-xl shadow-md p-6 space-y-4">
      <div role="alert" className="space-y-2">
        <h1 className="text-xl font-bold text-foreground">No pudimos cargar esta sección</h1>
        <p className="text-sm text-muted-foreground">
          Ocurrió un error al leer los datos del panel. Podés reintentar; si persiste, revisá la
          base de datos o los logs del servidor.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground/80">Referencia: {error.digest}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={reset}
          className="bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-800 transition focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Reintentar
        </button>
        <a
          href="/admin/dashboard"
          className="border border-border text-foreground px-4 py-2 rounded-lg font-semibold hover:bg-muted transition focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Volver al dashboard
        </a>
      </div>
    </div>
  );
}
