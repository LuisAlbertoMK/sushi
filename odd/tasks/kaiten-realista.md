# Feature: kaiten-realista — Cinta fotorrealista (fotos + materiales y luz)

## Objective
Make the kaiten belt look photorealistic: real dish photos as protagonists, richer materials (wood, porcelain, gloss), warm lighting. Same experiment branch, `main` untouched.

## Problem
Belt plates show small photos (74%) or plain emoji; porcelain/wood look flat despite the 3D intent.

## Why
User asked "algo más realista" and chose scope "Ambos a full" (fotos + materiales/luz) via blocking question.

## Scope
- IN (branch `experiment/kaiten-hero-moderno`, uncommitted):
  - T1 `KaitenMenu.tsx` + `globals.css` — fotos protagonistas: food-img full-bleed en el plato, rueda de categorías usa foto del primer producto (fallback emoji), gloss sobre la foto.
  - T2 `globals.css` (solo reglas `.kaiten-`/`.plate-`) — materiales y luz: vetas de madera en el stage, viñeta cálida, sombras profundas, brillo porcelana, aro dorado en hover. Claro y oscuro.
- OUT: belt RAF/drag, modal, cart/tray logic, data fetching, landing, main, cualquier commit (regla del usuario: sin commit hasta aprobación explícita).

## Constraints
- Solo visual: classNames/CSS + `imageUrl` con fallback (sin cambiar interacciones ni datos). Sin nuevas deps. es-AR.
- Respetar `prefers-reduced-motion` (ya cubierto) y foco visible.
- Route: direct inline (Task tool no disponible en free tier — evidencia ya registrada).

## Tasks
- [x] T1 — Fotos protagonistas (plato full-bleed, gloss, categorías con foto)
- [x] T2 — Materiales y luz (madera, sombras, ambiente cálido claro/oscuro)
- [x] T3 — Verificar eslint + tsc en archivos tocados, sin commit

## Authorized scope
Experiment branch autorizada por el usuario; alcance "Ambos a full" elegido. No-commit sigue vigente.

## TDD
- Mode: disabled (sin runner unitario; solo e2e Playwright no aplicable). Checks: eslint + tsc + visual en `/kaiten` vía `npm run dev:webpack`.

## Acceptance criteria
- Platos con foto real grande; categorías con foto (fallback emoji si no hay).
- Madera/luz/sombras visibles en claro y oscuro; interacciones idénticas.
- eslint/tsc limpios en lo tocado; `main` intacto; sin commit.

## Delivery
- `ask-on-risk`. Forecast ~80 líneas → sin split, sin PR hasta aprobación.

## Progress
- Exploration done (PorcelainPlate 194-210, belt item 811-859, wheel 1046-1049).

## Verification evidence
- `npx eslint KaitenMenu.tsx` → mismos 4 pre-existentes de base (111 hook condicional, 283 setState en efecto, 310 dep THEME.gold, 549 Date.now), solo corridos +5 líneas por el edit; nada en bloques nuevos (overlay, wheel foto, belt 72%).
- `npx tsc --noEmit` → sin errores en kaiten/globals.
- Tailwind v4 compila `globals.css` (109.854 bytes) con gloss, madera y aro dorado incluidos.
- Visual pendiente del usuario: `npm run dev:webpack` → `/kaiten` en claro y oscuro.
- Sin commit (regla del usuario). `main` intacto: rama `experiment/kaiten-hero-moderno`, sin commitear.

## Commit evidence
- `5843a83` feat(kaiten): premium hero, realistic belt and fix tray stacking (compartido con kaiten-hero-moderno).

## Next step
- Verificación visual del usuario en `/kaiten` (claro/oscuro) sobre el deploy de Vercel.
