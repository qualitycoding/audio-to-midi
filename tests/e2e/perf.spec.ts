// FROZEN — amended 2026-11-01 under R-023 option (b) / D-037 (human-approved unfreeze-and-extend;
// TEST_CHALLENGE.md). Re-frozen: hash in tests/FROZEN_MANIFEST.sha256 is authoritative.
import { test, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { state, waitAnalysed } from './helpers';
/** T-028/T-029 — SC-13 (desktop target) and SC-14 (mobile figures recorded). D-026, C-019; D-037: play-start
 *  latency is now measured by really playing (click → poll startLatencyMs → stop) instead of reading the `?? 0`
 *  fallback; desktop also asserts the metric is > 0 so it can never silently default again. */
test('perf: 240 s stem — record PerfReport; desktop analysis < 60 s', async ({ page, context }, info) => {
  const mobile = info.project.name === 'mobile-perf';
  if (mobile) { const cdp = await context.newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 }); }
  await page.goto('./?test=1&bench=1'); await page.getByTestId('file-input').setInputFiles('tests/fixtures/audio/long240.wav');
  await expect(page.getByTestId('stem')).toHaveCount(1); // default kind 'pitched' -> poly analysis starts immediately (D-025)
  await waitAnalysed(page, mobile ? 880_000 : 590_000);
  await page.getByTestId('play').click(); // D-037: actually start playback so lastStartLatencyMs is set for real
  await expect.poll(async () => (await state(page)).player.startLatencyMs, { timeout: 30_000 }).not.toBeNull();
  await page.getByTestId('stop').click(); // stop before the zoom bench so zoom figures stay comparable (zoom-only)
  const report = await page.evaluate(async (dev) => (window as any).__a2m.bench(dev), mobile ? 'Pixel 7 (emulated, 4x CPU throttle)' : 'Desktop Chrome (CI runner)');
  const { validatePerfReport } = await import('../../src/perf/report'); const r = validatePerfReport(report);
  mkdirSync('perf/results', { recursive: true }); writeFileSync(`perf/results/${info.project.name}-${r.timestampUtc.replace(/[:]/g, '')}.json`, JSON.stringify(r, null, 2));
  expect(r.stemSeconds).toBeCloseTo(240, 0); expect((await state(page)).backend).toBe(r.backend);
  if (!mobile) { expect(r.analysisMs).toBeLessThan(60_000); expect(r.zoomFrameMsMedian).toBeLessThan(16); expect(r.playStartLatencyMs).toBeGreaterThan(0); expect(r.playStartLatencyMs).toBeLessThan(100); }
  else { expect(r.analysisMs).toBeGreaterThan(0); } // mobile: best-effort, recorded not gated (A-013)
});
