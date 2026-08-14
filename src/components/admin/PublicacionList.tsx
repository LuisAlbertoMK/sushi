"use client";
// src/components/admin/PublicacionList.tsx
// confidence: high

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
  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar publicación?")) return;
    await fetch(`/api/admin/publicaciones/${id}`, { method: "DELETE" });
    window.location.reload();
  };

  if (publicaciones.length === 0) return <p className="text-gray-500">No hay publicaciones.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b">
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
              <td className="py-2 text-gray-500 max-w-xs truncate">{p.contenido?.slice(0, 50)}...</td>
              <td className="py-2">
                <span className={p.publicada ? "text-green-600" : "text-gray-500"}>
                  {p.publicada ? "✓" : "✗"}
                </span>
              </td>
              <td className="py-2 text-gray-500 text-xs">
                {new Date(p.fechaPublica).toLocaleDateString("es-AR")}
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
