# admin-demo-hardening

Feature document created 2026-10-02. Owner: parent orchestrator. Branch: `experiment/kaiten-hero-moderno`.

## Goal

Remove the demo-breaking UI defects found in the runtime UI review (2026-10-02) so `/admin/*`
and `/kaiten` survive a client-facing demo, and make failed admin mutations visible instead of
silently pretending success.

## Authorized scope (source of the contract)

The user selected the option: "Blockers + errores silenciosos de mutaciones (M1/M2), Icon,
mini-carrito, loading/error boundaries y responsive de tablas admin".

In scope:
- T1 (blocker B1): `/admin/pedidos` returns HTTP 500 with any pedido present.
- T2 (blocker B2): `/kaiten` product modal, toast and dark chips are unreadable in light theme.
- T3 (M1/M2): silent admin mutation failures — no `res.ok` checks, wrong `ProductoList` payload.
- T4 (M3/M4): `Icon` announces nothing; mini-cart closes only on mouse leave.
- T5 (M5): no `loading.tsx` / `error.tsx` boundaries on DB-bound admin segments.
- T6 (M10): admin tables overflow horizontally on narrow viewports.

## Non-goals (documented follow-ups, not authorized yet)

- M7: floating cluster (theme/color/chat) overlaps footer content on narrow viewports (design decision).
- M8: `theme-provider` does not override `--muted*`/status tokens (forced light on dark OS).
- M9: nested `<main>`, admin receiving customer ChatBot/ThemeToggle, speculation-rules scope.
- M11: kaiten modal focus trap; `Header` `focus:outline-none` overriding the global focus-visible ring.
- All minor findings from the review (double `$` in PromoList, login form `method`, open redirect,
  prefilled credentials, emoji-only buttons, dead code, cart count mismatch, demo route isolation).

## TDD mode

`disabled`. Reason: this repo has no runnable unit runner (no vitest/jest); Playwright e2e exists
but no chromium build is installed and `@playwright/test` wants firefox-1538 while only firefox-1532
is cached. Verification is therefore proportionate functional/structural evidence:
disposable Playwright + HTTP probes run outside the repo (in `D:/tmp-ui-review`), plus `tsc` and `eslint`.

## Tasks

- [x] T1 — Extract `EstadoSelector` from the server page into a client component; `/admin/pedidos` must render 200 with a pedido present.
- [x] T2 — Route always-dark surfaces (modal, toast, dark chips) through surface-safe tokens so light theme stays readable.
- [x] T3 — Fix `ProductoList` inline edit payload and add real error handling to admin mutations.
- [x] T4 — Fix `Icon` accessibility and mini-cart keyboard dismissal.
- [x] T5 — Add `loading.tsx` + `error.tsx` boundaries for the admin segment.
- [x] T6 — Add horizontal scroll wrappers to admin tables that overflow on narrow viewports.

## Acceptance criteria

- `/admin/pedidos` returns 200 and renders a state selector for every pedido (verified with a transient order, then removed).
- Kaiten modal title/labels contrast >= 4.5:1 in light and dark theme (measured in a real browser).
- Admin list mutations surface failures; `ProductoList` edit round-trips successfully.
- `Icon` exposes its label to assistive tech; mini-cart closes with Escape and returns focus.
- Admin routes render a loading state and a friendly error state instead of a blank frame.
- No horizontal document overflow on admin pages at 390px width.

## Delivery

- `ask-on-risk`. No commit and no push until the user explicitly authorizes (standing user rule).
- Writes stay single-threaded in the parent session.

## Progress

- 2026-10-02: feature doc created after the runtime UI review; implementation not started.
- 2026-10-02: T1 done. T2 done. T3 delegated to a bounded writer.
- 2026-10-02: T3 done after an independent verifier refuted the first attempt (see below); T4, T5, T6 done inline. Production build green.
- Scope addition during T3: `src/lib/validations.ts` (T3b). The API rejected its own seed data — all 33 seeded products store site-relative image paths while `productoSchema.imagen` required `.url()`, so any product write carrying an image failed with 400. The image field now accepts an absolute URL or a site-relative path, consistently for producto/promocion/publicacion.

## Verification evidence

- T1: `/admin/pedidos` returned 200 (42994 bytes) with a transient pedido present, contained the `Cambiar estado del pedido` selector, and the dev log recorded 0 `Event handlers cannot be passed` errors (previously 500 with digest 876406472). Transient row deleted afterwards (`remaining 0`). `tsc --noEmit` exit 0; `eslint` on both touched files exit 0. Re-verified at 390px width with a real order and one line item.
- T2: modal title computed color measured in a real browser is `rgb(239, 228, 207)` in light and dark theme (was `rgb(42, 31, 23)` on a `#20252d` surface, ~1.04:1). Screenshot `D:/tmp-ui-review/kaiten-light-modal.png`. `tsc` exit 0; `eslint` on `KaitenMenu.tsx` reports the same 4 pre-existing findings as before the change.
- T3: independent `gentle-ai-verify` run confirmed `tsc` 0, `eslint` 0 on the six files, no remaining `window.location.reload()` in them, `adminMutate` cannot throw (four failure branches exercised), allowed surfaces respected, no commit created. It REFUTED the payload claim: with the product's own current values the PATCH still returned 400 because seeded images are relative paths. After T3b the same idempotent PATCH returns 200 (DB values unchanged) and the negative cases still return 400 (`imagen: ""`, `imagen: "foo.jpg"`). Schema branch matrix: site-relative ACCEPT, absolute URL ACCEPT, protocol-relative ACCEPT, omitted ACCEPT, empty REJECT, bare filename REJECT.
- T4: 5 `role="img"` nodes in the header/floating UI, all 5 expose `aria-label` (Carrito, Carrito, Cambiar color, Modo oscuro, Chat). Mini-cart: opens on click, closes on Escape, reopens, closes on outside click (real browser).
- T5: `src/app/admin/(auth)/loading.tsx` and `error.tsx` added; `next build` exit 0 includes the admin segment.
- T6: at 390px both `/admin/dashboard` and `/admin/pedidos` render with `documentElement.scrollWidth === innerWidth` (no page overflow) and each table's parent computes `overflow-x: auto`. Screenshots `D:/tmp-ui-review/admin-390-*.png`.
- Global: `tsc --noEmit` exit 0, `eslint` exit 0 on all 14 touched/added files, `next build` exit 0 (33 routes).

## Commit evidence

- Pending explicit commit authorization from the user. Working tree holds 11 modified + 5 new files (~276 insertions).
