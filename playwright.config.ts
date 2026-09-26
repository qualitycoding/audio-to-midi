// FROZEN — DO NOT MODIFY (see tests/FROZEN_MANIFEST.sha256)
import { defineConfig, devices } from '@playwright/test';
/** D-028: functional E2E on desktop Chromium/Firefox/WebKit + emulated Pixel 7 (Chromium) and iPhone 15 (WebKit);
 *  perf projects record PerfReport JSON (T-015 schema) — desktop unthrottled, mobile with 4x CPU throttle (Chromium CDP, C-019). */
export default defineConfig({
  testDir: 'tests/e2e', timeout: 180_000, expect: { timeout: 30_000 }, retries: 0, workers: 1, reporter: [['list'], ['html', { open: 'never' }]],
  webServer: { command: 'npm run build && npm run preview', url: 'http://localhost:4173/audio-to-midi/', reuseExistingServer: false, timeout: 180_000 },
  use: { baseURL: 'http://localhost:4173/audio-to-midi/', trace: 'retain-on-failure' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }, testIgnore: /perf\.spec/ },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] }, testIgnore: /perf\.spec/ },
    { name: 'webkit', use: { ...devices['Desktop Safari'] }, testIgnore: /perf\.spec/ },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] }, testIgnore: /perf\.spec/ },
    { name: 'mobile-webkit', use: { ...devices['iPhone 15'] }, testIgnore: /perf\.spec/ },
    { name: 'desktop-perf', use: { ...devices['Desktop Chrome'] }, testMatch: /perf\.spec/, timeout: 600_000 },
    { name: 'mobile-perf', use: { ...devices['Pixel 7'] }, testMatch: /perf\.spec/, timeout: 900_000 },
  ],
});
