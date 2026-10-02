# Feature: kaiten-hero-moderno — Hero premium + marco a juego en /kaiten (rama experimento)

## Objective
Apply the approved premium-hero language (demo-moderno-hero) to the real kaiten menu page, on an experiment branch, without touching `main`.

## Problem
/kaiten header looks dated (bebas h1 with emoji, flat subtitle, plain link) while the approved hero demo shows a modern hierarchy that the user wants to see applied to the kaiten flow.

## Why
User liked `demo-moderno-hero.preview.html` and chose scope "Cabecera y marco" via blocking question.

## Scope
- IN (branch `experiment/kaiten-hero-moderno` only):
  - T1 `src/app/(public)/kaiten/page.tsx` — premium hero band (eyebrow pill, display h1 sin emoji, subcopy, CTAs, mini trust row), light/dark via Tailwind tokens.
  - T2 `src/components/menu/KaitenMenu.tsx` header block only (lines ~892-912) — eyebrow + hierarchy polish, same copy, no logic change.
  - T3 `src/app/globals.css` — scoped `.kaiten-` chrome only: light-mode glass search input, result-card hover/border polish, empty-state light override. No belt/plate/modal/tray keyframes touched.
- OUT: belt RAF/drag mechanics, plate 3D CSS, modal, cart/tray logic, data fetching, landing, main branch, any commit (user rule: no commit until explicit approval).

## Constraints
- Zero logic changes: only JSX className/copy in header + scoped CSS. No new deps. Spanish UI copy (es-AR).
- Light/dark via `html.dark` class (ThemeProvider always syncs it). Accessible: keep h1, aria labels, focus-visible, contrast.
- Route: direct inline (delegated Task tool unavailable on free tier — recorded trigger evidence, executed inline).

## Tasks
- [x] T1 — Hero premium en `kaiten/page.tsx`
- [x] T2 — Marco del stage header en `KaitenMenu.tsx` (solo bloque header)
- [x] T3 — Chrome buscador + resultados en `globals.css` (solo reglas `.kaiten-`, light/dark)
- [x] T4 — Verificar eslint + tsc en archivos tocados, sin commit

## Authorized scope
User authorized experiment branch explicitly ("armar una rama de experimentacion sin pisar el main"). Scope "Cabecera y marco" chosen. No-commit-until-approval rule still in force.

## TDD
- Mode: disabled. Source: no unit runner configured (only Playwright e2e, not applicable to static chrome). Runner: none.
- Checks: `npx eslint` on touched files, `npx tsc --noEmit` filtered, visual via `npm run dev` → `/kaiten`.

## Acceptance criteria
- `/kaiten` shows premium hero band (light + dark), belt/search/modal behavior identical.
- `main` untouched (all changes on `experiment/kaiten-hero-moderno`, uncommitted until approval).
- eslint/tsc clean on touched files.

## Delivery
- Strategy: `ask-on-risk` (default). Forecast ~120 authored lines, under 400 budget → no PR split. No PR until user approves.

## Progress
- Branch created. Exploration done (page 34 lines, stage header/search chrome located).

## Verification evidence
- `npx eslint kaiten/page.tsx` → clean. `KaitenMenu.tsx` → 4 findings (líneas 111, 278, 305, 544, mecánica del belt/hooks) pre-existentes en base, ninguno en bloques editados (~893-920).
- `npx tsc --noEmit` → sin errores en kaiten/globals.
- Entorno reparado: `node_modules` venía de Windows (faltaban binarios linux de lightningcss/oxide) → `pnpm install` con `allowBuilds` en true + script `dev:webpack` en package.json (todo sin commit).
- Tailwind v4 compila `globals.css` (108KB, 19 reglas kaiten incluidas) vía PostCSS.
- Pendiente visual del usuario: matar servidor viejo (`kill 30898`), `npm run dev:webpack`, abrir `/kaiten` en claro y oscuro.
- Sin commit (regla del usuario). `main` intacto: todo en `experiment/kaiten-hero-moderno` sin commitear.

## Commit evidence
- `5843a83` feat(kaiten): premium hero, realistic belt and fix tray stacking (incluye también kaiten-realista).

## Next step
- Verificación visual del usuario en `/kaiten` (claro/oscuro) sobre el deploy de Vercel.
