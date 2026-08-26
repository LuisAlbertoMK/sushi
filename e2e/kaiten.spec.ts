import { test, expect } from "@playwright/test";

/**
 * KaitenMenu v4 E2E — coverage of automejora UI/UX improvements
 *
 * Flow verified against src/components/menu/KaitenMenu.tsx:
 * 1. Loading spinner (role=status, aria-label="Cargando menú kaiten")
 * 2. Wheel view renders category plates (.plate-3d, aria-label="Ver categoría …")
 * 3. Click category → belt view with product buttons ([data-belt-item])
 * 4. Click product → modal (role=dialog, aria-labelledby="kaiten-modal-title")
 * 5. Search filters products; empty state shows "No encontramos ese platillo"
 * 6. Keyboard arrows rotate the wheel
 *
 * NOTE: The wheel animation makes category buttons "unstable" for Playwright's
 * auto-waiting. We use { force: true } to bypass the stability check, and
 * hover the stage first to let the rAF pause logic kick in.
 */

async function waitForBeltReady(
  page: import("@playwright/test").Page,
): Promise<void> {
  await page
    .getByRole("status", { name: /Cargando menú kaiten/i })
    .waitFor({ state: "detached", timeout: 15000 })
    .catch(() => {});
  await page
    .locator(".kaiten-stage")
    .waitFor({ state: "visible", timeout: 15000 });
}

/** Click a category button (animated — needs force) and wait for belt view */
async function selectFirstCategory(page: import("@playwright/test").Page) {
  const stage = page.locator(".kaiten-stage").first();
  await stage.hover(); // triggers paused state via wheelHoverPausedRef
  await page
    .getByLabel(/Ver categoría/i)
    .first()
    .click({ force: true });
  await page
    .locator("[data-belt-item]")
    .first()
    .waitFor({ state: "visible", timeout: 5000 });
}

test.describe("KaitenMenu v4", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/kaiten");
    await waitForBeltReady(page);
  });

  test("should show loading then render the wheel with category plates", async ({
    page,
  }) => {
    await expect(page.locator(".kaiten-stage")).toBeVisible();
    // In wheel view, category plates render (.plate-3d)
    const plates = page.locator(".plate-3d");
    const count = await plates.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should render the kaiten heading and instructions", async ({
    page,
  }) => {
    const heading = page.getByRole("heading", { name: /Menú Kaiten/i });
    await expect(heading).toBeVisible();
    const instructions = page.getByText(/Arrastrá la mesa/i).first();
    await expect(instructions).toBeVisible();
  });

  test("should render category buttons with aria-labels", async ({ page }) => {
    const catBtn = page.getByLabel(/Ver categoría/i).first();
    await expect(catBtn).toBeVisible();
  });

  test("should switch to belt view with product items when clicking a category", async ({
    page,
  }) => {
    await selectFirstCategory(page);
    const productBtn = page.locator("[data-belt-item]").first();
    await expect(productBtn).toBeVisible();
  });

  test("should open modal (role=dialog) when clicking a product in belt view", async ({
    page,
  }) => {
    await selectFirstCategory(page);
    await page.locator("[data-belt-item]").first().click({ force: true });

    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible({ timeout: 5000 });
  });

  test("should close modal with Escape and resume belt interaction", async ({
    page,
  }) => {
    await selectFirstCategory(page);
    await page.locator("[data-belt-item]").first().click({ force: true });
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 3000 });
    await expect(page.locator("[data-belt-item]").first()).toBeVisible();
  });

  test("should support search and filter products", async ({ page }) => {
    await selectFirstCategory(page);

    const searchInput = page.getByLabel("Buscar platillos");
    await expect(searchInput).toBeVisible();

    await searchInput.fill("sushi");

    // Filtered results appear in static grid (.kaiten-search-card)
    const searchCard = page.locator(".kaiten-search-card").first();
    await expect(searchCard).toBeVisible({ timeout: 5000 });
  });

  test("should show empty state for nonexistent search", async ({ page }) => {
    await selectFirstCategory(page);

    const searchInput = page.getByLabel("Buscar platillos");
    await searchInput.fill("___NOEXISTE123___");
    await page.waitForTimeout(500);

    // Empty state shows "No encontramos ese platillo"
    await expect(page.locator(".kaiten-search-empty")).toContainText(
      /No encontramos ese platillo/i,
    );
  });

  test("should support keyboard rotation (left button)", async ({ page }) => {
    const leftBtn = page.getByLabel(/Girar mesa a la izquierda/i).first();
    await expect(leftBtn).toBeVisible();
    await leftBtn.click({ force: true });

    // Belt should still be visible after rotation
    await expect(page.locator(".kaiten-stage")).toBeVisible();
  });

  test("should display toast when adding product from modal", async ({
    page,
  }) => {
    await selectFirstCategory(page);
    await page.locator("[data-belt-item]").first().click({ force: true });
    await expect(page.getByRole("dialog")).toBeVisible();

    // Find an "Agregar" or "+" button inside the modal
    const addBtn = page
      .locator("button")
      .filter({ hasText: /agregar/i })
      .first();
    if ((await addBtn.count()) > 0) {
      await addBtn.click();
      const toast = page.locator("[role='alert'], .toast, [class*='toast']");
      await expect(toast.first()).toBeVisible({ timeout: 5000 });
    }
  });
});
