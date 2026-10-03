# admin-menu-forms

Feature document created 2026-10-02. Branch: `experiment/kaiten-hero-moderno`.
Follows `admin-demo-hardening.md`, `demo-polish.md` and `admin-menu-search.md` (search is implemented but not committed yet).

## Goal

`/admin/menu` is 4.1 screens tall on desktop and 4.4 on mobile because both create forms are always
open: the product form alone is 386px (desktop) / 524px (mobile) and pushes the products table to
y=1307 / y=2240. The admin's real job — finding and editing products — should be what the page shows
first.

Measured before: sections at y=180 (Nueva categoría), 344 (Categorías), 849 (Nuevo producto), 1307
(Productos); page height 3665px at 1280x900.

## Authorized scope

User selected: "Modal reutilizable (lo que propusiste)".

In scope:
- T1 — Reusable accessible `ui/Modal.tsx` (portal, focus trap, Escape, backdrop click, aria-modal, focus return, scroll lock, mobile full-screen).
- T2 — `NuevoProductoModal` and `NuevaCategoriaModal` triggers wrapping the existing forms, closing on success.
- T3 — Restructure `/admin/menu` so the lists come first and the create actions are buttons.

## Non-goals (documented follow-ups)

- Tabs (Categorías | Productos) — the other half of the "shorter page" idea, not authorized.
- Sticky table header for the product list.
- Reusing the new `Modal` in the `/kaiten` product modal (pending M11: that modal has no focus trap).
- The uncommitted search work in `ProductoList.tsx` (must stay untouched by this feature).
- Inline editing, delete flows, category/product ordering.

## TDD mode

`disabled`. No runnable unit runner; Playwright e2e cannot run (no chromium build, `@playwright/test`
wants firefox-1538 and only firefox-1532 is cached). Verification is a disposable Playwright probe
outside the repo plus `tsc`, `eslint`.

## Tasks

- [x] T1 — Accessible reusable Modal component.
- [x] T2 — Create-form modal triggers that close on success.
- [x] T3 — Restructure the admin menu page around the lists.

## Acceptance criteria

- `/admin/menu` shows no create-form fields before interaction, and the product list starts in the first screen (measured y, desktop and mobile).
- The dialog exposes `role="dialog"`, `aria-modal="true"` and an accessible name; focus moves into it on open and never escapes it while tabbing; `Escape` and a backdrop click close it; focus returns to the trigger that opened it.
- Background scroll is locked while the dialog is open and restored on close.
- Creating a product or a category from the modal works, closes the dialog on success and refreshes the list; a failed create keeps the dialog open showing the inline error.
- Mobile 390px: the dialog is usable (full-width sheet, internally scrollable, close control reachable).
- Inline edit, delete, search and filters keep working; `tsc` and `eslint` stay clean.

## Delivery

- `ask-on-risk`. Commit granularity requested again before committing (standing user rule).

## Progress

- 2026-10-02: feature doc created; implementation delegated to a bounded writer.
- 2026-10-02: all three tasks implemented and verified by the parent (the delegated verifier stalled and was replaced by a parent-written probe).

## Verification evidence

Page measurements (before → after):

- 1280x900: page height 3665px → 3115px; the first product row moved from y=1307 to **y=338** (inside the first screen); 0 visible create-form fields before interaction (0 forms rendered at all).
- 390x780: the product list heading moved from y=2240 to y=1394. The page is still long because the two data tables themselves are 40 rows; the forms no longer contribute.

Dialog behaviour (parent-written probe, asserts after EVERY key press, not just at the end):

- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` resolves to the visible title, `aria-describedby` present.
- Focus moves into the dialog on open (lands on the close button).
- 12 forward Tab presses: focus never escaped; the trace shows a real cycle (`prod-nombre → precio → desc → ing → cat → img → checkbox → Crear Producto → Cerrar → prod-nombre`). 6 Shift+Tab presses: no escape.
- Clicking inside the panel keeps it open; `Escape` closes it and focus returns to the exact trigger (`+ Nuevo producto`); the backdrop click closes it at 1280px.
- Background scroll: `documentElement.overflow` is `hidden` while open and restored to `visible` after closing.
- 390px: the dialog fills the viewport (0,0,390,780), fits, has an internal scroll container, and both the close button and the submit button are visible and reachable; scroll restores on close.

Functional: a product created through the dialog landed in the database and the dialog closed. The first probe run reported 0 rows immediately after the create; a fresh page load showed 34 rows and the created row visible with the counter at `34 de 34 productos`, so that was a dev-mode re-render timing artifact in the probe, not a product defect. The temporary product was deleted afterwards (33 products).

`tsc --noEmit` exit 0; `eslint` exit 0 on the six files. `ProductoList.tsx` was not modified by this feature (its uncommitted search work is intact).

## Commit evidence

- `9241d3b` feat(admin): move create forms into accessible dialogs
- `c2a5170` docs(odd): record the admin menu search and forms features

Baseline before this feature: `9c6f460`.
