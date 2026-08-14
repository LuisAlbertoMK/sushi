// src/app/admin/layout.tsx — Layout del panel admin (protegido via server component)
// confidence: high
//
// Auth check hecho en el SERVER (getSession) → compatible con Node crypto (no Edge).
// /admin/login tiene su propioo layout (login/layout.tsx) que no extiende este,
// por lo que no hay redirect loop.
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminLogout } from "@/components/admin/AdminLogout";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6 min-h-screen">
        <div className="flex items-center gap-2 mb-8">
          <span className="text-2xl">🍣</span>
          <span className="font-bold text-xl">Sushi Admin</span>
        </div>
        <nav className="space-y-1">
          <Link href="/admin/dashboard" className="block py-2 px-3 rounded hover:bg-red-700/20 transition-colors">📊 Dashboard</Link>
          <Link href="/admin/menu" className="block py-2 px-3 rounded hover:bg-red-700/20 transition-colors">🍱 Menú</Link>
          <Link href="/admin/pedidos" className="block py-2 px-3 rounded hover:bg-red-700/20 transition-colors">🛒 Pedidos</Link>
          <Link href="/admin/reservas" className="block py-2 px-3 rounded hover:bg-red-700/20 transition-colors">📅 Reservas</Link>
          <Link href="/admin/promos" className="block py-2 px-3 rounded hover:bg-red-700/20 transition-colors">🎁 Promos & Publicaciones</Link>
        </nav>
        <div className="mt-8 pt-4 border-t border-gray-700">
          <AdminLogout />
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Panel de Administración</h1>
        </header>
        {children}
      </main>
    </div>
  );
}

