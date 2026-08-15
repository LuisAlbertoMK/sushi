// src/components/menu/KaitenMenu.tsx — Mesa giratoria kaiten-zushi (demo interactivo v2)
// confidence: high — CSS 3D puro (perspective + preserve-3d + translateZ), cero dependencias,
// rotación confiable vía keyframes en globals.css, submenú en cinta interactiva,
// respeta prefers-reduced-motion
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

// Tamaño de la mesa (px) — el radio de órbita deriva de esto
const MESA = 520;
const RADIO = 188;

export function KaitenMenu() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [speed, setSpeed] = useState(2); // 0=detenido, 1=lento, 2=normal, 3=rápido
  const [direction, setDirection] = useState(1); // 1=horario, -1=antihorario
  const [reducedMotion, setReducedMotion] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const beltRef = useRef<HTMLDivElement>(null);

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

  const plateCount = categorias.length || 1;
  const plateAngle = (i: number) => (i / plateCount) * 360;

  // Navegación de la cinta (submenú): avanzar/retroceder una card
  const scrollBelt = (dir: number) => {
    beltRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

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

  const animate = !reducedMotion && speed > 0;
  const spinDuration = speed === 1 ? 80 : speed === 2 ? 40 : 20;
  const beltDuration = speed === 1 ? 24 : speed === 2 ? 12 : 6;

  return (
    <div className="space-y-8">
      {/* ── Controles ── */}
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
          onClick={() => setDirection((d) => -d)}
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

      {/* ── La mesa giratoria (vista isométrica con profundidad real) ── */}
      <div
        className="relative select-none overflow-visible"
        style={{ perspective: "800px" }}
        aria-hidden="true"
      >
        <div
          className="relative mx-auto"
          style={{
            width: MESA,
            height: MESA,
            transform: "rotateX(62deg)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Sombra proyectada bajo la mesa */}
          <div
            className="absolute rounded-full"
            style={{
              inset: "-3%",
              background: "rgba(0,0,0,0.35)",
              filter: "blur(28px)",
              transform: "translateZ(-60px)",
            }}
          />

          {/* Canto/espesor de la mesa (madera oscura) */}
          <div
            className="absolute rounded-full"
            style={{
              inset: "-1.5%",
              background: "linear-gradient(180deg, #3a2412 0%, #2a1a0c 100%)",
              transform: "translateZ(-22px)",
            }}
          />

          {/* Banda conveyor exterior: rayas que se deslizan (sensación de movimiento) */}
          <div
            className="absolute rounded-full"
            style={{
              inset: "0%",
              background:
                "repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 28px, rgba(0,0,0,0.06) 28px 56px), radial-gradient(circle at 35% 30%, #7a4e28 0%, #5e3a1c 55%, #4a2a12 100%)",
              animation: animate ? `kaiten-belt ${beltDuration}s linear infinite ${direction === -1 ? "reverse" : ""}` : "none",
              border: "4px solid rgba(0,0,0,0.3)",
              boxShadow: "inset 0 -14px 28px rgba(0,0,0,0.4)",
            }}
          />

          {/* Superficie de la mesa */}
          <div
            className="absolute rounded-full"
            style={{
              inset: "6%",
              background:
                "radial-gradient(circle at 38% 30%, #a06a3c 0%, #7a4e28 45%, #553419 100%)",
              border: "3px solid rgba(0,0,0,0.22)",
              boxShadow: "inset 0 10px 24px rgba(255,255,255,0.08), inset 0 -18px 36px rgba(0,0,0,0.35)",
            }}
          />

          {/* Anillo interior decorativo */}
          <div
            className="absolute rounded-full"
            style={{
              inset: "16%",
              border: "2px dashed rgba(255,255,255,0.15)",
              borderRadius: "9999px",
            }}
          />

          {/* Centro de la mesa (de pie con translateZ) */}
          <div
            className="absolute rounded-full flex items-center justify-center"
            style={{
              inset: "40%",
              background: "radial-gradient(circle at 40% 35%, #b0703e 0%, #6e4526 70%)",
              border: "3px solid rgba(0,0,0,0.25)",
              boxShadow: "inset 0 6px 12px rgba(255,255,255,0.12), 0 10px 20px rgba(0,0,0,0.3)",
              transform: "translateZ(6px)",
            }}
          >
            <span className="text-3xl" style={{ transform: "rotateX(-62deg)" }}>
              🍣
            </span>
          </div>

          {/* Anillo giratorio de platos — keyframe en globals.css (siempre inyectado) */}
          <div
            className="absolute inset-0"
            style={{
              animation: animate ? `kaiten-spin ${spinDuration}s linear infinite ${direction === -1 ? "reverse" : ""}` : "none",
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
                    width: 72,
                    height: 72,
                    marginLeft: -36,
                    marginTop: -36,
                    transform: `rotate(${ang}deg) translateX(${RADIO}px) rotate(${-ang}deg)`,
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* Plato con relieve + sombra proyectada en la mesa */}
                  <button
                    onClick={() => setSelectedId(cat.id)}
                    aria-label={`Ver categoría ${cat.nombre}`}
                    title={cat.nombre}
                    className={cn(
                      "w-[72px] h-[72px] rounded-full flex flex-col items-center justify-center gap-0.5 cursor-pointer",
                      "transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring",
                      selectedId === cat.id ? "ring-4 ring-white/80 scale-110 z-10" : "opacity-90 hover:opacity-100"
                    )}
                    style={{
                      transform: "rotateX(-62deg) translateZ(18px)",
                      background: `radial-gradient(circle at 35% 30%, #fff 0%, #e8e4dd 55%, #c8c2b8 100%)`,
                      border: `4px solid ${cat.color}`,
                      boxShadow: `0 14px 22px rgba(0,0,0,0.45), inset 0 -6px 12px rgba(0,0,0,0.18), inset 0 4px 8px rgba(255,255,255,0.7)`,
                    }}
                  >
                    {/* Sombra proyectada del plato sobre la mesa */}
                    <span
                      className="absolute rounded-full"
                      style={{
                        inset: "-6%",
                        background: "rgba(0,0,0,0.28)",
                        filter: "blur(6px)",
                        transform: "translateZ(-16px)",
                      }}
                      aria-hidden="true"
                    />
                    <span className="text-2xl leading-none">{cat.emoji}</span>
                    <span className="text-[9px] font-bold text-gray-800 leading-tight px-1 text-center">
                      {cat.nombre}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Submenú: cinta con los productos de la categoría seleccionada ── */}
      <div className="mt-4" aria-live="polite">
        {selected ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <span className="text-3xl">{selected.emoji}</span>
                {selected.nombre}
                <span className="text-sm font-normal text-muted-foreground">
                  · {selected.productos.length} {selected.productos.length === 1 ? "plato" : "platos"}
                </span>
              </h3>
              {/* Controles de la cinta (submenú) */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollBelt(-1)}
                  className="w-10 h-10 rounded-full border border-border bg-card text-lg hover:bg-muted transition focus:outline-none focus:ring-2 focus:ring-ring"
                  aria-label="Ver platos anteriores"
                >
                  ←
                </button>
                <button
                  onClick={() => scrollBelt(1)}
                  className="w-10 h-10 rounded-full border border-border bg-card text-lg hover:bg-muted transition focus:outline-none focus:ring-2 focus:ring-ring"
                  aria-label="Ver más platos"
                >
                  →
                </button>
              </div>
            </div>

            {/* Cinta horizontal con scroll-snap + swipe touch nativo */}
            <div
              ref={beltRef}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scroll-smooth"
              style={{ scrollbarWidth: "thin" }}
              role="list"
              aria-label={`Productos de ${selected.nombre}`}
            >
              {selected.productos.map((p) => (
                <Link
                  key={p.id}
                  href={`/menu/${p.id}`}
                  role="listitem"
                  className="snap-start shrink-0 w-64 bg-card rounded-2xl shadow-md overflow-hidden group hover:shadow-xl transition-shadow border border-border"
                >
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    {p.imagen ? (
                      <Image
                        src={p.imagen}
                        alt={p.nombre}
                        fill
                        sizes="256px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-5xl" aria-hidden="true">
                        🍣
                      </span>
                    )}
                    {/* Etiqueta tipo plato kaiten */}
                    <span
                      className="absolute top-2 left-2 w-3 h-3 rounded-full border-2 border-white/70"
                      style={{ background: selected.color || "#888" }}
                      aria-hidden="true"
                    />
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
                <p className="text-muted-foreground w-full text-center py-8">
                  No hay platos disponibles en esta categoría aún.
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Seleccioná un plato de la mesa para ver su submenú.
          </p>
        )}
      </div>
    </div>
  );
}
