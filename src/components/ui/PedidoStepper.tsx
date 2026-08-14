// src/components/ui/PedidoStepper.tsx
// confidence: high
// Componente de timeline visual para tracking de pedidos
// 5 estados con OKLCH colores semanticos + dark mode
"use client";

const ESTADOS: { key: string; label: string; emoji: string }[] = [
  { key: "PENDIENTE", label: "En espera", emoji: "⏳" },
  { key: "EN_COCINA", label: "En cocina", emoji: "👨‍🍳" },
  { key: "LISTO", label: "Listo para retirar", emoji: "✅" },
  { key: "ENTREGADO", label: "Entregado", emoji: "🏠" },
  { key: "CANCELADO", label: "Cancelado", emoji: "❌" },
];

interface Props {
  estado: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Mapea un estado del enum PedidoEstado al index del array ESTADOS.
 * CANCELADO es el único estado terminal negativo — se renderiza en rojo.
 */
function getEstadoIndex(estado: string): number {
  const idx = ESTADOS.findIndex((e) => e.key === estado);
  return idx === -1 ? 0 : idx;
}

export function PedidoStepper({ estado, createdAt, updatedAt }: Props) {
  const currentIdx = getEstadoIndex(estado);

  return (
    <div className="w-full py-6">
      <div className="relative flex items-center justify-between">
        {/* Línea de progreso continua */}
        <div
          className="absolute top-5 left-0 right-0 h-0.5 bg-muted-300 dark:bg-muted-600"
          aria-hidden="true"
        />

        {ESTADOS.map((e, idx) => {
          const isActive = idx <= currentIdx;
          const isCurrent = idx === currentIdx;
          const isCancelled = currentIdx === 4; // CANCELADO es el último

          // Color semantic según estado
          let bgClass = "bg-muted-300 dark:bg-muted-600";
          let textClass = "text-muted-foreground";
          let emojiClass = "";

          if (isCancelled && idx === 4) {
            bgClass = "bg-destructive";
            textClass = "text-white";
            emojiClass = "text-white";
          } else if (isActive && !isCancelled) {
            bgClass = "bg-primary-700 dark:bg-primary-500";
            textClass = "text-white";
            emojiClass = "text-white";
          }

          return (
            <div key={e.key} className="relative flex flex-col items-center z-10">
              {/* Círculo estado */}
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center border-2 border-card transition-all ${bgClass} ${emojiClass}`}
                aria-current={isCurrent ? "step" : undefined}
              >
                <span className="text-sm">{e.emoji}</span>
              </div>

              {/* Label */}
              <p
                className={`mt-2 text-xs font-medium text-center transition-colors ${
                  isCurrent && !isCancelled
                    ? "text-primary-700 dark:text-primary-300"
                    : isCancelled && idx === 4
                    ? "text-destructive"
                    : textClass
                }`}
              >
                {e.label}
              </p>

              {/* Timestamps condicionales */}
              {isCurrent && createdAt && (
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {new Date(createdAt).toLocaleTimeString("es-AR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Timestamps footer (updatedAt) */}
      {updatedAt && (
        <p className="text-[11px] text-muted-foreground/80 mt-3 text-center">
          Actualizado:{" "}
          {new Date(updatedAt).toLocaleString("es-AR", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      )}
    </div>
  );
}
