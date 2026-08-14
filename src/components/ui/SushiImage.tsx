// src/components/ui/SushiImage.tsx — Image responsivo con fallback accesible + blur
// confidence: high — evita broken images, placeholder visual estético, lazy loading
"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";
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
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setSrc(PLACEHOLDER_SRC);
    }
  };

  const [imgSrc, setSrc] = useState(src);

  // Alt es obligatorio para accesibilidad (WCAG 1.1.1)
  if (!alt) {
    console.warn("SushiImage: prop `alt` es obligatoria para accesibilidad");
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {isLoading && (
        <div
          className={cn(
            "bg-gradient-to-br from-muted to-accent animate-pulse",
            "absolute inset-0 z-10",
            "flex items-center justify-center"
          )}
        >
          <span className="text-red-300 text-xs">Cargando...</span>
        </div>
      )}
      <Image
        src={imgSrc}
        alt={alt || ""}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        onLoad={() => setIsLoading(false)}
        onError={handleError}
        {...props}
      />
    </div>
  );
}
