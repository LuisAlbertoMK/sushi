"use client";
// src/components/admin/PromoList.tsx
// confidence: high
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatearPrecio } from "@/lib/utils";
import { adminMutate } from "@/lib/admin-api";

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
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar promoción?")) return;
    setPendingId(id);
    setErrorId(null);
    setErrorMsg(null);
    const result = await adminMutate(`/api/admin/promos/${id}`, { method: "DELETE" });
    setPendingId(null);
    if (!result.ok) {
      setErrorId(id);
      setErrorMsg(result.error);
      return;
    }
    router.refresh();
  };

  if (promos.length === 0) return <p className="text-muted-foreground">No hay promociones.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-muted-foreground border-b border-border bg-muted/50">
            <th className="pb-2 pr-2 font-semibold">Título</th>
            <th className="pb-2 pr-2 font-semibold">Tipo</th>
            <th className="pb-2 pr-2 font-semibold">Valor</th>
            <th className="pb-2 pr-2 font-semibold">Vigencia</th>
            <th className="pb-2 pr-2 font-semibold">Activa</th>
            <th className="pb-2 text-center font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {promos.map((p) => (
            <tr key={p.id} className="border-t border-border hover:bg-muted/40 transition-colors">
              <td className="py-2 pr-2 font-medium text-foreground">{p.titulo}</td>
              <td className="py-2 pr-2 text-foreground">{p.tipo}</td>
              <td className="py-2 pr-2 text-foreground">
                {p.tipo === "PORCENTUAL" ? `${p.valor}% OFF` :
                 p.tipo === "MONTO_FIJO" ? `-${formatearPrecio(p.valor || 0)}` :
                 p.tipo === "ENVIO_GRATIS" ? "Envío gratis" : "-"}
              </td>
              <td className="py-2 text-muted-foreground text-xs">
                {new Date(p.fechaInicio).toLocaleDateString("es-AR")} - {new Date(p.fechaFin).toLocaleDateString("es-AR")}
              </td>
              <td className="py-2 pr-2">
                <span className={p.activa ? "text-green-600 dark:text-green-400 font-semibold" : "text-red-600 dark:text-red-400 font-semibold"}>
                  {p.activa ? "✓" : "✗"}
                </span>
              </td>
              <td className="py-2 text-center">
                <button onClick={() => handleDelete(p.id)} disabled={pendingId === p.id} aria-label={`Eliminar promoción ${p.titulo}`} title="Eliminar" className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring text-base">🗑️</button>
                {errorId === p.id && errorMsg && (
                  <span role="alert" className="block text-xs text-destructive-600 dark:text-destructive-foreground">{errorMsg}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
