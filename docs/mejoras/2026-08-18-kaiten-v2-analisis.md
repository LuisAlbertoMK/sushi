# Análisis — Qué se tomó del ejemplo kaiten v2 (sushictory corregido)

Fecha: 2026-08-18 · Fuente: `docs/ejemplos/menu_kaiten_3d_realista_estilo_sushictory_corregido_v2.html`
Resultado: **4 correcciones portadas a `src/components/menu/KaitenMenu.tsx`** + verificación E2E 4/4.

---

## 1. Ya portado del `final.html` (fase 1, commit `06349f8`) — el v2 no aportaba nada nuevo ahí

| Feature | Ubicación | Evidencia |
|---|---|---|
| Fuentes Bebas Neue + Permanent Marker + Noto Sans JP | `src/app/layout.tsx:24-33` | next/font/google, self-hosted, sin CDN. **Nota:** solo se aplican dentro del kaiten (`.font-bebas`/`.font-brush`); los headings del resto del sitio usan `--font-display` = Noto Sans JP (ver §5) |
| Validaciones: producto válido, precio finito ≥0, cantidad 1-99, búsqueda ≤120 chars | `validateProductData` (KaitenMenu.tsx:79), `sanitizeQuantity` (:88) | mismas reglas del v2 |
| Búsqueda 3 modos (static ≤5 / belt >5 / empty) | KaitenMenu.tsx | portado en fase 1 |
| Plato porcelana 3D, mesa, cinta step-snap, toast, modal | KaitenMenu.tsx + globals.css | portado en fase 1 |

## 2. Correcciones del v2 — portadas (commit `0755326`)

El v2 es una versión **corregida** del final. Diferencias reales encontradas y portadas:

| Corrección | Problema del port/final | Fix portado |
|---|---|---|
| **plateHalf dinámico** | 36 hardcodeado → anillo orbital +8px descentrado | `offsetWidth/2` real medido del primer plato (updateGeometry, KaitenMenu.tsx ~L344-360), fallback 36 |
| **Giro por defecto** | reduced-motion forzaba `playing=false` | `isPlaying=true` sin override; reducedMotion solo gatea stepBelt/RAF/aviso |
| **Hover pausa en mesa** | no existía | `wheelHoverPausedRef` + onPointerEnter/Leave en el wheel + gate en RAF (~L184, L867-868, L394) |
| **Belt finito de búsqueda** | x3 copias + loop infinito en modo belt | 1 copia + clamp `[0, maxScroll]` en stepBelt/onBeltPointerMove/RAF; shift sin `mod()` (~L331, L524-535, L554-568, L586-589, L658-677) |

## 3. Evaluado y NO tomado (descartado con evidencia)

- **Canvas Three.js** (`threeTableCanvas` del v2): descartado en fase 1 — la mesa 3D real la hace CSS/JS puro del port, sin dependencia pesada.
- **Clases CSS `search-static-belt` / `search-finite-belt`**: el v2 las necesita porque su belt es un solo bloque; el port ya tiene grid estático separado para ≤5 resultados, así que solo faltaba la lógica finita (JS), que es lo portado.
- **"Submenús / validaciones en submenús"**: el v2 **no tiene** submenús ni acordeones — solo los validadores ya portados (producto, precio, cantidad, búsqueda). Nada pendiente ahí.

## 4. Verificación (commit `d1c733f` — tests/e2e/verify-v2-fixes.spec.js)

- Anillo orbital centrado: avgX=0.0 / avgY=0.0 (antes +8/+8) — plato frontal sin offset
- Giro por defecto: 105px en 1.5s con reduced-motion activo
- Hover pausa: 4px (pausado) → 85px (reanudado)
- Belt finito: 15 ítems únicos, sin triplicar; freno en maxScroll (242 ≤ 466)

**confianza: high** — todo respaldado por diffs de commits, greps y mediciones Playwright.

## Archivos relacionados

- `src/components/menu/KaitenMenu.tsx` — fixes v2 aplicados (+89/−61)
- `tests/e2e/verify-v2-fixes.spec.js` — suite de verificación 4/4 pass
- `docs/agentes/port-4-features/05-implementacion-completada-fixes.md` — reporte del implementer