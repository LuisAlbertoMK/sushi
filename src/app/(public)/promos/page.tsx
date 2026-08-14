// src/app/(public)/promos/page.tsx — Publicaciones y promociones públicas
// confidence: high
import { db } from "@/lib/db";
import { formatearPrecio } from "@/lib/utils";

async function getData() {
  const now = new Date();
  const promos = await db.promocion.findMany({
    where: {
      activa: true,
      fechaInicio: { lte: now },
      fechaFin: { gte: now },
    },
    orderBy: { fechaInicio: "desc" },
  });
  const publicaciones = await db.publicacion.findMany({
    where: { publicada: true },
    orderBy: { fechaPublica: "desc" },
    take: 10,
  });
  return { promos, publicaciones };
}

export default async function PromosPage() {
  const { promos, publicaciones } = await getData();
  const now = new Date();

  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-700 mb-2">🎁 Promociones &amp; Novedades</h1>
        <p className="text-gray-600">No te perdás nuestras ofertas y publicaciones</p>
      </div>

      {/* Promociones activas */}
      {promos.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🔥 Promociones activas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promos.map((p) => (
              <div key={p.id} className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl shadow-md p-6 border-2 border-red-200">
                <h3 className="text-xl font-bold text-red-700 mb-2">{p.titulo}</h3>
                {p.descripcion && <p className="text-gray-600 mb-3">{p.descripcion}</p>}
                {p.tipo === "PORCENTUAL" && p.valor && (
                  <p className="text-3xl font-bold text-green-600">{p.valor}% OFF</p>
                )}
                {p.tipo === "MONTO_FIJO" && p.valor && (
                  <p className="text-3xl font-bold text-green-600">-${formatearPrecio(p.valor)}</p>
                )}
                {p.tipo === "ENVIO_GRATIS" && (
                  <p className="text-3xl font-bold text-green-600">🚚 Envío Gratis</p>
                )}
                {p.codigo && (
                  <span className="inline-block bg-red-700 text-white text-xs px-2 py-1 rounded mt-2 font-mono">
                    Código: {p.codigo}
                  </span>
                )}
                <p className="text-xs text-gray-600 mt-3">
                  Vigente hasta: {new Date(p.fechaFin).toLocaleDateString("es-AR")}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Publicaciones */}
      {publicaciones.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📰 Novedades</h2>
          <div className="space-y-6">
            {publicaciones.map((pub) => (
              <article key={pub.id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-800">{pub.titulo}</h3>
                  <span className="text-xs text-gray-600">
                    {new Date(pub.fechaPublica).toLocaleDateString("es-AR")}
                  </span>
                </div>
                {pub.contenido && (
                  <p className="text-gray-600 leading-relaxed">{pub.contenido}</p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {promos.length === 0 && publicaciones.length === 0 && (
        <p className="text-center text-gray-600 py-12">
          Pronto novedades y promociones 💫
        </p>
      )}
    </div>
  );
}
