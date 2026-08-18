// src/components/menu/KaitenMenu.tsx — Mesa giratoria kaiten-zushi (port de docs/ejemplos/menu_kaiten_3d_realista_estilo_sushictory_final.html)
// confidence: high — estilo sushictory (porcelana, madera, Bebas/Permanent Marker) + modal de producto;
// órbita elíptica con drag físico + inercia, profundidad simulada (escala/zIndex), cinta transportadora
// en loop infinito con tiers de precio, bandeja de pedido conectada al carrito real.
// Datos REALES de /api/categorias. Respeta prefers-reduced-motion.
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  goldLight: "#e8cf9a",
  cream: "#efe4cf",
  ink: "#ece5d6",
  muted: "#9aa0ab",
  tierGreen: "#4f7c6b",
  tierYellow: "#c9962f",
  tierRed: "#b7302c",
  tierSilver: "#8892a6",
  tierGold: "#1c1a16",
  porcelain1: "#fffdf8",
  porcelain2: "#efe6d2",
  porcelain3: "#cfc3a4",
  woodRim: "#2a1d14",
  brushRed: "#ff4b2e",
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

// ─── Validaciones (funciones puras, fuera del componente) ───
function validateProductData(p: unknown): boolean {
  if (!p || typeof p !== "object") return false;
  const o = p as Record<string, unknown>;
  if (typeof o.nombre !== "string" || !o.nombre) return false;
  if (typeof o.precio !== "number" || !Number.isFinite(o.precio) || o.precio < 0) return false;
  if (typeof o.categoriaId !== "string" || !o.categoriaId) return false;
  return true;
}

function sanitizeQuantity(v: string | number): number {
  const n = Number.parseInt(String(v), 10);
  if (!Number.isFinite(n)) return 1;
  return Math.max(1, Math.min(99, n));
}

// Escape de texto para interpolación en strings. React ya escapa el texto en
// JSX, por lo que esta utilidad queda disponible para composición de strings
// crudos (referencia del ejemplo vanilla: escapeHtml al armar innerHTML).
export function escapeHtml(s: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return String(s).replace(/[&<>"']/g, (c) => map[c]);
}

function validateSearchQuery(q: string): string {
  return q.trim().slice(0, 120);
}

function mod(a: number, b: number): number {
  return ((a % b) + b) % b;
}

const DECAY_K = 2.996; // -ln(0.05): tamaño del burst de velocidad para el snap de 1 item

// Plato de porcelana 3D compartido (mesa + cinta + grid de búsqueda)
function PorcelainPlate({ rimColor, children, className = "", imageUrl, alt }: {
  rimColor: string; children: React.ReactNode; className?: string; imageUrl?: string; alt?: string;
}) {
  return (
    <span className={`plate-3d ${className}`}>
      <span className="plate-shadow" aria-hidden="true" />
      <span className="plate-face" style={{ "--rim": rimColor } as React.CSSProperties}>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="food-img" src={imageUrl} alt={alt} loading="lazy" decoding="async" />
        ) : (
          children
        )}
      </span>
    </span>
  );
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
  const [trayOpen, setTrayOpen] = useState(false);
  const [pulsingId, setPulsingId] = useState<string | null>(null);
  const [modalProduct, setModalProduct] = useState<Producto | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ key: string; producto: Producto; category: Categoria }>>([]);
  const [searchMode, setSearchMode] = useState<"normal" | "static" | "belt" | "empty">("normal");

  const toastTimerRef = useRef<number | null>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);
  const modalCloseRef = useRef<HTMLButtonElement>(null);

  const wheelWrapRef = useRef<HTMLDivElement>(null);
  const plateElsRef = useRef<Map<string, HTMLButtonElement>>(new Map());
  const beltTrackRef = useRef<HTMLDivElement>(null);
  const beltWrapRef = useRef<HTMLDivElement>(null);
  const beltScrollPosRef = useRef(0);
  const beltVelocityRef = useRef(0);
  const beltDraggingRef = useRef(false);
  const beltDragStartRef = useRef({ x: 0, y: 0, pos: 0, time: 0 });
  const beltLastRef = useRef({ x: 0, time: 0 });
  const beltOffsetsRef = useRef<number[]>([]);
  const beltWidthsRef = useRef<number[]>([]);
  const beltSetWidthRef = useRef(0);
  const beltWrapWidthRef = useRef(0);
  const beltAnimationRef = useRef(0);
  const beltHoverPausedRef = useRef(false);
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

  // Toast auto-hide (referencia: 1800ms)
  useEffect(() => {
    if (!toastMsg) return;
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToastMsg(null), 1800);
    return () => { if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current); };
  }, [toastMsg]);

  // ─── Modal de producto ───
  const openModal = (p: Producto) => {
    lastFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setModalProduct(p);
  };
  const closeModal = useCallback(() => {
    setModalProduct(null);
    lastFocusRef.current?.focus?.();
    lastFocusRef.current = null;
  }, []);

  // Esc cierra el modal + scroll lock del body
  useEffect(() => {
    if (!modalProduct) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeModal(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [modalProduct, closeModal]);

  // Foco al botón de cerrar al abrir el modal
  useEffect(() => {
    if (!modalProduct) return;
    requestAnimationFrame(() => modalCloseRef.current?.focus());
  }, [modalProduct]);

  // Ángulos base de los platos (distribución uniforme)
  const baseAngles = useMemo(
    () => categorias.map((_, i) => -90 + (360 / Math.max(categorias.length, 1)) * i),
    [categorias]
  );

  const selected = useMemo(
    () => categorias.find((c) => c.id === selectedId) || null,
    [categorias, selectedId]
  );

  const modalCategory = useMemo(
    () => (modalProduct ? categorias.find((c) => c.id === modalProduct.categoriaId) || null : null),
    [modalProduct, categorias]
  );

  // ─── Búsqueda de platillos ───
  const allSearchItems = useMemo(
    () =>
      categorias.flatMap((cat) =>
        cat.productos.map((producto) => ({ key: cat.id, producto, category: cat }))
      ),
    [categorias]
  );

  const runSearch = useCallback(
    (raw: string) => {
      const query = validateSearchQuery(raw);
      setSearchQuery(query);
      if (!query) {
        setSearchMode("normal");
        setSearchResults([]);
        return;
      }
      const q = query.toLocaleLowerCase("es-MX");
      const found = allSearchItems.filter((x) => {
        const text = [x.producto.nombre, x.producto.descripcion || "", x.category.nombre]
          .join(" ")
          .toLocaleLowerCase("es-MX");
        return text.indexOf(q) !== -1;
      });
      setSearchResults(found);
      if (found.length === 0) setSearchMode("empty");
      else if (found.length <= 5) setSearchMode("static");
      else setSearchMode("belt");
    },
    [allSearchItems]
  );

  const resetSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchMode("normal");
  }, []);

  // ─── Cinta activa (categoría elegida o resultados de búsqueda >5) ───
  const beltActive =
    searchMode === "belt" || (view === "belt" && searchMode === "normal" && selected !== null);

  const beltItems = useMemo<Array<{ key: string; producto: Producto; category: Categoria }>>(() => {
    if (searchMode === "belt" && searchResults.length > 0) return searchResults;
    if (selected) return selected.productos.map((producto) => ({ key: selected.id, producto, category: selected }));
    return [];
  }, [searchMode, searchResults, selected]);

  const beltTitle =
    searchMode === "belt"
      ? `Resultados para "${searchQuery}"`
      : selected
        ? `${selected.emoji} ${selected.nombre}`
        : "";

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

  const goBack = () => {
    setView("wheel");
    resetSearch();
  };

  // ─── Cinta step-snap (RAF, port del ejemplo de referencia) ───
  const measureBelt = useCallback(() => {
    const wrap = beltWrapRef.current;
    if (!wrap) return;
    beltWrapWidthRef.current = wrap.getBoundingClientRect().width;
    const els = Array.from(wrap.querySelectorAll<HTMLElement>("[data-belt-item]"));
    beltOffsetsRef.current = [];
    beltWidthsRef.current = [];
    let left = 0;
    els.forEach((el) => {
      // Reset de escalas/opacidad de frames previos antes de medir (React
      // reutiliza los nodos entre renders y conservan el transform inline)
      el.style.transform = "";
      el.style.opacity = "";
      const w = el.getBoundingClientRect().width;
      beltOffsetsRef.current.push(left);
      beltWidthsRef.current.push(w);
      left += w;
    });
    const n = Math.max(1, els.length / 3);
    let setWidth = 0;
    for (let i = 0; i < n; i++) setWidth += beltWidthsRef.current[i] || 0;
    beltSetWidthRef.current = setWidth;
  }, []);

  const beltFrontIndex = useCallback(() => {
    const offsets = beltOffsetsRef.current;
    const widths = beltWidthsRef.current;
    if (!offsets.length || !beltSetWidthRef.current) return 0;
    const wrapCenter = beltWrapWidthRef.current / 2;
    const shift = -mod(beltScrollPosRef.current, beltSetWidthRef.current);
    const n = offsets.length / 3;
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < n; i++) {
      const center = offsets[i] + widths[i] / 2 + shift;
      const d = Math.abs(center - wrapCenter);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    return best;
  }, []);

  const stepBelt = useCallback(
    (dir: number) => {
      if (!beltSetWidthRef.current) return;
      beltDraggingRef.current = false;
      const n = Math.max(1, beltOffsetsRef.current.length / 3);
      const pitch = beltSetWidthRef.current / n;
      if (reducedMotion) {
        // movimiento reducido: paso instantáneo, sin animación
        beltScrollPosRef.current += dir * pitch;
        beltVelocityRef.current = 0;
      } else {
        beltVelocityRef.current = dir * pitch * DECAY_K;
      }
    },
    [reducedMotion]
  );

  const onBeltPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const wrap = beltWrapRef.current;
    if (!wrap) return;
    wrap.setPointerCapture(e.pointerId);
    beltDraggingRef.current = true;
    beltVelocityRef.current = 0;
    beltDragStartRef.current = { x: e.clientX, y: e.clientY, pos: beltScrollPosRef.current, time: Date.now() };
    beltLastRef.current = { x: e.clientX, time: performance.now() };
  }, []);

  const onBeltPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!beltDraggingRef.current) return;
    const now = performance.now();
    const start = beltDragStartRef.current;
    beltScrollPosRef.current = start.pos - (e.clientX - start.x);
    const dt = Math.max(1, now - beltLastRef.current.time);
    const instDx = e.clientX - beltLastRef.current.x;
    beltVelocityRef.current = -instDx / (dt / 1000);
    beltLastRef.current = { x: e.clientX, time: now };
  }, []);

  const endBeltDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!beltDraggingRef.current) return;
    beltDraggingRef.current = false;
    const start = beltDragStartRef.current;
    const dist = Math.hypot(e.clientX - start.x, e.clientY - start.y);
    const dur = Date.now() - start.time;
    if (dist < 6 && dur < 350) {
      // fue un tap (no arrastre): elegir el item tocado
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const item = el && el.closest ? el.closest("[data-belt-item]") : null;
      if (item instanceof HTMLElement) {
        beltVelocityRef.current = 0;
        item.click();
      }
    }
  }, []);

  const onBeltKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowLeft") {
        stepBelt(-1);
        e.preventDefault();
      } else if (e.key === "ArrowRight") {
        stepBelt(1);
        e.preventDefault();
      } else if (e.key === "Enter" || e.key === " ") {
        const idx = beltFrontIndex();
        const items = beltWrapRef.current?.querySelectorAll<HTMLElement>("[data-belt-item]");
        const el = items && items[idx];
        if (el) el.click();
        e.preventDefault();
      }
    },
    [stepBelt, beltFrontIndex]
  );

  // Medir la cinta cuando cambia su contenido o entra en escena (el reset de
  // scroll imita el reinicio del ejemplo al re-renderizar la cinta)
  useEffect(() => {
    if (!beltActive) return;
    beltScrollPosRef.current = 0;
    beltVelocityRef.current = 0;
    measureBelt();
  }, [beltActive, beltItems, measureBelt]);

  // Re-medir al redimensionar la ventana (solo con la cinta visible)
  useEffect(() => {
    if (!beltActive) return;
    const onResize = () => measureBelt();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [beltActive, measureBelt]);

  // Bucle RAF: snap por inercia, drag con física y auto-scroll suave
  useEffect(() => {
    if (!beltActive) return;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const wrap = beltWrapRef.current;
      const track = beltTrackRef.current;
      if (wrap && track && beltSetWidthRef.current) {
        if (beltDraggingRef.current) {
          // la posición ya se setea en onBeltPointerMove
        } else if (Math.abs(beltVelocityRef.current) > 2) {
          beltScrollPosRef.current += beltVelocityRef.current * dt;
          beltVelocityRef.current *= Math.pow(0.05, dt);
        } else {
          beltVelocityRef.current = 0;
          if (playing && !beltHoverPausedRef.current && !reducedMotion) {
            const speedMult = 0.4 + speed * 0.16; // 0.4x .. 2.0x (≈1x en speed 4)
            beltScrollPosRef.current += 46 * speedMult * dt;
          }
        }
        const shift = -mod(beltScrollPosRef.current, beltSetWidthRef.current);
        track.style.transform = `translateX(${shift}px)`;
        const wrapCenter = beltWrapWidthRef.current / 2;
        const focusRadius = 150;
        const els = wrap.querySelectorAll<HTMLElement>("[data-belt-item]");
        for (let i = 0; i < els.length; i++) {
          const center = (beltOffsetsRef.current[i] || 0) + (beltWidthsRef.current[i] || 0) / 2 + shift;
          const t = Math.max(0, 1 - Math.abs(center - wrapCenter) / focusRadius);
          const scale = 0.86 + 0.18 * t;
          els[i].style.transform = `scale(${scale})`;
          els[i].style.opacity = String(0.75 + 0.25 * t);
        }
      }
      beltAnimationRef.current = requestAnimationFrame(frame);
    };
    beltAnimationRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(beltAnimationRef.current);
  }, [beltActive, playing, speed, reducedMotion]);

  // ─── Agregar desde el modal (carrito real) ───
  const addFromModal = () => {
    if (!modalProduct) return;
    const p = modalProduct;
    if (!validateProductData(p)) {
      console.warn("[KaitenMenu] producto inválido, no se agregó:", p);
      setToastMsg("No se pudo agregar");
      return;
    }
    const cartProduct = { ...p, categoria: { id: p.categoriaId } } as unknown as ProductoWithCategoria;
    addItem(cartProduct, sanitizeQuantity(1));
    setPulsingId(p.id);
    window.setTimeout(() => setPulsingId((cur) => (cur === p.id ? null : cur)), 600);
    // Shake de feedback en el item de la cinta
    const el = document.querySelector(`[data-product-id="${p.id}"]`);
    if (el instanceof HTMLElement) {
      el.classList.add("quantity-invalid");
      window.setTimeout(() => el.classList.remove("quantity-invalid"), 240);
    }
    setToastMsg(`${p.nombre} agregado a tu orden`);
    closeModal();
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

      {/* ── Búsqueda de platillos ── */}
      <div className="relative px-4 pt-2" role="search">
        <div className="kaiten-search">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => runSearch(e.target.value)}
            placeholder="Buscar sushi, ramen, ingredientes..."
            maxLength={120}
            autoComplete="off"
            aria-label="Buscar platillos"
          />
        </div>
        <p className="kaiten-search-summary" aria-live="polite">
          {searchMode === "empty"
            ? "No encontramos ese platillo"
            : searchMode !== "normal"
              ? `${searchResults.length} ${searchResults.length === 1 ? "resultado" : "resultados"}`
              : ""}
        </p>
      </div>

      {/* ── Vista: mesa giratoria ── */}
      {view === "wheel" && searchMode === "normal" && (
        <section className="relative px-4">
          <div className="flex items-center justify-center gap-1">
            <button
              type="button"
              onClick={() => { angleRef.current -= 30; velocityRef.current = 0; }}
              aria-label="Girar mesa a la izquierda"
              className="flex-none w-8 h-8 rounded-full border text-[15px] cursor-pointer hover:border-[var(--gold,#c9a15a)]"
              style={{ background: "#20242c", borderColor: "#333a44", color: THEME.cream }}
            >
              ‹
            </button>
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
                aspectRatio: "5 / 2.5",
                touchAction: "none",
                marginTop: 18,
                marginBottom: 4,
              }}
            >
              {/* Disco de madera (referencia sushictory) */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "radial-gradient(ellipse at 48% 36%, rgba(255,255,255,.08), transparent 34%), repeating-linear-gradient(96deg, rgba(255,255,255,.018) 0 2px, rgba(0,0,0,.025) 2px 6px, transparent 6px 13px), repeating-radial-gradient(ellipse at 40% 48%, rgba(0,0,0,.045) 0 2px, transparent 2px 13px), radial-gradient(circle at 36% 30%, #7a452d, #5a3020 55%, #25150f 100%)",
                  border: "5px solid " + THEME.woodRim,
                  boxShadow:
                    "0 18px 34px rgba(0,0,0,.6), inset 0 0 0 2px rgba(255,255,255,.055), inset 0 0 28px rgba(0,0,0,.58), inset 0 10px 20px rgba(255,255,255,.035)",
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
              {/* Platos de categoría → porcelana (posicionados por JS en órbita elíptica) */}
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
                  className="absolute top-0 left-0 cursor-pointer will-change-transform focus-visible:outline-none"
                  style={{
                    width: "clamp(70px,16vw,88px)",
                    height: "clamp(70px,16vw,88px)",
                    padding: 0,
                    border: "none",
                    background: "none",
                    transition: "filter 0.28s ease",
                  }}
                  onMouseEnter={(e) => {
                    const f = e.currentTarget.querySelector<HTMLElement>(".plate-face");
                    if (f) f.style.boxShadow = "0 0 0 2px rgba(232,207,154,.42), 0 10px 18px rgba(0,0,0,.36), inset 0 -3px 6px rgba(0,0,0,.2), inset 0 2px 3px rgba(255,255,255,.85)";
                    e.currentTarget.style.filter = "brightness(1.08)";
                  }}
                  onMouseLeave={(e) => {
                    const f = e.currentTarget.querySelector<HTMLElement>(".plate-face");
                    if (f) f.style.boxShadow = "";
                    e.currentTarget.style.filter = "";
                  }}
                  onFocus={(e) => {
                    const f = e.currentTarget.querySelector<HTMLElement>(".plate-face");
                    if (f) f.style.boxShadow = "0 0 0 3px " + THEME.gold + ", inset 0 -3px 6px rgba(0,0,0,.2), inset 0 2px 3px rgba(255,255,255,.85)";
                  }}
                  onBlur={(e) => {
                    const f = e.currentTarget.querySelector<HTMLElement>(".plate-face");
                    if (f) f.style.boxShadow = "";
                  }}
                >
                  <PorcelainPlate rimColor={cat.color || THEME.gold}>
                    <span className="emoji" aria-hidden="true">{cat.emoji}</span>
                    <span className="cat-name">{cat.nombre}</span>
                  </PorcelainPlate>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => { angleRef.current += 30; velocityRef.current = 0; }}
              aria-label="Girar mesa a la derecha"
              className="flex-none w-8 h-8 rounded-full border text-[15px] cursor-pointer hover:border-[var(--gold,#c9a15a)]"
              style={{ background: "#20242c", borderColor: "#333a44", color: THEME.cream }}
            >
              ›
            </button>
          </div>

          {/* Controles — compact pill bar */}
          <div className="flex items-center justify-center mt-2.5 mb-4">
            <div
              className="flex items-center justify-center gap-[7px] px-2 py-[3px] rounded-full opacity-[0.58] hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200"
              style={{
                background: "rgba(13,15,18,.66)",
                border: "1px solid rgba(74,48,36,.55)",
              }}
            >
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                aria-label={playing ? "Pausar giro" : "Reanudar giro"}
                title={playing ? "Pausar giro" : "Reanudar giro"}
                className="w-5 h-5 rounded-full grid place-items-center cursor-pointer text-[9px] leading-none hover:bg-[rgba(219,49,34,.8)] hover:text-white"
                style={{ background: "transparent", border: "none", padding: 0, color: "#f7ead3" }}
              >
                {playing ? "⏸" : "▶"}
              </button>
              <span className="text-[9px] leading-none" aria-hidden="true" style={{ color: "rgba(247,234,211,.52)" }}>
                ◔
              </span>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="cursor-pointer"
                style={{ width: 44, height: 2, margin: 0, accentColor: "#d93625" }}
                aria-label="Velocidad de rotación"
                title="Velocidad de la mesa"
              />
            </div>
          </div>
          {reducedMotion && (
            <div className="flex justify-center mb-3">
              <span className="text-[10px] px-2.5 py-0.5 rounded-full opacity-75" style={{ background: "#232830", color: THEME.muted }} role="status">
                ♿ Movimiento reducido activo
              </span>
            </div>
          )}
        </section>
      )}

      {/* ── Vista: cinta transportadora (step-snap RAF) ── */}
      {beltActive && (
        <section className="relative px-4 pb-4">
          <div className="flex items-center flex-wrap gap-3.5 mt-4 mb-3">
            <button
              type="button"
              onClick={goBack}
              className="px-3.5 py-2 rounded-full text-[13px] cursor-pointer border transition-colors hover:border-[var(--gold,#c9a15a)]"
              style={{ background: THEME.bg2, color: THEME.cream, borderColor: "#333a44" }}
            >
              ← Volver a la mesa
            </button>
            <h3
              className="m-0"
              style={{ color: "#fff7e8", fontFamily: "var(--font-bebas, Impact, sans-serif)", fontSize: 24, textTransform: "uppercase", letterSpacing: ".03em", margin: 0 }}
            >
              {beltTitle}
            </h3>
            <div className="flex items-center gap-1" role="group" aria-label="Navegar por los platillos de la cinta">
              <button
                type="button"
                onClick={() => stepBelt(-1)}
                aria-label="Platillo anterior"
                className="flex-none w-8 h-8 rounded-full border text-[15px] cursor-pointer hover:border-[var(--gold,#c9a15a)]"
                style={{ background: "#20242c", borderColor: "#333a44", color: THEME.cream }}
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => stepBelt(1)}
                aria-label="Platillo siguiente"
                className="flex-none w-8 h-8 rounded-full border text-[15px] cursor-pointer hover:border-[var(--gold,#c9a15a)]"
                style={{ background: "#20242c", borderColor: "#333a44", color: THEME.cream }}
              >
                ›
              </button>
            </div>
            {/* Tagline brush (referencia .belt-header::after) */}
            <div
              className="font-brush text-[11px] tracking-[.04em] -mt-[7px]"
              style={{ color: THEME.brushRed, textShadow: "1px 1px 0 #210b08", flexBasis: "100%" }}
            >
              BUEN SUSHI · SIEMPRE
            </div>
          </div>

          <div
            ref={beltWrapRef}
            className="kaiten-belt-wrap relative overflow-hidden border"
            role="list"
            tabIndex={0}
            aria-label={`Cinta de platillos de ${beltTitle}. Arrastra, usa las flechas o Enter para pedir el platillo al frente.`}
            onKeyDown={onBeltKeyDown}
            onPointerDown={onBeltPointerDown}
            onPointerMove={onBeltPointerMove}
            onPointerUp={endBeltDrag}
            onPointerCancel={endBeltDrag}
            onPointerEnter={() => { beltHoverPausedRef.current = true; }}
            onPointerLeave={() => { beltHoverPausedRef.current = false; }}
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,.12), transparent 10%, transparent 90%, rgba(0,0,0,.32)), repeating-linear-gradient(93deg, rgba(255,255,255,.025) 0 3px, rgba(0,0,0,.035) 3px 8px, transparent 8px 16px), linear-gradient(180deg,#6e472e,#3d2418 48%,#5b3925)",
              borderColor: "#1d120c",
              borderRadius: 18,
              padding: "34px 0 30px",
              boxShadow: "0 14px 28px rgba(0,0,0,.46), inset 0 2px 0 rgba(255,255,255,.08), inset 0 -7px 14px rgba(0,0,0,.36)",
            }}
          >
            {/* Chrome de la cinta: rieles, tornillos, zona de foco y desvanecidos */}
            <div className="absolute left-2 right-2 top-[9px] h-[13px] rounded-[7px] pointer-events-none" style={{ background: "repeating-linear-gradient(90deg, rgba(255,255,255,.08) 0 4px, transparent 4px 18px), linear-gradient(180deg,#24160f,#4b2d1c 48%,#21130d)", border: "1px solid rgba(201,161,90,.35)", boxShadow: "inset 0 2px 2px rgba(255,255,255,.08), inset 0 -3px 5px rgba(0,0,0,.45)", zIndex: 1 }} />
            <div className="absolute left-2 right-2 bottom-[8px] h-[13px] rounded-[7px] pointer-events-none" style={{ background: "repeating-linear-gradient(90deg, rgba(255,255,255,.08) 0 4px, transparent 4px 18px), linear-gradient(180deg,#24160f,#4b2d1c 48%,#21130d)", border: "1px solid rgba(201,161,90,.35)", boxShadow: "inset 0 2px 2px rgba(255,255,255,.08), inset 0 -3px 5px rgba(0,0,0,.45)", zIndex: 1 }} />
            <div className="absolute left-[18px] right-[18px] top-[10px] h-[11px] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, #9a7448 0 1.4px, #2a170d 1.7px 2.5px, transparent 2.7px)", backgroundSize: "24px 11px", zIndex: 5 }} />
            <div className="absolute top-[25px] bottom-[25px] left-1/2 w-[76px] -translate-x-1/2 pointer-events-none" style={{ borderLeft: "1px solid rgba(255,221,159,.16)", borderRight: "1px solid rgba(255,221,159,.16)", background: "linear-gradient(180deg, rgba(255,221,159,.09), rgba(255,221,159,.02) 30%, transparent 70%)", zIndex: 1 }} />
            <div className="absolute top-0 bottom-0 left-0 w-[14%] pointer-events-none" style={{ background: "linear-gradient(90deg,#1b100b 0%,rgba(27,16,11,.86) 16%,transparent 100%)", zIndex: 6 }} />
            <div className="absolute top-0 bottom-0 right-0 w-[14%] pointer-events-none" style={{ background: "linear-gradient(-90deg,#1b100b 0%,rgba(27,16,11,.86) 16%,transparent 100%)", zIndex: 6 }} />

            {beltItems.length === 0 ? (
              <p className="relative z-[2] text-[12.5px] text-center m-0 py-6" style={{ color: THEME.muted }}>
                No hay platillos disponibles en esta categoría aún.
              </p>
            ) : (
              <div ref={beltTrackRef} className="kaiten-belt-track">
                {/* Items TRIPLICADOS (x3) para loop seamless con snap */}
                {[...beltItems, ...beltItems, ...beltItems].map((r, i) => {
                  const n = Math.max(1, beltItems.length);
                  const copy = i < n ? 0 : i < 2 * n ? 1 : 2;
                  const p = r.producto;
                  const tier = tierFor(p.precio);
                  return (
                    <button
                      key={`${p.id}-${copy}-${i}`}
                      data-belt-item
                      data-product-id={p.id}
                      type="button"
                      role="listitem"
                      onClick={() => openModal(p)}
                      aria-label={`Ver detalles de ${p.nombre} (${fmt(p.precio)})`}
                      className="kaiten-belt-item flex flex-col items-center gap-[7px] bg-none border-none cursor-pointer"
                      style={{ width: 112, flex: "0 0 auto", padding: "8px 9px 10px", borderRadius: 14, border: "1px solid transparent", background: "linear-gradient(180deg,rgba(20,13,9,.10),rgba(20,13,9,.34))", color: "inherit", fontFamily: "inherit", transition: "background .2s ease, border-color .2s ease, filter .2s ease" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255,255,255,.07)";
                        e.currentTarget.style.borderColor = "rgba(201,161,90,.48)";
                        e.currentTarget.style.filter = "brightness(1.08)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "";
                        e.currentTarget.style.borderColor = "";
                        e.currentTarget.style.filter = "";
                      }}
                    >
                      <span className="w-[60px] h-[60px]" style={{ filter: "drop-shadow(0 7px 5px rgba(0,0,0,.34))" }}>
                        <PorcelainPlate className={pulsingId === p.id ? "plate-pulse" : ""} rimColor={tier.border} imageUrl={p.imagen || undefined} alt={p.nombre}>
                          <span style={{ filter: "drop-shadow(0 2px 2px rgba(0,0,0,.3))" }} aria-hidden="true">{r.category.emoji || "🍽️"}</span>
                        </PorcelainPlate>
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
              </div>
            )}
          </div>
          <p className="text-[10.5px] text-center mt-2 mb-0" style={{ color: THEME.muted, opacity: 0.7 }}>
            pasa el cursor para pausar
          </p>
        </section>
      )}

      {/* ── Búsqueda: grid estático (1-5 resultados, sin animación) ── */}
      {searchMode === "static" && (
        <section className="relative px-4 pb-4" aria-label="Resultados de búsqueda">
          <div className="kaiten-search-grid">
            {searchResults.map((r) => {
              const tier = tierFor(r.producto.precio);
              return (
                <button
                  key={r.producto.id}
                  type="button"
                  onClick={() => openModal(r.producto)}
                  aria-label={`Ver detalles de ${r.producto.nombre} (${fmt(r.producto.precio)})`}
                  className="kaiten-search-card flex flex-col items-center gap-2 cursor-pointer"
                >
                  <span className="w-[72px] h-[72px]" style={{ filter: "drop-shadow(0 7px 5px rgba(0,0,0,.34))" }}>
                    <PorcelainPlate rimColor={tier.border} imageUrl={r.producto.imagen || undefined} alt={r.producto.nombre}>
                      <span style={{ filter: "drop-shadow(0 2px 2px rgba(0,0,0,.3))" }} aria-hidden="true">{r.category.emoji || "🍽️"}</span>
                    </PorcelainPlate>
                  </span>
                  <span className="block text-[12px] text-center leading-snug" style={{ color: THEME.ink }}>{r.producto.nombre}</span>
                  <span className="block text-[12.5px] font-bold" style={{ color: THEME.gold }}>{fmt(r.producto.precio)}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Búsqueda: sin resultados ── */}
      {searchMode === "empty" && (
        <section className="kaiten-search-empty" role="status" aria-label="Sin resultados de búsqueda">
          <div>
            <span className="block text-[26px] mb-1.5" aria-hidden="true">🍥</span>
            <strong>No encontramos ese platillo</strong>
            <p className="text-[12.5px] mt-1 mb-0" style={{ color: "rgba(247,234,211,.55)" }}>
              Probá con otro nombre o ingrediente.
            </p>
          </div>
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

      {/* ── Modal de producto (referencia sushictory) ── */}
      {modalProduct && (
        <div
          className="fixed inset-0 grid place-items-center p-[18px]"
          style={{ background: "rgba(5,7,10,.76)", backdropFilter: "blur(8px)", zIndex: 200 }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div
            role="dialog" aria-modal="true" aria-labelledby="kaiten-modal-title"
            className="w-[min(520px,100%)] max-h-[min(760px,calc(100dvh-36px))] overflow-auto rounded-[22px] border"
            style={{ background: "linear-gradient(180deg,#20252d,#171b21)", borderColor: "#3a414b", boxShadow: "0 28px 80px rgba(0,0,0,.65)", animation: "kaiten-modal-in .22s ease both" }}
          >
            <div className="flex justify-end p-[10px_10px_0]">
              <button ref={modalCloseRef} type="button" aria-label="Cerrar detalles" onClick={closeModal}
                className="w-[38px] h-[38px] rounded-full border text-[20px] leading-none cursor-pointer hover:border-[var(--gold,#c9a15a)] hover:bg-[#2b3038]"
                style={{ borderColor: "#3a414b", background: "#242a32", color: THEME.cream }}>×</button>
            </div>
            <div className="mx-auto w-[170px] aspect-square grid place-items-center rounded-full overflow-hidden text-[70px]"
              style={{ background: "radial-gradient(circle at 34% 26%, #fff, #efe6d2 58%, #cfc3a4 100%)", border: "7px solid " + tierFor(modalProduct.precio).border, boxShadow: "inset 0 -10px 16px rgba(0,0,0,.15), 0 18px 35px rgba(0,0,0,.4)" }}>
              {modalProduct.imagen ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={modalProduct.imagen} alt={modalProduct.nombre} className="w-full h-full object-cover" decoding="async" />
              ) : (
                <span style={{ filter: "drop-shadow(0 2px 2px rgba(0,0,0,.3))" }} aria-hidden="true">{modalCategory?.emoji}</span>
              )}
            </div>
            <div className="p-[18px_22px_22px]">
              <div className="uppercase tracking-[.13em] text-[10px] font-extrabold mb-1.5" style={{ color: THEME.goldLight }}>{modalCategory?.emoji} {modalCategory?.nombre}</div>
              <h3 id="kaiten-modal-title" className="font-bebas text-[27px] leading-[1.12] my-0 mb-[7px] uppercase" style={{ color: THEME.cream }}>{modalProduct.nombre}</h3>
              <div className="text-[19px] font-extrabold mb-4" style={{ color: "#e8cf9a" }}>{fmt(modalProduct.precio)}</div>
              <div className="grid gap-3">
                <div className="rounded-xl border p-[11px_13px]" style={{ background: "#191d24", borderColor: "#303640" }}>
                  <div className="text-[10px] uppercase tracking-[.1em] mb-1" style={{ color: THEME.muted }}>Descripción</div>
                  <div className="text-[13px] leading-[1.55]" style={{ color: "#e7e0d2" }}>{modalProduct.descripcion || "Sin descripción disponible."}</div>
                </div>
                <div className="rounded-xl border p-[11px_13px]" style={{ background: "#191d24", borderColor: "#303640" }}>
                  <div className="text-[10px] uppercase tracking-[.1em] mb-1" style={{ color: THEME.muted }}>Tier de precio</div>
                  <div className="text-[13px] leading-[1.55]" style={{ color: "#e7e0d2" }}>Plato {tierFor(modalProduct.precio).name}</div>
                </div>
              </div>
              <div className="flex gap-2.5 mt-4">
                <button type="button" onClick={closeModal}
                  className="flex-1 min-h-[44px] rounded-[11px] cursor-pointer font-semibold text-[13px] hover:border-[var(--gold,#c9a15a)]"
                  style={{ border: "1px solid #3a414b", background: "#242a32", color: THEME.cream }}>Seguir explorando</button>
                <button type="button" onClick={addFromModal}
                  className="flex-1 min-h-[44px] rounded-[11px] cursor-pointer font-semibold text-[13px] hover:brightness-[1.08]"
                  style={{ border: "1px solid #b68d45", background: "linear-gradient(180deg,#c9a15a,#9d7638)", color: "#17130d" }}>Agregar a la orden</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {toastMsg && (
        <div className="fixed left-1/2 bottom-[22px] -translate-x-1/2 rounded-full border px-[15px] py-[10px] text-[12px]" role="status" aria-live="polite"
          style={{ background: "#242a32", borderColor: "#454d58", color: THEME.cream, boxShadow: "0 12px 30px rgba(0,0,0,.4)", animation: "kaiten-toast-in .2s ease both", zIndex: 300 }}>
          {toastMsg}
        </div>
      )}
    </div>
  );
}