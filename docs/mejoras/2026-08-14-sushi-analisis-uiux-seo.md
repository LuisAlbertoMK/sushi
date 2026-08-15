# Análisis UI/UX/SEO — Sushi Digital (diseño, degradados, temas, responsivo)

> `confidence: high` — Análisis read-only con lectura directa de 14+ archivos clave (globals.css, theme-config, theme-provider, layout root, Header, Footer, ThemeToggle, Button, Badge, ProductoCard, menu, promos, reservas, ChatBot).
> Fecha: 2026-08-14
> Baseline previo: `2026-08-14-sushi-auditoria-completa.md` (81 issues) — los fixes de contraste/temas ya aplicados se confirman, quedan gaps nuevos de diseño/responsivo.

---

## Resumen Ejecutivo — 16 issues de diseño UI/UX

| Área | CRITICAL | HIGH | MEDIUM | LOW | Total |
|------|----------|------|--------|-----|-------|
| Responsive/Nav | 1 | 1 | 1 | 0 | 3 |
| Temas/Dark | 0 | 3 | 2 | 0 | 5 |
| Degradados/Colores | 0 | 1 | 2 | 0 | 3 |
| SEO/Assets | 0 | 2 | 1 | 1 | 4 |
| A11y | 0 | 1 | 0 | 0 | 1 |
| **Total** | **1** | **8** | **6** | **1** | **16** |

---

## Prioridad 1 — CRITICAL

### 1. RESPONSIVE CRITICAL: Menú móvil NO funciona (botón sin acción)
- `src/components/layout/Header.tsx:88-101` — `MobileMenu()` es un `<button>` SIN `onClick` ni estado → el nav principal (`hidden md:flex`) desaparece en móvil y el hamburguesa NO abre nada
- **Impacto**: Usuarios móviles NO pueden navegar a Menú/Promos/Reservas → pérdida de conversión total en mobile (>60% tráfico)
- **Fix**: Implementar estado `open` + drawer/panel deslizante con links; o usar `details`/`summary` HTML nativo (cero JS)

---

## Prioridad 2 — HIGH

### 2. UI: Textos con `text-gray-600` NO dark-aware (2 archivos)
- `src/app/(public)/menu/page.tsx:63` — subtítulo
- `src/app/(public)/promos/page.tsx:32,43,58,76,81,90` — descripciones, fechas, "Pronto novedades"
- `src/app/(public)/reservas/page.tsx` (fecha/personas — verificado `text-gray-600`)
- **Fix**: → `text-muted-foreground` (dark: oklch(0.6) ✅ contrast 4.5:1)

### 3. UI: Badge variantes usan paleta hardcoded (yellow/orange/blue/green)
- `src/components/ui/Badge.tsx:12-17` — `bg-yellow-100 text-yellow-900`, etc. — NO siguen tokens theme
- **Impacto**: En dark mode, `bg-yellow-100` (muy claro) sobre fondo oscuro = alto glare + no respeta paleta personalizada del usuario (si elige blue, el badge "ready" sigue blue-100 hardcoded)
- **Fix**: Mapear a tokens OKLCH: pending→amber, cooking→orange, ready→blue, delivered→green, cancelled→destructive

### 4. UI: `focus-visible` global usa `--color-destructive` (rojo)
- `src/app/globals.css:113-116` — `outline: 2px solid var(--color-destructive)` → rojo en TODOS los focus
- **Impacto**: Inconsistente con paleta ámbar; foco "error" en elementos normales
- **Fix**: → `var(--color-ring)` (que ya es primary)

### 5. UI: Skip-link y backgrounds usan destructive en vez de primary
- `src/app/globals.css:101` — skip-to-content `background: var(--color-destructive)` → rojo
- **Fix**: → `var(--color-primary-700)`

### 6. SEED/SEO: OG image sigue apuntando a placeholder SVG
- `src/app/layout.tsx:55,68` — `og:image` y `twitter:image` usan `/images/sushi-og-placeholder.svg`
- **Impacto**: Al compartir en redes, se ve el SVG feo en vez de la foto real de sushi
- **Fix**: → `/images/products/01_sushi_variedad.jpg` (foto real)

### 7. UI: Degradados de promos mezclan primary con naranja hardcoded
- `src/app/(public)/promos/page.tsx:41` — `to-orange-50 dark:to-orange-950/30` — si el usuario cambia paleta a blue, la promo queda naranja
- **Fix**: → `to-primary-50/60 dark:to-primary-950/30` (consistencia)

### 8. A11Y: Botones delete en tablas sin `focus-visible:ring`
- `src/components/admin/CategoriaList.tsx:113`, `ProductoList.tsx:114`, `PromoList.tsx:69`, `PublicacionList.tsx:52` — `<button>🗑️</button>` sin focus ring explícito (solo hereda global outline)
- **Fix**: Añadir `focus-visible:ring-2 focus-visible:ring-ring rounded`

### 9. SEO: `hreflang` declara /en que no existe
- `src/app/layout.tsx:83-86` — `alternates.languages: {"es-AR": "/es", "en-US": "/en"}` pero NO hay rutas /es ni /en
- **Impacto**: Google crawlea 404s → señales negativas
- **Fix**: Eliminar `languages` o crear rutas reales

---

## Prioridad 3 — MEDIUM

### 10. UI: ThemeToggle + admin link pisan (bottom-right overlap)
- `src/components/ui/ThemeToggle.tsx:12` — `fixed bottom-4 right-4 z-50`
- `src/app/(public)/layout.tsx:48` — admin login `fixed bottom-4 right-4` → AMBOS en la misma esquina
- **Fix**: Mover admin link a otra posición (ej: footer) o subir ThemeToggle a `bottom-4 right-4` y admin a `bottom-20`

### 11. UI: ChatBot + ThemeToggle pisan parcialmente (bottom-32 vs bottom-4)
- `ChatBot.tsx:31` — `bottom-32 right-6`; ThemeToggle `bottom-4 right-4` → separados pero apretados en mobile
- **Fix**: En mobile, ChatBot → `bottom-24 right-4`

### 12. UI: Promos usa `bg-red-700` para código (rojo hardcoded)
- `src/app/(public)/promos/page.tsx:54` — `bg-red-700` para chip código → debería ser `bg-primary-700` (no es error/danger)
- **Fix**: → `bg-primary-700 text-white`

### 13. UI: `placeholder:text-gray-500 dark:placeholder:text-gray-400` repetido
- `src/app/(public)/reservas/page.tsx:95,108,123,138,149,169` — string de 6 clases duplicado 6×
- **Fix**: Crear className compartido o componente `Input` (existe `src/components/ui/Input.tsx` pero NO se usa)

### 14. UI: `focus:outline-none focus:ring-2` + `focus:outline-primary-500` redundante/conflictivo
- `reservas/page.tsx:95` — ambas clases a la vez → `outline-primary-500` no aplica (outline-none la mata)
- **Fix**: Quitar `focus:outline-primary-500`, dejar solo `focus:ring-2 focus:ring-ring`

### 15. UI: `bg-gray-100 dark:bg-gray-800` en ProductoCard (placeholder de imagen)
- `src/components/menu/ProductoCard.tsx:22` — debería ser `bg-muted dark:bg-muted`
- **Fix**: → `bg-muted`

---

## Prioridad 4 — LOW

### 16. UI: Botón "Pedir Ahora" usa `bg-amber-400` hardcoded en Hero
- `src/app/(public)/page.tsx:48` — `bg-amber-400 dark:bg-amber-300` → si usuario cambia paleta, CTA se queda ámbar
- **Fix**: → `bg-primary-600 dark:bg-primary-500` (o mantener ámbar como "accent" deliberado — decisión de diseño)

---

## PLAN DE IMPLEMENTACIÓN — Identidad Sushi + Menú con imágenes reales

> Aprobado por usuario 2026-08-14: "además de mejora de diseño algo más estilo sushi o tipografía, imágenes de esa índole; tenemos imágenes, podrías agregarlas a menú digital también D:\sushi\imagenes; agrégalo al plan y comienza su implementación"

### Fase A — Identidad visual sushi (tipografía + estilo)
- **A1. Tipografía japonesa**: Añadir `Noto_Sans_JP` (o `Zen_Kaku_Gothic_New`) como fuente display para headings (kanji-friendly, identidad sushi) + mantener Geist para body. Usar `next/font/google` con `display: swap`, subsets `latin` (para no inflar bundle con kanji). Aplicar `font-display` variable en headings (`.font-display`).
- **A2. Patrón decorativo sushi**: Textura sutil `enso` (círculo zen) + ondas en secciones destacadas (hero, CTA). Usar SVG inline data-URI (0KB request extra).
- **A3. Headings con identidad**: Headings de página (Menú, Reservas, Promos, Hero) usan `font-display` + tracking-tight para look premium japonés.

### Fase B — Fixes CRITICAL/HIGH del análisis
- B1. CRITICAL: MobileMenu funcional (drawer)
- B2. Badge → tokens OKLCH dark-aware
- B3. `text-gray-600` → `text-muted-foreground` (menu, promos, reservas)
- B4. focus-visible → ring (globals.css)
- B5. OG image → foto real (layout.tsx)
- B6. Promos gradient/código → primary
- B7. hreflang eliminado o rutas reales
- B8. Input component usado en reservas (DRY)

### Fase C — Menú digital con imágenes reales (D:\sushi\imagenes)
- **C1. Seed ampliado**: Los 5 productos existentes ya tienen fotos reales (`/images/products/01-05_*.jpg`). Ampliar seed con más productos (bebidas, postres, combos, entradas) usando imágenes 06-14 (`06_menu_portada`, `07_entradas`, `08_rollos_menu`, `09_nigiri_sashimi_menu`, `10_temakis_menu`, `11_extras`, `12_bebidas`, `13_postres`, `14_combos`, `15_delivery`).
- **C2. Mapeo imágenes → productos**: Cada categoría (Rolls, Nigiri & Sashimi, Especiales, + nuevas: Entradas, Bebidas, Postres, Combos) con imágenes reales correspondientes.
- **C3. Re-seed + verify**: Ejecutar seed, verificar imágenes cargadas en DB y que ProductoCard las renderice.

### Fase D — Verificación y commit
- D1. Build SUCCESS (31+ routes)
- D2. Commit + push
- D3. Persistencia Engram (mem_save)

---

## Síntesis por dimensión

| Dimensión | Verdict | Notas |
|---|---|---|
| Security | N/A | Sin cambios en este scope |
| UX/Frontend | 🔶 6.5 | Mobile nav roto = blocker; token consistency good overall |
| Performance | ✅ PASS | Imágenes lazy, fonts preloaded, bundle minimal |
| SEO | 🔶 6.0 | OG image placeholder + hreflang fantasma |
| Data | N/A | Sin cambios |
| DX | ✅ PASS | Components library existe (Input no usado) |
| Infra | N/A | — |
| Arch/Biz | ✅ PASS | Estructura route groups limpia |

**Score UX/Frontend**: 6.5 — Mobile nav CRITICAL es el único blocker real; resto son consistencia de tokens.

---

## Risk Matrix

| # | Risk | Severidad | Probabilidad | Mitigación |
|---|---|---|---|---|
| 1 | Mobile nav muerto → pérdida conversión mobile | 🔴 High | Alta (100% móviles) | Implementar drawer inmediato |
| 2 | OG placeholder → branding débil en redes | 🟡 Med | Alta | Apuntar a foto real |
| 3 | text-gray-600 en dark → contraste bajo | 🟡 Med | Media | Token muted-foreground |
| 4 | hreflang fantasma → 404s Google | 🟢 Baja | Baja | Eliminar languages |

---

## Recomendaciones (orden de implementación)

1. **CRITICAL**: MobileMenu funcional (drawer con links) — `Header.tsx`
2. Badge → tokens OKLCH (dark-aware + paleta personalizada)
3. `text-gray-600` → `text-muted-foreground` (menu, promos, reservas)
4. focus-visible → ring (globals.css)
5. OG image → foto real (`layout.tsx`)
6. Promos gradient/código → primary (no naranja/rojo)
7. Input component usado en reservas (DRY)
8. hreflang eliminado o rutas reales

---

## Engram Persistence

- Observation: pendiente de `mem_save`
- topic_key: `analysis/sushi`