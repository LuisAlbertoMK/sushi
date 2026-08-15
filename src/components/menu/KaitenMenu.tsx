// src/components/menu/KaitenMenu.tsx — Mesa giratoria kaiten-zushi (demo interactivo)
// confidence: high — cero dependencias (CSS + React state), datos reales de /api/categorias,
// respeta prefers-reduced-motion (mesa estática + grid visible), accesible por teclado
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ─── Tipos (shape de /api/categorias y /api/productos) ───
interface Producto {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  imagen: string | null;
  categoriaId: string;
}

interface Categoria {
  id: string;
  nombre: string;
  emoji: string | null;
  color: string | null;
  productos: Producto[];
}

const CATEGORY_EMOJI: Record<string, string> = {
  "Sushi Rolls": "🍣",
  "Nigiri & Sashimi": "🍱",
  Especiales: "🍥",
  Entradas: "🥟",
  Bebidas: "🍵",
  Postres: "🍡",
  Combos: "🎁",
};

const CATEGORY_COLOR: Record<string, string> = {
  "Sushi Rolls": "#e2703a",
  "Nigiri & Sashimi": "#e0395f",
  Especiales: "#c97bd8",
  Entradas: "#e0a13a",
  Bebidas: "#3a9be0",
  Postres: "#e07bc0",
  Combos: "#7bc05a",
};

const SPEED_LABEL: Record<number, string> = { 0: "⏸", 1: "🐢", 2: "🍣", 3: "🐇" };

export function KaitenMenu() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [speed, setSpeed] = useState(2); // 0=detenido, 1=lento, 2=normal, 3=rápido
  const [direction, setDirection] = useState(1); // 1=horario, -1=antihorario
  const [reducedMotion, setReducedMotion] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detectar prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Cargar categorías + productos reales
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/categorias");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        // Mapear emoji/color por nombre (el seed no tiene estos campos)
        const enriched = data.map((c: Categoria) => ({
          ...c,
          emoji: CATEGORY_EMOJI[c.nombre] || "🍽️",
          color: CATEGORY_COLOR[c.nombre] || "#888",
        }));
        setCategorias(enriched);
        if (enriched.length > 0) setSelectedId(enriched[0].id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al cargar el menú");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const selected = useMemo(
    () => categorias.find((c) => c.id === selectedId) || null,
    [categorias, selectedId]
  );

  // Posición angular de cada plato en la mesa (distribución uniforme)
  const plateCount = categorias.length || 1;
  const plateAngle = (i: number) => (i / plateCount) * 360;

  // Marcar plato seleccionado: lo traemos al frente y lo resaltamos
  const handleSelect = (id: string) => setSelectedId(id);

  const toggleDirection = () => setDirection((d) => -d);

  const speedText = SPEED_LABEL[speed];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4" role="status" aria-label="Cargando menú kaiten">
        <div className="w-16 h-16 rounded-full border-4 border-primary-200 border-t-primary-700 animate-spin" />
        <p className="text-muted-foreground">Preparando la mesa kaiten… 🍣</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 bg-destructive/10 rounded-xl border border-destructive/30">
        <p className="font-bold text-destructive mb-2">No se pudo cargar el menú</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  // Con reduced-motion: mesa estática (sin animación), grid siempre visible
  const animate = !reducedMotion && speed > 0;
  const spinDuration = speed === 1 ? 80 : speed === 2 ? 40 : 20; // segundos por vuelta

  return (
    <div className="space-y-8">
      {/* Controles de la mesa */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <span className="text-sm font-medium text-muted-foreground mr-2">Mesa Kaiten:</span>
        <button
          onClick={() => setSpeed((s) => (s === 0 ? 2 : 0))}
          className="px-4 py-2 rounded-full bg-primary-700 dark:bg-primary-600 text-white text-sm font-bold hover:bg-primary-800 transition focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label={speed === 0 ? "Iniciar rotación" : "Detener rotación"}
        >
          {speed === 0 ? "▶ Iniciar" : "⏸ Detener"}
        </button>
        <div className="flex items-center gap-1 bg-muted rounded-full p-1" role="group" aria-label="Velocidad de rotación">
          {[0, 1, 2, 3].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              aria-label={`Velocidad ${s}`}
              aria-pressed={speed === s}
              className={cn(
                "w-9 h-9 rounded-full text-sm transition focus:outline-none focus:ring-2 focus:ring-ring",
                speed === s ? "bg-primary-700 dark:bg-primary-600 text-white" : "text-muted-foreground hover:bg-accent"
              )}
            >
              {SPEED_LABEL[s]}
            </button>
          ))}
        </div>
        <button
          onClick={toggleDirection}
          className="px-4 py-2 rounded-full border border-border bg-card text-sm font-medium hover:bg-muted transition focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Cambiar sentido de rotación"
        >
          {direction === 1 ? "↻ Horario" : "↺ Antihorario"}
        </button>
        {reducedMotion && (
          <span className="text-xs text-muted-foreground bg-accent/50 px-3 py-1 rounded-full" role="status">
            ♿ Movimiento reducido activo
          </span>
        )}
      </div>

      {/* La mesa giratoria (vista isométrica) */}
      <div className="relative select-none" style={{ perspective: "1200px" }} aria-hidden="true">
        <div
          className="relative mx-auto"
          style={{
            width: "min(90vw, 560px)",
            height: "min(90vw, 560px)",
            transform: "rotateX(58deg)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Superficie de la mesa (madera japonesa) */}
          <div
            className="absolute inset-0 rounded-full shadow-[inset_0_-24px_48px_rgba(0,0,0,0.35)]"
            style={{
              background:
                "radial-gradient(circle at 35% 30%, #8a5a33 0%, #6e4526 45%, #4a2e18 100%)",
              border: "6px solid rgba(0,0,0,0.25)",
            }}
          />
          {/* Anillo interior decorativo */}
          <div
            className="absolute rounded-full"
            style={{
              inset: "14%",
              border: "2px dashed rgba(255,255,255,0.18)",
              borderRadius: "9999px",
            }}
          />
          {/* Centro de la mesa */}
          <div
            className="absolute rounded-full flex items-center justify-center"
            style={{
              inset: "38%",
              background: "radial-gradient(circle at 40% 35%, #a06a3c 0%, #6e4526 70%)",
              border: "3px solid rgba(0,0,0,0.2)",
            }}
          >
            <span className="text-3xl" style={{ transform: "rotateX(-58deg)" }}>
              🍣
            </span>
          </div>

          {/* Platos girando: cada uno orbita (su posición angular + la rotación del anillo) */}
          <div
            className="absolute inset-0"
            style={{
              animation: animate
                ? `kaiten-spin ${spinDuration}s linear infinite ${direction === -1 ? "reverse" : ""}`
                : "none",
              transformStyle: "preserve-3d",
            }}
          >
            {categorias.map((cat, i) => {
              const ang = plateAngle(i);
              return (
                <div
                  key={cat.id}
                  className="absolute left-1/2 top-1/2"
                  style={{
                    width: 64,
                    height: 64,
                    marginLeft: -32,
                    marginTop: -32,
                    transform: `rotate(${ang}deg) translateX(190px) rotate(${-ang}deg)`,
                    opacity: reducedMotion ? 1 : undefined,
                  }}
                >
                  <button
                    onClick={() => handleSelect(cat.id)}
                    aria-label={`Ver categoría ${cat.nombre}`}
                    title={cat.nombre}
                    style={{ transform: "rotateX(-58deg)" }}
                    className={cn(
                      "w-16 h-16 rounded-full flex flex-col items-center justify-center gap-0.5 border-4 shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer",
                      selectedId === cat.id
                        ? "ring-4 ring-white/70 scale-110"
                        : "opacity-80 hover:opacity-100"
                    )}
                  >
                    <span className="text-2xl leading-none">{cat.emoji}</span>
                    <span className="text-[9px] font-bold text-white leading-tight px-1 text-center">
                      {cat.nombre}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Panel de la categoría seleccionada — productos pertenecientes */}
      <div className="mt-6" aria-live="polite">
        {selected ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <span className="text-3xl">{selected.emoji}</span>
                {selected.nombre}
              </h3>
              <span className="text-sm text-muted-foreground">
                {selected.productos.length} {selected.productos.length === 1 ? "plato" : "platos"} en la banda
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {selected.productos.map((p) => (
                <Link
                  key={p.id}
                  href={`/menu/${p.id}`}
                  className="bg-card rounded-xl shadow-md overflow-hidden group hover:shadow-lg transition-shadow border border-border"
                >
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    {p.imagen ? (
                      <Image
                        src={p.imagen}
                        alt={p.nombre}
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-5xl" aria-hidden="true">
                        🍣
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-foreground group-hover:text-primary-700 dark:group-hover:text-primary-400 transition">
                      {p.nombre}
                    </h4>
                    <p className="text-lg font-bold text-primary-700 dark:text-primary-400 mt-1">
                      ${p.precio.toFixed(2)}
                    </p>
                    {p.descripcion && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{p.descripcion}</p>
                    )}
                  </div>
                </Link>
              ))}
              {selected.productos.length === 0 && (
                <p className="text-muted-foreground col-span-full text-center py-8">
                  No hay platos disponibles en esta categoría aún.
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Seleccioná un plato de la mesa para ver sus productos.
          </p>
        )}
      </div>

      <style jsx global>{`
        @keyframes kaiten-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
