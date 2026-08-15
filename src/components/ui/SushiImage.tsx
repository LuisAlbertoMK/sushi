// src/components/ui/SushiImage.tsx — Image responsivo con fallback accesible + blur
// confidence: high — evita broken images, skeleton con timeout de seguridad, lazy loading
"use client";

import Image, { ImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const PLACEHOLDER_SRC = "/images/sushi-placeholder.svg";

export function SushiImage({
  src,
  alt,
  width,
  height,
  className,
  sizes,
  priority = false,
  ...props
}: Omit<ImageProps, "width" | "height"> & {
  width?: number | `${number}`;
  height?: number | `${number}`;
}) {
  // Estado: src actual + si la imagen ya cargó
  const [imgSrc, setSrc] = useState(src);
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Alt es obligatorio para accesibilidad (WCAG 1.1.1)
  if (!alt) {
    console.warn("SushiImage: prop `alt` es obligatoria para accesibilidad");
  }

  // Timeout de seguridad: si onLoad no dispara (cache/Turbopack), quitar skeleton igual
  useEffect(() => {
    if (!loaded) {
      timeoutRef.current = setTimeout(() => setLoaded(true), 2500);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [loaded, imgSrc]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setSrc(PLACEHOLDER_SRC);
      setLoaded(true); // el placeholder SVG carga o no — mostramos algo
    }
  };

  const handleLoad = () => setLoaded(true);

  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      {!loaded && (
        <div
          className={cn(
            "absolute inset-0 z-10 flex items-center justify-center",
            "bg-gradient-to-br from-muted to-muted/60 animate-pulse"
          )}
          aria-hidden="true"
        >
          <span className="text-muted-foreground/60 text-xs">🍣</span>
        </div>
      )}
      <Image
        src={imgSrc}
        alt={alt || ""}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          className
        )}
        {...props}
      />
    </div>
  );
}