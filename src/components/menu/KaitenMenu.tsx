// src/components/menu/KaitenMenu.tsx — Mesa giratoria kaiten-zushi (port de docs/ejemplos/kaiten_menu.html)
// confidence: high — órbita elíptica con drag físico + inercia, profundidad simulada (escala/zIndex),
// cinta transportadora en loop infinito con tiers de precio, bandeja de pedido conectada al carrito real.
// Datos REALES de /api/categorias. Respeta prefers-reduced-motion.
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/lib/cart-context";
import type { ProductoWithCategoria } from "@/lib/types";

// ─── Tipos (shape de /api/categorias) ───
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

// ─── Tema (paleta del ejemplo de referencia) ───
const THEME = {
  bg: "#12151a",
  bg2: "#1a1e25",
  wood1: "#4a3222",
  wood2: "#6b4a30",
  wood3: "#2e2015",
  red: "#b7302c",
  gold: "#c9a15a",
  cream: "#efe4cf",
  ink: "#ece5d6",
  muted: "#9aa0ab",
  tierGreen: "#4f7c6b",
  tierYellow: "#c9962f",
  tierRed: "#b7302c",
  tierSilver: "#8892a6",
  tierGold: "#1c1a16",
};

const CATEGORY_EMOJI: Record<string, string> = {
  "Sushi Rolls": "🍣",
  "Nigiri & Sashimi": "🍱",
  Especiales: "🍥",
  Entradas: "🥟",
  Bebidas: "🍵",
  Postres: "🍡",
  Combos: "🎁",
};

// Tier de precio por color (referencia adaptada a precios USD del menú real)
function tierFor(price: number): { name: string; color: string; border: string } {
  if (price <= 5) return { name: "verde", color: THEME.tierGreen, border: THEME.tierGreen };
  if (price <= 8) return { name: "amarillo", color: THEME.tierYellow, border: THEME.tierYellow };
  if (price <= 12) return { name: "rojo", color: THEME.tierRed, border: THEME.tierRed };
  if (price <= 18) return { name: "plata", color: THEME.tierSilver, border: THEME.tierSilver };
  return { name: "oro", color: THEME.tierGold, border: THEME.gold };
}

function fmt(n: number): string {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

// ─── Geometría de la órbita elíptica ───
interface Geo {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  plateHalf: number;
}

export function KaitenMenu() {
  const { items, addItem, removeItem, updateCantidad, clearCart, total, itemCount } = useCart();

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [view, setView] = useState<"wheel" | "belt">("wheel");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(4); // 0..10 (referencia: 4 = ritmo calmado)
  const [hoverPaused, setHoverPaused] = useState(false);
  const [trayOpen, setTrayOpen] = useState(false);
  const [pulsingId, setPulsingId] = useState<string | null>(null);

  const wheelWrapRef = useRef<HTMLDivElement>(null);
  const plateElsRef = useRef<Map<string, HTMLButtonElement>>(new Map());
  const beltTrackRef = useRef<HTMLDivElement>(null);
  const geoRef = useRef<Geo>({ cx: 0, cy: 0, rx: 0, ry: 0, plateHalf: 36 });
  const angleRef = useRef(0);
  const velocityRef = useRef(0);
  const dragRef = useRef({
    isDragging: false,
    startAngle: 0,
    startCurrent: 0,
    lastAngle: 0,
    lastTime: 0,
    pStartX: 0,
    pStartY: 0,
    pStartTime: 0,
  });

  // Detectar prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    setPlaying(!mq.matches);
    const handler = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
      setPlaying(!e.matches);
    };
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
          color: c.color || THEME.gold,
        }));
        setCategorias(enriched);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al cargar el menú");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Ángulos base de los platos (distribución uniforme)
  const baseAngles = useMemo(
    () => categorias.map((_, i) => -90 + (360 / Math.max(categorias.length, 1)) * i),
    [categorias]
  );

  const selected = useMemo(
    () => categorias.find((c) => c.id === selectedId) || null,
    [categorias, selectedId]
  );

  // ─── Geometría de la mesa (elipse) ───
  // deps: [categorias.length] — debe recalcularse cuando el DOM del wheel-wrap existe
  // (tras cargar datos). Con [] corría durante loading (ref null) y rx/ry quedaban en 0.
  useEffect(() => {
    const updateGeometry = () => {
      const el = wheelWrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      geoRef.current = {
        cx: r.width / 2,
        cy: r.height / 2,
        rx: (r.width / 2) * 0.78,
        ry: (r.height / 2) * 0.72,
        plateHalf: 36,
      };
    };
    updateGeometry();
    window.addEventListener("resize", updateGeometry);
    return () => window.removeEventListener("resize", updateGeometry);
  }, [categorias.length]);

  // Posicionar platos según ángulo (profundidad simulada: escala + zIndex)
  const updatePlates = () => {
    const geo = geoRef.current;
    categorias.forEach((cat, i) => {
      const el = plateElsRef.current.get(cat.id);
      if (!el || !geo.rx) return;
      const a = ((baseAngles[i] + angleRef.current) * Math.PI) / 180;
      const x = geo.cx + geo.rx * Math.cos(a) - geo.plateHalf;
      const y = geo.cy + geo.ry * Math.sin(a) - geo.plateHalf;
      const depth = (Math.sin(a) + 1) / 2; // 0 atrás .. 1 al frente
      const scale = 0.82 + 0.28 * depth;
      el.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
      el.style.zIndex = String(Math.round(depth * 100) + 1);
    });
  };

  // ─── Bucle de animación (solo en vista mesa) ───
  useEffect(() => {
    if (view !== "wheel" || categorias.length === 0) return;
    let raf = 0;
    let last = performance.now();
    const autoSpeed = speed * 6; // deg/sec (referencia)
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const d = dragRef.current;
      if (!d.isDragging) {
        if (Math.abs(velocityRef.current) > 2) {
          angleRef.current += velocityRef.current * dt;
          velocityRef.current *= Math.pow(0.05, dt); // inercia con decaimiento
        } else {
          velocityRef.current = 0;
          if (playing) angleRef.current += autoSpeed * dt;
        }
      }
      updatePlates();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, playing, speed, categorias.length, baseAngles]);

  // ─── Drag para girar la mesa ───
  const pointerAngleDeg = (clientX: number, clientY: number) => {
    const el = wheelWrapRef.current;
    const geo = geoRef.current;
    if (!el || !geo.rx) return 0;
    const r = el.getBoundingClientRect();
    const lx = clientX - r.left - geo.cx;
    const ly = clientY - r.top - geo.cy;
    const ny = ly / ((geo.ry || 1) / geo.rx);
    return (Math.atan2(ny, lx) * 180) / Math.PI;
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = wheelWrapRef.current;
    if (!el) return;
    el.setPointerCapture(e.pointerId);
    const d = dragRef.current;
    d.isDragging = true;
    velocityRef.current = 0;
    d.startAngle = pointerAngleDeg(e.clientX, e.clientY);
    d.startCurrent = angleRef.current;
    d.lastAngle = d.startAngle;
    d.lastTime = performance.now();
    d.pStartX = e.clientX;
    d.pStartY = e.clientY;
    d.pStartTime = Date.now();
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d.isDragging) return;
    const now = performance.now();
    const ang = pointerAngleDeg(e.clientX, e.clientY);
    let delta = ang - d.startAngle;
    while (delta > 180) delta -= 360;
    while (delta < -180) delta += 360;
    angleRef.current = d.startCurrent + delta;
    const dt = Math.max(1, now - d.lastTime);
    let instDelta = ang - d.lastAngle;
    while (instDelta > 180) instDelta -= 360;
    while (instDelta < -180) instDelta += 360;
    velocityRef.current = instDelta / (dt / 1000);
    d.lastAngle = ang;
    d.lastTime = now;
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d.isDragging) return;
    d.isDragging = false;
    const dist = Math.hypot(e.clientX - d.pStartX, e.clientY - d.pStartY);
    const dur = Date.now() - d.pStartTime;
    if (dist < 6 && dur < 350) {
      // fue un tap (no arrastre): elegir el plato tocado
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const plate = el && el.closest ? el.closest("[data-cat-key]") : null;
      if (plate instanceof HTMLElement && plate.dataset.catKey) {
        velocityRef.current = 0;
        selectCategory(plate.dataset.catKey);
      }
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      angleRef.current -= 15;
      velocityRef.current = 0;
      e.preventDefault();
    } else if (e.key === "ArrowRight") {
      angleRef.current += 15;
      velocityRef.current = 0;
      e.preventDefault();
    } else if (e.key === "Enter" || e.key === " ") {
      // elegir el plato más cercano al frente (ángulo 90°)
      let best = 1e9;
      let frontIdx = 0;
      categorias.forEach((_, i) => {
        const a = ((baseAngles[i] + angleRef.current) % 360 + 360) % 360;
        const dist = Math.min(Math.abs(a - 90), 360 - Math.abs(a - 90));
        if (dist < best) {
          best = dist;
          frontIdx = i;
        }
      });
      if (categorias[frontIdx]) selectCategory(categorias[frontIdx].id);
      e.preventDefault();
    }
  };

  // ─── Vista cinta (conveyor) ───
  const selectCategory = (id: string) => {
    setSelectedId(id);
    setView("belt");
  };

  const goBack = () => setView("wheel");

  // Duración del loop de la cinta según cantidad de items y velocidad
  const beltDuration = useMemo(() => {
    if (!selected) return 18;
    const speedMult = 0.4 + speed * 0.16; // 0.4x .. 2.0x
    return Math.max(4, (selected.productos.length * 3.4) / speedMult);
  }, [selected, speed]);

  const beltRunning = playing && !hoverPaused && !reducedMotion;

  // Aplicar duración dinámica a la cinta
  useEffect(() => {
    if (beltTrackRef.current) beltTrackRef.current.style.animationDuration = `${beltDuration}s`;
  }, [beltDuration]);

  // ─── Tomar un platillo (agregar al carrito real) ───
  const takeItem = (p: Producto) => {
    const cartProduct = { ...p, categoria: { id: p.categoriaId } } as unknown as ProductoWithCategoria;
    addItem(cartProduct);
    setPulsingId(p.id);
    window.setTimeout(() => setPulsingId((cur) => (cur === p.id ? null : cur)), 600);
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

  return (
    <div
      className="relative rounded-3xl border kaiten-stage"
      style={{ background: THEME.bg, borderColor: "#232830", color: THEME.ink }}
    >
      {/* Glow superior */}
      <div
        className="absolute inset-x-0 top-0 h-40 pointer-events-none rounded-t-3xl"
        style={{ background: "radial-gradient(ellipse at 50% -10%, rgba(35,40,48,0.6) 0%, transparent 60%)" }}
        aria-hidden="true"
      />

      {/* ── Header ── */}
      <header className="relative text-center pt-7 pb-1 px-4 max-w-[560px] mx-auto">
        <div
          className="inline-flex items-center justify-center w-11 h-11 rounded-full border-2"
          style={{ background: THEME.red, borderColor: "#7d1e1b", color: THEME.cream, boxShadow: "0 2px 6px rgba(0,0,0,.4)" }}
          aria-hidden="true"
        >
          <span className="text-[22px] leading-none" style={{ fontFamily: "Georgia, 'Hiragino Mincho ProN', serif" }}>
            鮨
          </span>
        </div>
        <h2
          className="text-2xl font-bold mt-2 mb-1 tracking-wide"
          style={{ color: THEME.cream, fontFamily: "Georgia, 'Hiragino Mincho ProN', serif" }}
        >
          廻る寿司 · Menú Kaiten
        </h2>
        <p className="text-[13.5px] m-0" style={{ color: THEME.muted }}>
          Arrastrá la mesa para girar · tocá un plato para elegir · tocá un platillo para pedirlo
        </p>
      </header>

      {/* ── Vista: mesa giratoria ── */}
      {view === "wheel" && (
        <section className="relative px-4">
          <div
            ref={wheelWrapRef}
            tabIndex={0}
            aria-label="Mesa giratoria de categorías. Flechas para girar, Enter para elegir el platillo al frente."
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onKeyDown={onKeyDown}
            className="relative mx-auto outline-none cursor-grab active:cursor-grabbing select-none"
            style={{
              width: "clamp(280px, 86vw, 520px)",
              aspectRatio: "5 / 3.05",
              touchAction: "none",
              marginTop: 18,
              marginBottom: 4,
            }}
          >
            {/* Disco de madera */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "repeating-radial-gradient(circle at 50% 50%, rgba(0,0,0,.08) 0px, rgba(0,0,0,.08) 2px, transparent 2px, transparent 10px), radial-gradient(circle at 38% 32%, var(--wood-2, #6b4a30), var(--wood-1, #4a3222) 55%, var(--wood-3, #2e2015) 100%)",
                border: "6px solid " + THEME.gold,
                boxShadow: "0 14px 30px rgba(0,0,0,.55), inset 0 0 40px rgba(0,0,0,.5)",
              }}
            />
            {/* Hub con kanji */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none"
              style={{ zIndex: 50 }}
            >
              <span
                className="leading-none"
                style={{ color: THEME.gold, fontFamily: "Georgia, 'Hiragino Mincho ProN', serif", fontSize: "clamp(26px,5.5vw,38px)" }}
              >
                鮨
              </span>
              <span className="text-[11px] mt-1.5 tracking-wide" style={{ color: THEME.cream, opacity: 0.75 }}>
                Gira la mesa
                <br />
                para elegir
              </span>
            </div>
            {/* Platos de categoría (posicionados por JS en órbita elíptica) */}
            {categorias.map((cat) => (
              <button
                key={cat.id}
                ref={(el) => {
                  if (el) plateElsRef.current.set(cat.id, el);
                  else plateElsRef.current.delete(cat.id);
                }}
                data-cat-key={cat.id}
                type="button"
                onClick={() => selectCategory(cat.id)}
                aria-label={`Ver categoría ${cat.nombre}`}
                title={cat.nombre}
                className="absolute top-0 left-0 rounded-full flex flex-col items-center justify-center cursor-pointer will-change-transform focus-visible:outline-none"
                style={{
                  width: "clamp(64px,15vw,82px)",
                  height: "clamp(64px,15vw,82px)",
                  border: "2px solid " + THEME.gold,
                  background: "radial-gradient(circle at 35% 30%, #2a2f38, #171a1f 70%)",
                  color: THEME.cream,
                  fontFamily: "inherit",
                  fontSize: 11,
                  fontWeight: 600,
                  gap: 2,
                  boxShadow: "0 6px 12px rgba(0,0,0,.5)",
                  // hover suave: brillo + borde dorado con easing decelerado
                  transition: "filter 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = "brightness(1.18)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px " + THEME.gold + "55, 0 10px 18px rgba(0,0,0,.55)";
                  e.currentTarget.style.borderColor = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = "";
                  e.currentTarget.style.boxShadow = "";
                  e.currentTarget.style.borderColor = "";
                }}
              >
                <span className="text-xl leading-none" aria-hidden="true">
                  {cat.emoji}
                </span>
                <span className="leading-tight px-1 text-center">{cat.nombre}</span>
              </button>
            ))}
          </div>

          {/* Controles */}
          <div className="flex items-center flex-wrap justify-center gap-4 mt-3.5 mb-5">
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              className="px-3.5 py-2 rounded-full text-[13px] cursor-pointer border transition-colors hover:border-[var(--gold,#c9a15a)]"
              style={{ background: THEME.bg2, color: THEME.cream, borderColor: "#333a44" }}
            >
              {playing ? "⏸ Pausar giro" : "▶ Reanudar giro"}
            </button>
            <label className="text-[12.5px] flex items-center gap-2" style={{ color: THEME.muted }}>
              Velocidad
              <span className="text-[10.5px] opacity-65">Lento</span>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="cursor-pointer"
                style={{ accentColor: THEME.gold }}
                aria-label="Velocidad de rotación"
              />
              <span className="text-[10.5px] opacity-65">Rápido</span>
            </label>
            {reducedMotion && (
              <span className="text-[11px] px-3 py-1 rounded-full" style={{ background: "#232830", color: THEME.muted }} role="status">
                ♿ Movimiento reducido activo
              </span>
            )}
          </div>
        </section>
      )}

      {/* ── Vista: cinta transportadora ── */}
      {view === "belt" && selected && (
        <section className="relative px-4 pb-4">
          <div className="flex items-center gap-3.5 mt-4 mb-3">
            <button
              type="button"
              onClick={goBack}
              className="px-3.5 py-2 rounded-full text-[13px] cursor-pointer border transition-colors hover:border-[var(--gold,#c9a15a)]"
              style={{ background: THEME.bg2, color: THEME.cream, borderColor: "#333a44" }}
            >
              ← Volver a la mesa
            </button>
            <h3
              className="text-xl font-bold m-0"
              style={{ color: THEME.cream, fontFamily: "Georgia, 'Hiragino Mincho ProN', serif" }}
            >
              {selected.emoji} {selected.nombre}
            </h3>
          </div>

          <div
            className="relative rounded-2xl overflow-hidden border px-2 py-5"
            onPointerEnter={() => setHoverPaused(true)}
            onPointerLeave={() => setHoverPaused(false)}
            style={{
              background: "repeating-linear-gradient(180deg, #23262c 0px, #23262c 2px, #1b1e23 2px, #1b1e23 4px)",
              borderColor: "#30343c",
              boxShadow: "inset 0 3px 10px rgba(0,0,0,.5)",
            }}
            role="list"
            aria-label={`Cinta de platillos de ${selected.nombre}. Pasa el cursor para pausar.`}
          >
            <div
              ref={beltTrackRef}
              className="flex w-max"
              style={{
                animation: beltRunning ? `kaiten-belt-scroll ${beltDuration}s linear infinite` : "none",
                animationPlayState: beltRunning ? "running" : "paused",
              }}
            >
              {/* Items duplicados (x2) para loop seamless con translateX(-50%) */}
              {[...selected.productos, ...selected.productos].map((p, i) => {
                const tier = tierFor(p.precio);
                return (
                  <button
                    key={`${p.id}-${i}`}
                    type="button"
                    role="listitem"
                    onClick={() => takeItem(p)}
                    aria-label={`Pedir ${p.nombre} (${fmt(p.precio)})`}
                    className="flex flex-col items-center gap-2 bg-none border-none cursor-pointer"
                    style={{ width: 118, flex: "0 0 auto", padding: "0 10px", color: "inherit", fontFamily: "inherit" }}
                  >
                    <span
                      className="w-16 h-16 rounded-full flex items-center justify-center text-[26px]"
                      style={{
                        background: tier.color,
                        border: `2px solid ${tier.border}`,
                        boxShadow: "0 4px 10px rgba(0,0,0,.4), inset 0 0 0 2px rgba(255,255,255,.15)",
                        // hover suave: elevación con easing spring + sombra flotante
                        transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease",
                        animation: pulsingId === p.id ? "kaiten-pulse-taken .5s ease" : "none",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-5px) scale(1.08)";
                        e.currentTarget.style.boxShadow = "0 12px 22px rgba(0,0,0,.5), inset 0 0 0 2px rgba(255,255,255,.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "";
                        e.currentTarget.style.boxShadow = "";
                      }}
                      aria-hidden="true"
                    >
                      {selected.emoji}
                    </span>
                    <span className="text-center leading-snug">
                      <span className="block text-[12px] transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                        style={{ color: pulsingId === p.id ? THEME.gold : THEME.ink }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = THEME.gold)}
                        onMouseLeave={(e) => (e.currentTarget.style.color = THEME.ink)}
                      >
                        {p.nombre}
                      </span>
                      <span className="block text-[12.5px] font-bold" style={{ color: THEME.gold }}>
                        {fmt(p.precio)}
                      </span>
                    </span>
                  </button>
                );
              })}
              {selected.productos.length === 0 && (
                <p className="text-[12.5px] w-full text-center" style={{ color: THEME.muted }}>
                  No hay platillos disponibles en esta categoría aún.
                </p>
              )}
            </div>
          </div>
          <p className="text-[10.5px] text-center mt-2 mb-0" style={{ color: THEME.muted, opacity: 0.7 }}>
            pasa el cursor para pausar
          </p>
        </section>
      )}

      {/* ── Bandeja de pedido (carrito real) ── */}
      <div
        className="relative sticky bottom-3 mx-4 mb-4 rounded-2xl border overflow-hidden"
        style={{ background: THEME.bg2, borderColor: "#30343c", zIndex: 60 }}
      >
        <button
          type="button"
          onClick={() => setTrayOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-3 cursor-pointer text-sm font-semibold"
          style={{ color: THEME.ink, background: "transparent", border: "none" }}
          aria-expanded={trayOpen}
          aria-controls="kaiten-tray-details"
        >
          <span>
            🧾 {itemCount} {itemCount === 1 ? "plato" : "platos"} · {fmt(total)}
          </span>
          <span className="text-[11px] font-normal" style={{ color: THEME.muted }}>
            {trayOpen ? "ocultar ▴" : "ver orden ▾"}
          </span>
        </button>
        {trayOpen && (
          <div id="kaiten-tray-details" className="px-4 pb-3 pt-2" style={{ borderTop: "1px solid #30343c" }}>
            {items.length === 0 ? (
              <p className="text-[12.5px] m-0 py-1" style={{ color: THEME.muted }}>
                Aún no has tomado ningún platillo.
              </p>
            ) : (
              <>
                {items.map((it) => (
                  <div
                    key={it.productoId}
                    className="flex items-center justify-between text-[13px] py-1.5"
                    style={{ borderBottom: "1px dashed #2a2e35" }}
                  >
                    <span className="flex items-center gap-1.5">
                      <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ background: tierFor(it.precio).color }}
                        aria-hidden="true"
                      />
                      {it.nombre} × {it.cantidad}
                    </span>
                    <span className="flex items-center gap-2">
                      <span>{fmt(it.precio * it.cantidad)}</span>
                      <button
                        type="button"
                        onClick={() => updateCantidad(it.productoId, it.cantidad - 1)}
                        className="w-6 h-6 rounded-full border text-[12px] cursor-pointer hover:opacity-80"
                        style={{ borderColor: "#3a3f48", color: THEME.muted, background: "transparent" }}
                        aria-label={`Quitar uno de ${it.nombre}`}
                      >
                        −
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(it.productoId)}
                        className="w-6 h-6 rounded-full border text-[11px] cursor-pointer hover:opacity-80"
                        style={{ borderColor: "#3a3f48", color: THEME.muted, background: "transparent" }}
                        aria-label={`Quitar ${it.nombre}`}
                      >
                        ✕
                      </button>
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between font-bold text-[14.5px] mt-2.5 pt-2" style={{ borderTop: "1px solid #30343c" }}>
                  <span>Total</span>
                  <span>{fmt(total)}</span>
                </div>
                <button
                  type="button"
                  onClick={clearCart}
                  className="w-full mt-2.5 py-1.5 rounded-lg text-[12px] cursor-pointer transition-colors hover:opacity-90"
                  style={{ background: "transparent", border: "1px solid #3a3f48", color: THEME.muted }}
                >
                  Vaciar orden
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}