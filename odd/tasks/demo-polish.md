# demo-polish

Feature document created 2026-10-02. Branch: `experiment/kaiten-hero-moderno`.
Follows `admin-demo-hardening.md` (blockers + admin majors already shipped and pushed).

## Goal

Remove the defects a client will actually notice while browsing the demo (desktop and phone),
without redesigning anything: floating controls covering content, mixed surfaces when the theme
is forced, admin chrome leaking customer UI, and three visibly wrong details (double currency
symbol, inconsistent cart counter, credentials prefilled in the login form).

## Authorized scope

User selected the option: "Paquete de pulido visible para el cliente — M7 (cluster flotante en
móvil), M8 (tema claro sobre SO oscuro), M9 (chat/toggle y `<main>` en admin), doble $, contador
del carrito y login sin credenciales precargadas".

## Non-goals (still documented follow-ups)

- M11: kaiten modal focus trap, `Header` `focus:outline-none` overriding the focus-visible ring.
- Dead code cleanup (`ui/Button.tsx`, `FormField`, `escapeHtml`, duplicated social markup).
- `/pedidos/track` search label, emoji-only buttons on `/pedidos`, 24px touch targets, toast overlap.
- `/demos/moderno` isolation from the production bundle.
- Redesign work (Figma kaiten, hero experiments).

## TDD mode

`disabled`. No runnable unit runner in the repo; Playwright e2e cannot run (no chromium build,
`@playwright/test` wants firefox-1538 and only firefox-1532 is cached). Verification is
proportionate functional/structural evidence: disposable Playwright + HTTP probes outside the
repo (`D:/tmp-ui-review`), `tsc`, `eslint`, `next build`.

## Tasks

- [x] T1 — M7: floating cluster (theme/color/chat) must not cover content or the kaiten tray on narrow viewports.
- [x] T2 — M8: forcing a theme must override every semantic token (`--muted`, `--muted-foreground`, status) so surfaces do not mix.
- [x] T3 — M9: single `<main>` landmark in admin, customer chat out of admin routes, speculation rules must not prefetch `/admin/*`.
- [x] T4 — Client-visible details: promo double `$`, cart counter consistency, login without prefilled credentials / credentials in the URL / open redirect.
- [x] T5 — Same defect family as T3 of admin-demo-hardening: the four admin create forms must not silently reload after a failed mutation.

## Acceptance criteria

- At 390px and 1280px, no fixed control overlaps footer links, the admin link, or the kaiten tray (measured rects).
- Forced light theme on a dark OS renders admin cards and page background from the same token set (no dark `bg-muted` under light cards).
- `/admin/*` renders exactly one `<main>`, no customer chat bubble, and the speculation-rules script excludes `/admin/*`.
- Promo discount reads `-$15.00`; the header badge and the mini-cart header show the same count; the login form ships empty fields, posts (not GETs) before hydration, and rejects an external `callbackUrl`.
- Admin create forms surface failures inline instead of reloading as if they had succeeded.

## Delivery

- `ask-on-risk`. Commit granularity requested again before committing (standing user rule).

## Progress

- 2026-10-02: feature doc created; implementation not started.
- 2026-10-02: T1 delegated to a bounded writer with the overlap probes as acceptance test; T2, T3, T4 done inline; T5 delegated to a bounded writer. All five verified.

## Verification evidence

- T1 (measured, both widths): before — the chat bubble covered the footer link `Contacto` on all five public routes at 390px and 1280px, and the theme cluster covered the kaiten tray control `ver orden ▾`. After — `probe7` reports `interactive covered: none` for all 10 route x width combinations and `probe8` reports an empty `clusterOverTray` at both widths (independently re-run by the parent). `probe9` confirms the compact mobile cluster still exposes `Cambiar a modo oscuro` and `Abrir chat`, keeps `Cambiar color del tema` available from `sm` up, and the expanded tray stays inside the viewport.
- T2 (measured, four scenarios): forced light on a dark OS now yields `html.light` with `--muted: oklch(0.94 0 0)` and `--muted-foreground: oklch(0.5 0 0)` (before: dark values under light cards). OS-dark + auto and OS-light + forced dark both yield `html.dark` with the dark tokens and dark status badges; OS-light + auto yields the light set. Fix: `@media (prefers-color-scheme: dark) { :root:not(.light) }` plus the provider toggling `.light`/`.dark`.
- T3 (measured): `/admin/dashboard`, `/admin/menu` and `/admin/pedidos` now report exactly 1 `<main>` (was 2), no `Abrir chat` button, and keep the theme toggle; `/kaiten` keeps the chat button and 1 `<main>`. The speculation-rules script parses as JSON and now contains `and: [href_matches /*, not href_matches /admin/*]`.
- T4 (measured): after two adds the header badge reads `Carrito (2 items)` and the mini-cart header `Tu Carrito (2)` (before: 2 vs 1). Login ships empty fields, the submit enables after hydration, `?callbackUrl=https://evil.example.com/phish` lands on `/admin/dashboard` while `?callbackUrl=/admin/pedidos` still lands on `/admin/pedidos`. `formatearPrecio(15)` returns `US$ 15,00`, so the promo discount rendered `-$US$ 15,00` and now renders `-US$ 15,00`.
- T5 (measured in a browser): a product create with `imagen: "foo.jpg"` shows the inline `role="alert"` (`Datos inválidos`), preserves the typed name and image, re-enables the submit and creates no row; the same create with `/images/products/qa-temp.jpg` shows the success message, resets the form and the row appears in the list. Transient product deleted afterwards (productos back to 33).
- Global: `tsc --noEmit` exit 0; `eslint` exit 0 on every touched file (only the two pre-existing unused-variable warnings in `ThemeToggle.tsx`); `next build` exit 0.

## Commit evidence

Work-unit commits on `experiment/kaiten-hero-moderno` (pushed to origin):

- T1 `9837e72` fix(ui): keep floating controls clear of content
- T2 `4b29249` fix(theme): stop the system dark tokens leaking into a forced light theme
- T3 `74f36a3` fix(admin): scope customer chrome and remove the nested main landmark
- T4 `d6d72ac` fix(ui): correct the promo discount, the cart counter and the login form
- T5 `e6092a8` fix(admin): surface failed creates in the admin forms
- Docs `5151140` docs(odd): record the demo polish tasks and verification evidence

Baseline before this feature: `fe7fcea`.
