# Implementación completada — Port de 4 features (menú kaiten React)

Fecha: 2026-08-18 · Archivos: `src/components/menu/KaitenMenu.tsx`, `src/app/globals.css` (solo estos dos).

## Decision Taken
Portadas las 4 features del ejemplo HTML de referencia al componente React KaitenMenu: búsqueda de platillos, platos de porcelana SVG (PorcelainPlate), cinta step-snap RAF y validaciones + shake, con cero errores nuevos de tsc/lint y build completo.

## Files Changed
- `src/components/menu/KaitenMenu.tsx` (937 líneas netas de cambio; 894 → 1264 líneas)
- `src/app/globals.css` (+152 líneas, −5 líneas por keyframes muerto `kaiten-belt-scroll`)

## Key Findings
1. [HIGH] Búsqueda — estados `searchQuery`/`searchResults`/`searchMode` + `allSearchItems` (useMemo) + `runSearch`/`resetSearch`; modos `normal|static|belt|empty`; input con aria-label, contador `aria-live="polite"`, grid estático para ≤5 y cinta filtrada para >5; búsqueda en `nombre + descripcion + categoria.nombre` con `toLocaleLowerCase("es-MX")` e `indexOf`. Reset al limpiar la query.
2. [HIGH] PorcelainPlate — componente React (sin dangerouslySetInnerHTML) con `.plate-3d/.plate-shadow/.plate-face/.food-img`; variables `--porcelain-1/2/3`, `--gold`, `--ink`, `--muted`, `--cream` scoped a `.kaiten-stage` (no contaminan :root); usado en platos de categoría, items de cinta y cards del grid de búsqueda; handlers hover/focus adaptados al selector `.plate-face`.
3. [HIGH] Cinta step-snap — reemplazo total del loop CSS (`beltDuration`/`beltRunning`/`kaiten-belt-scroll` eliminados) por sistema RAF: refs `beltScrollPosRef/beltVelocityRef/beltDraggingRef/beltDragStartRef/beltLastRef/beltOffsetsRef/beltWidthsRef/beltSetWidthRef/beltWrapWidthRef/beltAnimationRef/beltHoverPausedRef`; `measureBelt()`/`beltFrontIndex()`/`stepBelt(dir)`/`endBeltDrag()`/`beltFrame()` portados; items triplicados x3 con key `${p.id}-${copy}-${i}`; drag con pointer capture, tap → click, teclado (←/→/Enter/Espacio), botones ‹/›, `touch-action:none`, auto-scroll 46px/s × speedMult, depth scaling (0.86+0.18t, 0.75+0.25t, focusRadius 150); reduced-motion → paso instantáneo sin animación.
4. [MEDIUM] Validaciones — `validateProductData` (chequea nombre/precio/categoriaId) antes de `addItem` en `addFromModal` con console.warn + toast "No se pudo agregar"; `sanitizeQuantity` aplicado a la cantidad al agregar; `escapeHtml` exportado como utilidad (React ya escapa JSX); shake `.quantity-invalid` (240ms) vía `data-product-id` sobre el item de la cinta.

## Verification
- `npx tsc --noEmit` → pasa SIN errores.
- `npm run lint` → KaitenMenu.tsx tiene exactamente los MISMOS 2 errores preexistentes que HEAD (verificado contra `git show HEAD:`: `react-hooks/set-state-in-effect` en el efecto reduced-motion y `react-hooks/purity` por `Date.now()` en `endDrag` del wheel). Cero errores/warnings nuevos introducidos por esta implementación. El repo en su conjunto ya arrastraba 25 errores en otros archivos (rutas admin, playwright.config, etc.) — no tocados.
- `npm run build` → completó OK (tabla de rutas generada, incluye `/kaiten`).

## Nuance / Escalations
- **`validateProductData(p: any)` → `p: unknown`**: el spec daba `any` verbatim, pero `@typescript-eslint/no-explicit-any` es error en este repo. Se adaptó a `unknown` + narrowing (`Record<string, unknown>` + typeof checks) — comportamiento idéntico, cumple lint y "nada de any suelto".
- **`escapeHtml` definido pero no aplicado al texto JSX**: React escapa automáticamente el texto/atributos; aplicarlo causaría doble-escape visible (ej. "Sake & Roll" → "Sake &amp; Roll" literal). Se exporta como utilidad (spec lo exige) y se documenta; el componente no arma innerHTML.
- **`sanitizeQuantity(1)` en `addItem`**: el spec define la función pero no la cablea a ningún lado; se aplica a la cantidad al agregar desde el modal como punto natural (garantiza cantidad 1..99). Sin cambio de comportamiento.
- **`beltDragStartRef` incluye `y`** (spec decía `{x,pos,time}`): necesario para la detección de tap (`dist < 6` requiere distancia en Y), igual que el ejemplo vanilla.
- **`hoverPaused` (state) eliminado**: solo lo usaba la cinta; reemplazado por `beltHoverPausedRef` como pide el spec.
- **Modal tocado solo lo mínimo**: fallback de imagen/kicker usa `modalCategory` (derivado de `modalProduct.categoriaId`) en lugar de `selected`, que es `null` cuando el modal se abre desde resultados de búsqueda.
- **Cambios preexistentes en working tree no tocados**: `src/app/(public)/kaiten/page.tsx` y `src/app/layout.tsx` ya estaban modificados antes de esta tarea.
- **Pulso existente preservado**: el item agregado mantiene la animación `kaiten-pulse-taken` vía clase `.plate-pulse .plate-face` (antes inline sobre el span porcelana).