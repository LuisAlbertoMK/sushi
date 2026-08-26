import { chromium } from "playwright";

(async () => {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage();
  await p.goto("http://localhost:3000/kaiten");

  // wait for belt
  await p.getByRole("status", { name: /Cargando/i }).waitFor({ state: "detached", timeout: 15000 }).catch(() => {});
  await p.locator(".kaiten-stage").waitFor({ state: "visible", timeout: 15000 });

  const stage = p.locator(".kaiten-stage").first();
  const bg = await stage.evaluate((el) => getComputedStyle(el).backgroundColor);
  console.log("BG before toggle:", bg);

  // Toggle theme
  const toggle = p.getByRole("button", { name: /cambiar a modo/i });
  if (await toggle.count() > 0) {
    console.log("Toggle visible:", await toggle.first().isVisible());
    console.log("Toggle aria-label:", await toggle.first().getAttribute("aria-label"));
    await toggle.first().click({ force: true });
    await p.waitForTimeout(2000);

    const bgAfter = await stage.evaluate((el) => getComputedStyle(el).backgroundColor);
    console.log("BG after toggle:", bgAfter);

    // Check body class for dark
    const bodyClass = await p.evaluate(() => document.body.className);
    console.log("body class:", bodyClass);
    const htmlClass = await p.evaluate(() => document.documentElement.className);
    console.log("html class:", htmlClass);

    // Check localStorage
    const stored = await p.evaluate(() => localStorage.getItem("sushi-theme"));
    console.log("localStorage theme:", stored);
  }

  await b.close();
})().catch((e) => console.log("ERR:", e.message));
