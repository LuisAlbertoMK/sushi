# Feature: demo-moderno-hero — Hero premium oscuro (demo aislado)

## Objective
Showcase a modern premium-dark hero for Sushi Bar without touching the landing, at `/demos/moderno`.

## Problem
Landing hero looks classic: heavy red gradient + emoji H1, flat cards, weak hierarchy.

## Why
User asked for "UI mas diseño algo nuevo pero moderno dame algunos demos". First demo: Hero premium oscuro (user choice).

## Scope
- IN: `src/app/demos/moderno/page.tsx` only (isolated, uses root layout, no header dependency).
- OUT: landing `src/app/(public)/page.tsx`, design system tokens, kaiten, admin, API, i18n.

## Constraints
- Next.js 16 App Router, Tailwind v4, existing oklch tokens in `globals.css`.
- Reuse `Reveal` (reduced-motion safe), `next/image`, existing images in `public/images/products/`.
- Accessible: semantic h1, focus-visible, contrast, alt text, no emoji in H1.
- No new deps. Spanish UI copy (project uses es-AR).

## Tasks
- [x] T1 — Scaffold `/demos/moderno` hero premium oscuro (glass, display type, floating cards)
- [x] T2 — Verify eslint + tsc del demo (lint repo y build con fallas pre-existentes/ambientales, documentadas abajo)
- [x] T3 — Work-unit commit SOLO tras tu aprobación explícita (regla del usuario)
- [x] T4 — Preview HTML Demo 2 bento menú (`demo-bento-menu.preview.html`), sin commit
- [x] T5 — Preview HTML Demo 3 trust + CTA (`demo-trust-cta.preview.html`), sin commit
- [x] T6 — Toggle claro/oscuro estándar en los 3 previews (botón fijo, respeta prefers-color-scheme, persiste en localStorage), sin commit

## Authorized scope
User authorized demo implementation via question answer "Hero premium oscuro". Route: direct inline (delegated Task tool unavailable — `OpenCode free tier can only be used from within OpenCode`, so mapping/writer triggers recorded but executed inline to avoid blocking).

## TDD
- Mode: disabled. Source: no unit runner configured (only Playwright e2e, not applicable to static demo). Runner: none.
- Checks: `npm run lint`, `npm run build`, manual visual at `/demos/moderno`.

## Acceptance criteria
- `/demos/moderno` renders dark premium hero, responsive (mobile stack / desktop 2-col), no console errors.
- No changes to `/` landing or other routes.
- Lint passes for new file.

## Delivery
- Strategy: `ask-on-risk` (default). Forecast ~180 authored lines, under 400 budget → single demo, no PR split.
- Native review candidate is the work-unit commit, never the checkbox list.

## Progress
- T1 pending implementation.

## Verification evidence
- `npx eslint src/app/demos/moderno/page.tsx` → clean (no output).
- `npx tsc --noEmit` → no errors in `demos/moderno`.
- `npm run lint` (repo) → 28 errors pre-existing on base (e.g. `src/lib/auth.config.ts` any, kaiten purity), none in new file.
- `npm run build` → blocked environmentally (Turbopack panic on pnpm symlinks under /run/media, leaves filesystem root). Pre-existing infra issue, not demo code.

## Commit evidence
- `1fcfe95` feat(demos): add modern premium hero demo route.

## Next step
- Verificación visual del usuario en `/demos/moderno` sobre el deploy de Vercel.
