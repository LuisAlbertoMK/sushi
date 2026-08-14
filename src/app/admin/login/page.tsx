// src/app/admin/login/page.tsx — Login de administrador
// confidence: high
"use client";
import { useState, useId } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const formId = useId();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const email = form.email.value;
    const password = form.password.value;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl") || "/admin/dashboard";
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="bg-card rounded-2xl shadow-2xl p-8 w-full max-w-md border border-border">
        <div className="text-center mb-8">
          <span className="text-5xl" aria-hidden="true">🍣</span>
          <h1 className="text-2xl font-bold text-primary-700 dark:text-primary-300 mt-2">Admin Login</h1>
          <p className="text-muted-foreground text-sm">Panel de administración Sushi Bar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div role="alert" className="bg-destructive/10 dark:bg-destructive/20 border border-destructive/20 dark:border-destructive/30 text-destructive-600 dark:text-destructive-foreground p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor={`${formId}-email`} className="block text-sm font-medium text-foreground mb-1">
              Email
            </label>
            <input
              id={`${formId}-email`}
              name="email"
              type="email"
              required
              autoComplete="username"
              defaultValue="admin@sushi.local"
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-input text-foreground"
            />
          </div>

          <div>
            <label htmlFor={`${formId}-password`} className="block text-sm font-medium text-foreground mb-1">
              Contraseña
            </label>
            <input
              id={`${formId}-password`}
              name="password"
              type="password"
              required
              autoComplete="current-password"
              defaultValue="admin123"
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-input text-foreground"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-700 text-white py-3 rounded-lg font-bold hover:bg-primary-800 transition disabled:cursor-not-allowed disabled:bg-primary-400 disabled:text-white focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
