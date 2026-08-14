// src/app/(admin)/promos/page.tsx — CRUD de promociones y publicaciones
// confidence: high
import { db } from "@/lib/db";
import { PromoForm } from "@/components/admin/PromoForm";
import { PublicacionForm } from "@/components/admin/PublicacionForm";
import { PromoList } from "@/components/admin/PromoList";
import { PublicacionList } from "@/components/admin/PublicacionList";
import { Promocion } from "@prisma/client";

export default async function AdminPromosPage() {
  const [promos, publicaciones] = await Promise.all([
    db.promocion.findMany({ orderBy: { fechaInicio: "desc" } }),
    db.publicacion.findMany({ orderBy: { fechaPublica: "desc" } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">🎁 Promociones & Publicaciones</h1>
        <p className="text-gray-600">Administrá ofertas, cupones y publicaciones</p>
      </div>

      {/* Nueva promoción */}
      <section>
        <h2 className="text-xl font-bold text-foreground mb-3">➕ Nueva promoción</h2>
        <PromoForm />
      </section>

      {/* Lista de promociones */}
      <section>
        <h2 className="text-xl font-bold text-foreground mb-3">📋 Promociones</h2>
        <PromoList promos={promos} />
      </section>

      {/* Nueva publicación */}
      <section className="mt-8">
        <h2 className="text-xl font-bold text-foreground mb-3">➕ Nueva publicación</h2>
        <PublicacionForm />
      </section>

      {/* Lista de publicaciones */}
      <section>
        <h2 className="text-xl font-bold text-foreground mb-3">📋 Publicaciones</h2>
        <PublicacionList publicaciones={publicaciones} />
      </section>
    </div>
  );
}
