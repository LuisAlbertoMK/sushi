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
      className="text-sm text-gray-600 hover:text-red-700 transition-colors"
    >
      ← Cerrar sesión
    </button>
  );
}
