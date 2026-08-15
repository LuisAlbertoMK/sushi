// playwright.config.js — Configuración Playwright para smoke tests E2E
// confidence: high
const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests/e2e",
  timeout: 30000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: "line",
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },
  webServer: {
    command: "npm run start",
    port: 3000,
    reuseExistingServer: true,
    timeout: 90000,
  },
  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium",
        viewport: { width: 1280, height: 720 },
      },
    },
  ],
});
