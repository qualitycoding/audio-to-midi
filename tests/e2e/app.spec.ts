// FROZEN — DO NOT MODIFY (see tests/FROZEN_MANIFEST.sha256)
import { test, expect } from '@playwright/test';
import { load, state, waitAnalysed, canvasInk } from './helpers';
/** T-020..T-026 — SC-1..SC-6, SC-8, SC-9, SC-11, SC-12. D-025 DOM/test-hook contract. */
test('T-020 loads multiple stems, draws a waveform each, shows note/chord labels', async ({ page }) => {
  await load(page, ['guitar8.wav', 'bass7.wav', 'drums.wav']);
  for (let i = 0; i < 3; i++) expect(await canvasInk(page, i)).toBeGreaterThan(0.01);
  await page.getByTestId('stem').nth(0).getByTestId('stem-kind').selectOption('guitar');
  await page.getByTestId('stem').nth(1).getByTestId('stem-kind').selectOption('bass');
  await page.getByTestId('stem').nth(2).getByTestId('stem-kind').selectOption('unpitched');
  await waitAnalysed(page); const s = await state(page);
  expect(s.stems[0].notes).toBeGreaterThan(10); expect(s.stems[2].notes).toBe(0);
  expect(s.stems[0].labels.some((l) => /^[A-G]#?(m|7|m7|maj7|dim|aug|sus[24])?$/.test(l))).toBe(true); // at least one chord name
  expect(s.stems[1].labels).toContain('F#0'); // sub-A0 path (D-021)
  await expect(page.getByTestId('stem').nth(0).getByTestId('note-label').first()).toBeVisible();
});
test('T-021 linked zoom in/out/fit across stems', async ({ page }) => {
  await load(page, ['guitar8.wav', 'bass7.wav']); const a = (await state(page)).viewport;
  await page.getByTestId('zoom-in').click(); const b = (await state(page)).viewport; expect(b.secPerPx).toBeCloseTo(a.secPerPx / 2, 9);
  const w0 = await page.getByTestId('stem').nth(0).getByTestId('waveform').evaluate((c: HTMLCanvasElement) => c.toDataURL());
  await page.getByTestId('zoom-in').click(); const w1 = await page.getByTestId('stem').nth(1).getByTestId('waveform').evaluate((c: HTMLCanvasElement) => c.toDataURL()); expect(w1).not.toBe(w0);
  for (let i = 0; i < 40; i++) await page.getByTestId('zoom-in').click(); expect((await state(page)).viewport.secPerPx).toBeCloseTo(1 / 44100, 9);
  await page.getByTestId('zoom-fit').click(); const f = (await state(page)).viewport; expect(f.startSec).toBe(0); expect(f.secPerPx * f.widthPx).toBeCloseTo(12, 2);
});
test('T-022 plays exactly the selected stems and stops', async ({ page }) => {
  await load(page, ['guitar8.wav', 'bass7.wav', 'drums.wav']);
  await page.getByTestId('stem').nth(1).getByTestId('stem-select').uncheck();
  await page.getByTestId('play').click();
  await expect.poll(async () => (await state(page)).player.playing).toBe(true);
  expect((await state(page)).player.activeStemIndices).toEqual([0, 2]);
  await expect.poll(async () => (await state(page)).player.currentTimeSec, { timeout: 5000 }).toBeGreaterThan(0.3);
  await page.getByTestId('stop').click(); const s = await state(page); expect(s.player.playing).toBe(false); expect(s.player.currentTimeSec).toBe(0);
  for (let i = 0; i < 3; i++) await page.getByTestId('stem').nth(i).getByTestId('stem-select').uncheck();
  await page.getByTestId('play').click(); await expect.poll(async () => (await state(page)).player.activeStemIndices).toEqual([0, 1, 2]); // none ticked -> all (A-010)
});
test('T-023 BPM selector moves grid lines; tab bar lines follow', async ({ page }) => {
  await load(page, ['guitar8.wav']); await page.getByTestId('zoom-fit').click();
  await page.getByTestId('bpm').fill('120'); await page.getByTestId('bpm').press('Enter'); await page.getByTestId('grid-offset').fill('0'); await page.getByTestId('grid-offset').press('Enter');
  expect((await state(page)).gridLinesVisible).toBe(24); // 12 s at 0.5 s/beat, [0,12)
  await page.getByTestId('bpm').fill('60'); await page.getByTestId('bpm').press('Enter'); expect((await state(page)).gridLinesVisible).toBe(12);
  await page.getByTestId('bpm').fill('500'); await page.getByTestId('bpm').press('Enter');
  await expect(page.getByTestId('bpm')).toHaveAttribute('aria-invalid', 'true'); expect((await state(page)).grid.bpm).toBe(60);
  await expect(page.getByTestId('bpm')).toHaveAttribute('min', '20'); await expect(page.getByTestId('bpm')).toHaveAttribute('max', '400');
});
test('T-024 exports MIDI, ASCII tab and MusicXML downloads', async ({ page }) => {
  await load(page, ['guitar8.wav', 'bass7.wav']);
  await page.getByTestId('stem').nth(0).getByTestId('stem-kind').selectOption('guitar'); await page.getByTestId('stem').nth(0).getByTestId('stem-tuning').selectOption('guitar8');
  await page.getByTestId('stem').nth(1).getByTestId('stem-kind').selectOption('bass'); await page.getByTestId('stem').nth(1).getByTestId('stem-tuning').selectOption('bass7');
  await waitAnalysed(page);
  const get = async (id: string) => { const [d] = await Promise.all([page.waitForEvent('download'), page.getByTestId(id).click()]); return { name: d.suggestedFilename(), path: await d.path() }; };
  const fs = await import('node:fs');
  const mid = await get('export-midi'); expect(mid.name).toMatch(/\.mid$/); expect(fs.readFileSync(mid.path!).subarray(0, 4).toString('latin1')).toBe('MThd');
  const txt = await get('export-tab-txt'); expect(txt.name).toMatch(/\.txt$/); const t = fs.readFileSync(txt.path!, 'utf8'); expect(t).toMatch(/^F#1\s*\|/m); expect(t).toMatch(/^F#0\s*\|/m);
  const xml = await get('export-musicxml'); expect(xml.name).toMatch(/\.musicxml$/); expect(fs.readFileSync(xml.path!, 'utf8')).toContain('<staff-lines>8</staff-lines>');
});
test('T-025 hostile input: corrupt audio and script-bearing filenames', async ({ page }) => {
  let dialogs = 0; page.on('dialog', (d) => { dialogs++; void d.dismiss(); });
  await page.goto('./?test=1');
  const evil = '<img src=x onerror=alert(1)>.wav'; const fs = await import('node:fs');
  await page.getByTestId('file-input').setInputFiles([{ name: evil, mimeType: 'audio/wav', buffer: fs.readFileSync('tests/fixtures/audio/guitar8.wav') }, { name: 'corrupt.wav', mimeType: 'audio/wav', buffer: fs.readFileSync('tests/fixtures/audio/corrupt.wav') }]);
  await expect(page.getByRole('alert')).toContainText('corrupt.wav'); await expect(page.getByTestId('stem')).toHaveCount(1);
  await expect(page.getByTestId('stem').first()).toContainText(evil); expect(dialogs).toBe(0); expect(await page.locator('img[src="x"]').count()).toBe(0);
  await page.getByTestId('play').click(); await expect.poll(async () => (await state(page)).player.playing).toBe(true); // still usable
});
test('T-026 no CSP violations, no uncaught errors, no network requests off-origin during a full session', async ({ page, baseURL }) => {
  const errs: string[] = []; const offOrigin: string[] = []; const origin = new URL(baseURL!).origin;
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); }); page.on('pageerror', (e) => errs.push(String(e)));
  page.on('request', (r) => { if (!r.url().startsWith(origin) && !r.url().startsWith('blob:') && !r.url().startsWith('data:')) offOrigin.push(r.url()); });
  await load(page, ['guitar8.wav']); await waitAnalysed(page); await page.getByTestId('play').click(); await page.waitForTimeout(500); await page.getByTestId('stop').click();
  const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
  expect(csp).toContain("default-src 'self'"); expect(csp).not.toContain("'unsafe-eval'"); expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/);
  expect(errs).toEqual([]); expect(offOrigin).toEqual([]);
});
test('T-027 test hook absent without ?test=1', async ({ page }) => { await page.goto('./'); expect(await page.evaluate(() => typeof (window as any).__a2m)).toBe('undefined'); });
