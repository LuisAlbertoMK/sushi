"use client";
// src/components/admin/PublicacionList.tsx
// confidence: high
import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminMutate } from "@/lib/admin-api";

interface Publicacion {
  id: string;
  titulo: string;
  contenido: string | null;
  publicada: boolean;
  fechaPublica: Date | string;
}

interface Props {
  publicaciones: Publicacion[];
}

export function PublicacionList({ publicaciones }: Props) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar publicación?")) return;
    setPendingId(id);
    setErrorId(null);
    setErrorMsg(null);
    const result = await adminMutate(`/api/admin/publicaciones/${id}`, { method: "DELETE" });
    setPendingId(null);
    if (!result.ok) {
      setErrorId(id);
      setErrorMsg(result.error);
      return;
    }
    router.refresh();
  };

  if (publicaciones.length === 0) return <p className="text-muted-foreground">No hay publicaciones.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-muted-foreground border-b">
            <th className="pb-2">Título</th>
            <th className="pb-2">Contenido</th>
            <th className="pb-2">Publicada</th>
            <th className="pb-2">Fecha</th>
            <th className="pb-2 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {publicaciones.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="py-2 font-medium">{p.titulo}</td>
              <td className="py-2 text-muted-foreground max-w-xs truncate">{p.contenido?.slice(0, 50)}...</td>
              <td className="py-2">
                <span className={p.publicada ? "text-green-600" : "text-muted-foreground"}>
                  {p.publicada ? "✓" : "✗"}
                </span>
              </td>
              <td className="py-2 text-muted-foreground text-xs">
                {new Date(p.fechaPublica).toLocaleDateString("es-AR")}
              </td>
              <td className="py-2 text-center">
                <button onClick={() => handleDelete(p.id)} disabled={pendingId === p.id} className="text-red-600 hover:text-red-800 text-xs">🗑️</button>
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
