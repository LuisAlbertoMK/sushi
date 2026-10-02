// src/app/admin/(auth)/loading.tsx — Estado de carga del panel admin
// confidence: high
export default function AdminLoading() {
  return (
    <div className="space-y-6 max-w-6xl" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Cargando panel…</span>

      <div className="space-y-2">
        <div className="h-8 w-56 rounded-lg bg-muted animate-pulse" />
        <div className="h-4 w-40 rounded bg-muted/70 animate-pulse" />
      </div>

      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-6 space-y-3">
            <div className="h-5 w-44 rounded bg-muted animate-pulse" />
            <div className="h-3 w-72 rounded bg-muted/70 animate-pulse" />
            <div className="h-3 w-full rounded bg-muted/60 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
