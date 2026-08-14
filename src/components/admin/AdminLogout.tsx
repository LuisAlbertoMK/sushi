// src/components/admin/AdminLogout.tsx — Botón de logout (cliente)
// confidence: high
"use client";
import { useRouter } from "next/navigation";

export function AdminLogout() {
  const router = useRouter();

  const handleLogout = async () => {
    const res = await fetch("/api/auth/logout", { method: "POST" });
    if (res.ok) {
      router.push("/admin/login");
      router.refresh();
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-muted-foreground hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
    >
      ← Cerrar sesión
    </button>
  );
}
