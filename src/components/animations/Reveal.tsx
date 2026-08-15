// src/components/animations/Reveal.tsx — Reveal-on-scroll nativo (IntersectionObserver + CSS)
// confidence: high — sin dependencias (0KB bundle extra), respeta prefers-reduced-motion,
// los elementos parten visibles en CSS y solo se animan vía JS (no quedan ocultos si JS falla)
"use client";

import { useEffect, useRef, type ReactNode, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Retraso en ms antes de iniciar la animación (para stagger) */
  delay?: number;
  /** Dirección de entrada */
  from?: "bottom" | "left" | "right" | "none";
  /** Umbral de visibilidad (0-1) */
  threshold?: number;
  style?: CSSProperties;
}

export function Reveal({
  children,
  className,
  delay = 0,
  from = "bottom",
  threshold = 0.15,
  style,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // prefers-reduced-motion: no animar, dejar visible tal cual
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    // Estado inicial (solo si NO reduce-motion)
    const offset = from === "none" ? 0 : from === "bottom" ? 28 : 48;
    el.style.opacity = "0";
    if (from !== "none") {
      el.style.transform = `translateY(${offset}px)`;
    }
    el.style.transition = `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms`;
    el.style.willChange = "opacity, transform";

    let entered = false;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !entered) {
            entered = true;
            el.style.opacity = "1";
            el.style.transform = "none";
            observer.unobserve(el);
          }
        });
      },
      { threshold, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, from, threshold]);

  return (
    <div ref={ref} className={cn(className)} style={style}>
      {children}
    </div>
  );
}
