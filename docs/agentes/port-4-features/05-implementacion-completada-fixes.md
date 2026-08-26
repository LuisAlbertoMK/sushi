# Implementación completada — 4 fixes de corrección (KaitenMenu.tsx)

Fecha: 2026-08-18 · Archivo único: `src/components/menu/KaitenMenu.tsx` (1292 líneas, +89/−61 netos).

## Decision Taken
Aplicados los 4 fixes del spec (plateHalf dinámico, giro por defecto, hover-pausa en mesa, belt finito de búsqueda) portados del ejemplo v2 de referencia, con `tsc --noEmit` en cero errores.

## Files Changed
- `src/components/menu/KaitenMenu.tsx` (único archivo modificado; confirmado con `git status`/`git diff`)

## Fixes Aplicados
1. **FIX 1 — plateHalf dinámico** (`updateGeometry`, ~L344-360): se mide `plateElsRef.current.values().next().value.offsetWidth / 2` con fallback 36; rx/ry (0.78/0.72) intactos. `updatePlates` (L369-370) consume el valor corregido → platos alineados al radio orbital.
2. **FIX 2 — giro SIEMPRE por defecto** (efecto reduced-motion, L200-208): eliminados ambos `setPlaying(...)`; el efecto solo setea `setReducedMotion`. `playing` nace `true` (L155) y solo cambia por el botón pausa (L976). `reducedMotion` sigue gateando stepBelt, belt RAF y el aviso (sin tocar).
3. **FIX 3 — hover pausa el wheel**: `wheelHoverPausedRef` (L184), `onPointerEnter/Leave` en el div del wheel (L867-868), y gate `!wheelHoverPausedRef.current` en el auto-rotate del RAF (L394). Deps del effect sin cambios (refs no son deps).
4. **FIX 4 — belt finito para búsqueda**: `const beltFinite = searchMode === "belt"` (L331) ramifica:
   - Render (L1092-1099): `beltFinite ? beltItems : [...x3]` con `copy = beltFinite ? 0 : ...`; cuerpo extraído a `renderBeltItem(r, i, copy)` tipado (L720) — sin duplicar JSX, key `${p.id}-${copy}-${i}` intacta.
   - `measureBelt` (L524): `n = els.length / (beltFinite ? 1 : 3)`, deps `[beltFinite]`.
   - `beltFrontIndex` (L535-536): shift sin `mod()` en finito, `n = offsets.length / (beltFinite ? 1 : 3)`.
   - `stepBelt` (L554-568): n por copias; en reducedMotion + finito, clamp `[0, maxScroll]`.
   - `onBeltPointerMove` (L586-589): clamp finito en drag.
   - RAF belt (L658-677): `maxScroll = max(0, setWidth - wrapWidth)`; auto-scroll se frena si `pos >= maxScroll` en finito; clamp por frame en finito; shift sin `mod()` en finito.

## Verification
- `npx tsc --noEmit` → **exit 0, 0 errores**.
- Revisión por Read de cada región: plateHalf medido del primer plato; efecto reduced-motion ya no toca `playing`; `wheelHoverPausedRef` declarado + handlers en el wheel + gate en RAF; belt renderiza 1 copia con `copy=0` en `searchMode==="belt"` y 3 copias en categoría normal; clamp `[0, maxScroll]` presente en stepBelt/onBeltPointerMove/RAF.
- `git diff --stat` → solo `KaitenMenu.tsx` modificado. Untracked (docs/ejemplos, screenshots) preexistentes, no tocados.

## Escalations / Notas
- Ninguna decisión fuera del spec. Se usó la variante recomendada por el spec para `beltFinite` en callbacks: agregarlo a las deps de `useCallback`/`useEffect` (measureBelt, beltFrontIndex, stepBelt, onBeltPointerMove, RAF belt) en lugar de un ref extra.
- En modo finito, si todos los items caben en el wrap (`maxScroll = 0`), el auto-scroll y el paso instantáneo quedan inmóviles (track ya visible completo) — comportamiento consistente con el v2.
- El lint preexistente (`react-hooks/set-state-in-effect` en el efecto reduced-motion, reportado en la tarea anterior) sigue presente porque el efecto conserva `setReducedMotion`; no es parte de los criterios de verificación de esta tarea (solo tsc).