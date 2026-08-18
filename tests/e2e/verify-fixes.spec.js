// tests/e2e/verify-fixes.spec.js — Verificación de los 3 fixes de UI
// 1) Centrado de la mesa kaiten (dead-center del viewport)
// 2) Card CTA "¿Listo para compartir?" NO blanco en dark mode
// 3) Iconos sociales como SVG (no emojis) en Footer
// confidence: high — validaciones por computed style + boundingBox

const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const SCREENSHOTS_DIR = path.join(__dirname, "screenshots");
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

test.describe("Verificación fixes UI — sushi", () => {
  test("a) mesa kaiten centrada en el viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/kaiten", { waitUntil: "domcontentloaded" });

    // La mesa se identifica por su aria-label (KaitenMenu.tsx línea 793)
    const wheel = page.locator('[aria-label^="Mesa giratoria"]').first();
    await wheel.waitFor({ timeout: 10000 });
    const box = await wheel.boundingBox();
    expect(box, "wheel boundingBox debe existir").not.toBeNull();

    const vpWidth = await page.evaluate(() => window.innerWidth);
    const mesaCenterX = box.x + box.width / 2;
    const vpCenterX = vpWidth / 2;
    const offset = Math.abs(mesaCenterX - vpCenterX);
    console.log(`  → viewport=${vpWidth}px | mesa center=${Math.round(mesaCenterX)}px | vp center=${Math.round(vpCenterX)}px | offset=${Math.round(offset)}px`);
    // Tolerancia generosa: antes el offset era ~16px + gap. Dead-center si < 12px.
    expect(offset).toBeLessThan(16);
    console.log(`  → Mesa centrada ✓ (offset ${Math.round(offset)}px < 16px)`);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "fixes-mesa-centrada.png"),
    });
  });

  test("b) card CTA '¿Listo para compartir?' con fondo oscuro en dark", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const card = page.locator("section", { hasText: "¿Listo para compartir?" }).first();
    await card.waitFor({ timeout: 10000 });

    const bg = await card.evaluate((el) => getComputedStyle(el).backgroundColor);
    const txtColor = await card.evaluate((el) => getComputedStyle(el).color);
    console.log(`  → Card CTA dark: background=${bg} | text=${txtColor}`);

    // El bug: quedaba blanco (rgb(255,255,255)). Con dark:bg-primary-900/30 Chromium
    // devuelve "oklab(L a b / A)" o "oklch(L C H / A)" con L bajo. Antes del fix era
    // blanco (L≈1). Parseamos la luminancia: debe ser claramente oscura.
    const m = bg.match(/okl(?:ab|ch)\(([\d.]+)/);
    if (m) {
      const lightness = Number(m[1]);
      console.log(`  → oklab lightness = ${lightness}`);
      expect(lightness).toBeLessThan(0.6); // oscuro; blanco sería ≈1
    } else {
      // Fallback para rgb/rgba
      const rgb = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      expect(rgb, `background no parseable: ${bg}`).not.toBeNull();
      const [r, g, b] = [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
      console.log(`  → RGB = ${r},${g},${b}`);
      expect(r + g + b).toBeLessThan(600);
      expect(bg).not.toMatch(/255,\s*255,\s*255/);
    }

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "fixes-card-cta-dark.png"),
    });
  });

  test("c) footer: iconos sociales son SVG (no emojis) con contraste", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const socialLinks = page.locator('footer a[href*="instagram"], footer a[href*="whatsapp"], footer a[href*="facebook"], footer a[href*="tiktok"]');
    const count = await socialLinks.count();
    console.log(`  → Links sociales en footer: ${count}`);
    expect(count).toBeGreaterThanOrEqual(1);

    for (let i = 0; i < count; i++) {
      const link = socialLinks.nth(i);
      const hasSvg = await link.locator("svg").count();
      const hasEmoji = await link.evaluate((el) => {
        // emoji = texto visible que no sea texto real; detectar emojis por rango unicode
        const txt = (el.textContent || "").trim();
        return /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(txt);
      });
      const aria = await link.getAttribute("aria-label");
      console.log(`  → link[${i}]: svg=${hasSvg} emoji=${hasEmoji} aria="${aria}"`);
      expect(hasSvg).toBeGreaterThanOrEqual(1);
      expect(hasEmoji).toBe(false);
    }
    console.log(`  → Todos los links sociales usan SVG sin emojis ✓`);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "fixes-footer-social.png"),
    });
  });
});