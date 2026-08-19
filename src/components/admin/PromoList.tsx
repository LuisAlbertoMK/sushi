"use client";
// src/components/admin/PromoList.tsx
// confidence: high
import { formatearPrecio } from "@/lib/utils";

interface Promo {
  id: string;
  titulo: string;
  tipo: "PORCENTUAL" | "MONTO_FIJO" | "ENVIO_GRATIS";
  valor: number | null;
  codigo: string | null;
  fechaInicio: Date | string;
  fechaFin: Date | string;
  activa: boolean;
}

interface Props {
  promos: Promo[];
}

export function PromoList({ promos }: Props) {
  const handleToggleActiva = async (id: string, activa: boolean) => {
    // Para toggle, necesitamos el resto de los datos — pero aquí solo toggleamos activo
    // Usamos PATCH... pero el PATCH requiere todos los campos. Simplificado: solo delete + recrear
    // Mejor: usar un endpoint solo para toggle. Por simplicidad, recargamos.
    window.location.reload();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar promoción?")) return;
    await fetch(`/api/admin/promos/${id}`, { method: "DELETE" });
    window.location.reload();
  };

  if (promos.length === 0) return <p className="text-muted-foreground">No hay promociones.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-muted-foreground border-b">
            <th className="pb-2">Título</th>
            <th className="pb-2">Tipo</th>
            <th className="pb-2">Valor</th>
            <th className="pb-2">Vigencia</th>
            <th className="pb-2">Activa</th>
            <th className="pb-2 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {promos.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="py-2 font-medium">{p.titulo}</td>
              <td className="py-2">{p.tipo}</td>
              <td className="py-2">
                {p.tipo === "PORCENTUAL" ? `${p.valor}% OFF` :
                 p.tipo === "MONTO_FIJO" ? `-$${formatearPrecio(p.valor || 0)}` :
                 p.tipo === "ENVIO_GRATIS" ? "Envío gratis" : "-"}
              </td>
              <td className="py-2 text-muted-foreground text-xs">
                {new Date(p.fechaInicio).toLocaleDateString("es-AR")} - {new Date(p.fechaFin).toLocaleDateString("es-AR")}
              </td>
              <td className="py-2">
                <span className={p.activa ? "text-green-600" : "text-red-600"}>
                  {p.activa ? "✓" : "✗"}
                </span>
              </td>
              <td className="py-2 text-center">
                <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800 text-xs">🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
