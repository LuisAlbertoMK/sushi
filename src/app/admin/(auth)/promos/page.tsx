// src/app/(admin)/promos/page.tsx — CRUD de promociones y publicaciones
// confidence: high
import { db } from "@/lib/db";
import { PromoForm } from "@/components/admin/PromoForm";
import { PublicacionForm } from "@/components/admin/PublicacionForm";
import { PromoList } from "@/components/admin/PromoList";
import { PublicacionList } from "@/components/admin/PublicacionList";

export default async function AdminPromosPage() {
  const [promos, publicaciones] = await Promise.all([
    db.promocion.findMany({ orderBy: { fechaInicio: "desc" } }),
    db.publicacion.findMany({ orderBy: { fechaPublica: "desc" } }),
  ]);

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Promociones & Publicaciones</h1>
        <p className="text-muted-foreground">Administrá ofertas, cupones y publicaciones</p>
      </div>

      {/* Nueva promoción */}
      <section>
        <h2 className="text-xl font-bold text-foreground mb-3">Nueva promoción</h2>
        <PromoForm />
      </section>

      {/* Lista de promociones */}
      <section>
        <h2 className="text-xl font-bold text-foreground mb-3">Promociones</h2>
        <div className="bg-card border border-border rounded-xl shadow-md p-4 overflow-hidden">
          <PromoList promos={promos} />
        </div>
      </section>

      {/* Nueva publicación */}
      <section className="mt-8">
        <h2 className="text-xl font-bold text-foreground mb-3">Nueva publicación</h2>
        <PublicacionForm />
      </section>

      {/* Lista de publicaciones */}
      <section>
        <h2 className="text-xl font-bold text-foreground mb-3">Publicaciones</h2>
        <div className="bg-card border border-border rounded-xl shadow-md p-4 overflow-hidden">
          <PublicacionList publicaciones={publicaciones} />
        </div>
      </section>
    </div>
  );
}
