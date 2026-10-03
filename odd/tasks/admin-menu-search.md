# admin-menu-search

Feature document created 2026-10-02. Branch: `experiment/kaiten-hero-moderno`.
Follows `admin-demo-hardening.md` and `demo-polish.md` (both shipped and pushed).

## Goal

Make it fast to find a product in `/admin/menu` as the catalogue grows. Today the table renders
all 33 products (7 categories, up to 6 per category) with no way to narrow it, so the admin has to
scroll and read.

## Authorized scope

User selected: "Búsqueda + filtro de categoría en Productos".

In scope:
- T1 — Search input over products (name + category + ingredients, accent and case insensitive) with a live result counter, clear action, empty state and Escape-to-clear.
- T2 — Category filter (select) combined with the search, plus the editing row exempted from filtering so it cannot disappear under the cursor.

## Non-goals (documented follow-ups)

- Search/filters in `/admin/pedidos` and `/admin/reservas` (better long-term candidates because those lists grow on their own).
- Availability filter (Todos / Disponibles / No disponibles) — the catalogue currently has 0 unavailable products.
- Category list search (7 rows, not worth it).
- Server-side search / pagination (33 rows today; the page already ships all products to the client).
- Global admin toolbar, keyboard shortcut (`/`) to focus the search.

## TDD mode

`disabled`. No runnable unit runner in the repo and Playwright e2e cannot run (no chromium build,
`@playwright/test` wants firefox-1538 while only firefox-1532 is cached). Verification is a
disposable Playwright probe outside the repo plus `tsc`, `eslint`, `next build`.

## Tasks

- [x] T1 — Search input with counter, clear, empty state and Escape-to-clear.
- [x] T2 — Category filter and editing-row exemption, combined with the search.

## Acceptance criteria

- Typing `atun` finds `Atún picante` (accent-insensitive), typing `wasabi` finds products by ingredient, typing a category name narrows to that category.
- The counter reflects the visible subset and is announced politely.
- Clearing (button or Escape) restores the full list; a query with no matches shows an explicit empty state naming the query.
- The category filter combines with the text query, and the row being edited never disappears because of the filter.
- Inline edit, delete, pending and error behaviour from the previous features keep working; `tsc` and `eslint` stay clean.

## Delivery

- `ask-on-risk`. Commit granularity requested again before committing (standing user rule).

## Progress

- 2026-10-02: feature doc created; implementation not started.
- 2026-10-02: T1 and T2 implemented inline in `ProductoList.tsx` (single file) and verified in a real browser.

## Verification evidence

Browser probe against the running dev server, with expectations cross-checked against the database:

- Baseline: 33 data rows, counter `33 de 33 productos`.
- `atun` (no accent) → 3 rows, counter `3 de 33 productos (filtrados)`. The database has exactly 3 products matching `Atún` in name or ingredients, so accent-insensitive matching works.
- `wasabi` (ingredient only) → 5 rows; the database has exactly 5 products with wasabi in their ingredients.
- `bebidas` (category name) → 5 rows, matching the 5 products in the Bebidas category.
- Category filter `Postres` → 4 rows, matching the 4 Postres products.
- `Postres` + `atun` → 0 rows with the explicit empty state `No hay productos que coincidan con «atun».`
- Clear button → query empty and 33 rows again; `Escape` clears the query while the category filter correctly stays applied (4 rows with Postres selected).
- Editing-row exemption: with `atun` filtered and one row in edit mode, switching the query to `bebidas` leaves 6 rows (5 matches + the edited row) and the editor still visible holding `Rainbow Roll`.
- `tsc --noEmit` exit 0; `eslint` on the file exit 0.
- `next build` not re-run for this change: the user's dev server is serving port 3000 and a concurrent build would fight over `.next`; the type check plus the live browser probe cover the change (all logic is client-side in one component).

## Commit evidence

- `7ab6aa2` feat(admin): add product search and category filter
- `c2a5170` docs(odd): record the admin menu search and forms features

Baseline before this feature: `9c6f460`.
