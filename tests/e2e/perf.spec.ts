// FROZEN — DO NOT MODIFY (see tests/FROZEN_MANIFEST.sha256)
import { test, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { load, state, waitAnalysed } from './helpers';
/** T-028/T-029 — SC-13 (desktop target) and SC-14 (mobile figures recorded). D-026, C-019. The app's ?bench=1 harness
 *  measures decode/analysis/zoom/play-latency and returns a PerfReport via window.__a2m.bench(). */
test('perf: 240 s stem — record PerfReport; desktop analysis < 60 s', async ({ page, context }, info) => {
  const mobile = info.project.name === 'mobile-perf';
  if (mobile) { const cdp = await context.newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 }); }
  await load(page, ['long240.wav']); await page.getByTestId('stem').nth(0).getByTestId('stem-kind').selectOption('guitar');
  await page.goto('./?test=1&bench=1'); await page.getByTestId('file-input').setInputFiles('tests/fixtures/audio/long240.wav');
  await waitAnalysed(page, mobile ? 880_000 : 590_000);
  const report = await page.evaluate(async (dev) => (window as any).__a2m.bench(dev), mobile ? 'Pixel 7 (emulated, 4x CPU throttle)' : 'Desktop Chrome (CI runner)');
  const { validatePerfReport } = await import('../../src/perf/report'); const r = validatePerfReport(report);
  mkdirSync('perf/results', { recursive: true }); writeFileSync(`perf/results/${info.project.name}-${r.timestampUtc.replace(/[:]/g, '')}.json`, JSON.stringify(r, null, 2));
  expect(r.stemSeconds).toBeCloseTo(240, 0); expect((await state(page)).backend).toBe(r.backend);
  if (!mobile) { expect(r.analysisMs).toBeLessThan(60_000); expect(r.zoomFrameMsMedian).toBeLessThan(16); expect(r.playStartLatencyMs).toBeLessThan(100); }
  else { expect(r.analysisMs).toBeGreaterThan(0); } // mobile: best-effort, recorded not gated (A-013)
});
