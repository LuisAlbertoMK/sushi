// tests/e2e/verify-v2-fixes.spec.js — Verificación de los 4 fixes portados del ejemplo v2 corregido
// 1) plateHalf dinámico: centro del anillo de platos == centro del disco (error sistemático 0)
// 2) Giro por defecto: con prefers-reduced-motion la mesa GIRA igual
// 3) Hover pausa: hover frena el giro (delta ~0 vs ~40px/s normal), salir reanuda
// 4) Belt finito: búsqueda >5 resultados → 1 copia (sin x3), track frena al final
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const SCREENSHOTS_DIR = path.join(__dirname, "screenshots");
if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const wheelAngle = async (page) =>
  page.evaluate(() => {
    const btn = document.querySelector("[data-cat-key]");
    return btn ? btn.getBoundingClientRect().left : 0;
  });

test.describe("Fixes v2 corregido — kaiten", () => {
  test("a) anillo de platos centrado en el disco (plateHalf dinamico)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/kaiten", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("[data-cat-key]", { timeout: 10000 });
    await page.waitForTimeout(600);

    const ring = await page.evaluate(() => {
      const wrap = document.querySelector('[aria-label^="Mesa giratoria"]');
      const wr = wrap.getBoundingClientRect();
      const cx = wr.left + wr.width / 2;
      const cy = wr.top + wr.height / 2;
      const plates = [...document.querySelectorAll("[data-cat-key]")].map((b) => {
        const r = b.getBoundingClientRect();
        return { x: r.left + r.width / 2 - cx, y: r.top + r.height / 2 - cy };
      });
      const avgX = plates.reduce((s, p) => s + p.x, 0) / plates.length;
      const avgY = plates.reduce((s, p) => s + p.y, 0) / plates.length;
      return { n: plates.length, avgX, avgY };
    });
    console.log(`  → anillo de ${ring.n} platos: avgX=${ring.avgX.toFixed(1)}px avgY=${ring.avgY.toFixed(1)}px`);
    // Antes del fix: plateHalf 36 vs real 44 → anillo desplazado +8px en X e Y.
    // Ahora debe ser ~0. Umbral generoso: <4px (rotación en curso añade ruido).
    expect(Math.abs(ring.avgX)).toBeLessThan(4);
    expect(Math.abs(ring.avgY)).toBeLessThan(4);
    console.log(`  → Anillo centrado en el disco ✓`);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "v2-fix-orbita.png") });
  });

  test("b) gira por defecto AUN con prefers-reduced-motion", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/kaiten", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("[data-cat-key]", { timeout: 10000 });
    await page.waitForTimeout(600);

    const p0 = await wheelAngle(page);
    await page.waitForTimeout(1500);
    const p1 = await wheelAngle(page);
    const delta = Math.round(Math.abs(p1 - p0));
    console.log(`  → reduced-motion: delta giro 1500ms = ${delta}px`);
    // Antes del fix: con reduce la mesa NO giraba (delta=0). Ahora debe girar.
    expect(delta).toBeGreaterThan(15);
    console.log(`  → Gira por defecto con reduced-motion ✓`);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "v2-fix-giro-reduced.png") });
  });

  test("c) hover sobre la mesa pausa el giro", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/kaiten", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("[data-cat-key]", { timeout: 10000 });
    await page.waitForTimeout(600);

    const wrap = page.locator('[aria-label^="Mesa giratoria"]');
    // El movimiento del mouse hacia el wrap tarda ~200ms; durante ese tiempo la
    // mesa gira ~8px. Para medir la pausa REAL, estabilizar el hover ANTES de tomar p0.
    await wrap.hover({ position: { x: 200, y: 120 } });
    await page.waitForTimeout(400);
    const p0 = await wheelAngle(page);
    await page.waitForTimeout(1000);
    const p1 = await wheelAngle(page);
    const deltaHover = Math.round(Math.abs(p1 - p0));
    // Giro normal ≈ 40px/s → 1000ms serían ~40px. Pausado → 0px (deriva nula, medido).
    console.log(`  → durante hover 1000ms: delta=${deltaHover}px (giro normal ≈40px)`);
    expect(deltaHover).toBeLessThan(8);

    await page.mouse.move(5, 400); // salir del hover
    await page.waitForTimeout(400); // dejar que el giro se reanude y estabilice
    const p2 = await wheelAngle(page);
    await page.waitForTimeout(1200);
    const p3 = await wheelAngle(page);
    const deltaOut = Math.round(Math.abs(p3 - p2));
    console.log(`  → tras salir 1200ms: delta=${deltaOut}px (debe reanudar > 15)`);
    expect(deltaOut).toBeGreaterThan(15);
    console.log(`  → Hover pausa + reanuda ✓`);
  });

  test("d) busqueda >5 resultados: 1 copia y track finito", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/kaiten", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("[data-cat-key]", { timeout: 10000 });

    // "s" matchea varios platillos en español (sushi, sashimi, salmón, etc.)
    await page.fill('input[aria-label="Buscar platillos"]', "s");
    await page.waitForTimeout(2000);

    const beltInfo = await page.evaluate(() => {
      const items = [...document.querySelectorAll("[data-belt-item]")];
      if (items.length === 0) return { found: 0 };
      const ids = items.map((i) => i.getAttribute("data-product-id"));
      const unique = new Set(ids);
      const track = document.querySelector(".kaiten-belt-track");
      const wrap = document.querySelector(".kaiten-belt-wrap");
      const tr = track.getBoundingClientRect();
      const wr = wrap.getBoundingClientRect();
      return {
        found: ids.length,
        unique: unique.size,
        isTriplicated: ids.length > unique.size,
        maxScroll: Math.round(Math.max(0, tr.width - wr.width)),
      };
    });
    console.log(`  → belt: ${JSON.stringify(beltInfo)}`);
    expect(beltInfo.found).toBeGreaterThan(0);
    // FIX 4: búsqueda = 1 copia (el v2 usa beltFinite)
    expect(beltInfo.isTriplicated).toBe(false);

    // Esperar auto-scroll y verificar que el track frena al llegar a maxScroll
    await page.waitForTimeout(3000);
    const finalShift = await page.evaluate(() => {
      const track = document.querySelector(".kaiten-belt-track");
      const m = track.style.transform.match(/translateX\((-?[\d.]+)px\)/);
      return m ? Math.abs(Number(m[1])) : 0;
    });
    console.log(`  → shift final=${Math.round(finalShift)}px | maxScroll=${beltInfo.maxScroll}px`);
    expect(finalShift).toBeLessThanOrEqual(beltInfo.maxScroll + 5);
    console.log(`  → Track finito: 1 copia y freno al final ✓`);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "v2-fix-belt-finito.png") });
  });
});