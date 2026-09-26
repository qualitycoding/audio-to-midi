// FROZEN — DO NOT MODIFY (see tests/FROZEN_MANIFEST.sha256)
import { describe, it, expect } from 'vitest';
import { computePeaks, buildPyramid } from '../../src/core/peaks';
import { zoomAt, clampViewport, secToPx, type Viewport } from '../../src/core/viewport';
/** T-009/T-010 — SC-2 (waveform), SC-3 (linked zoom full-track..sample level); D-019. Exact equality: pure min/max. */
describe('T-009 peaks', () => {
  const x = Float32Array.from([0, 0.5, -0.25, 1, -1, 0.1, 0.2]);
  it('min/max per bin with ragged tail', () => {
    const p = computePeaks(x, 3); expect(p.min.length).toBe(3);
    expect(Array.from(p.max)).toEqual([0.5, 1, 0.2].map(Math.fround)); expect(Array.from(p.min)).toEqual([-0.25, -1, 0.2].map(Math.fround));
  });
  it('pyramid doubles bin size until one bin covers the signal', () => {
    const pyr = buildPyramid(new Float32Array(1000).fill(0.1), 16); expect(pyr.map((p) => p.samplesPerBin)).toEqual([16, 32, 64, 128, 256, 512, 1024]); expect(pyr.at(-1)!.max.length).toBe(1);
  });
  it('rejects samplesPerBin < 1', () => { expect(() => computePeaks(x, 0)).toThrow(/samplesPerBin must be/i); });
});
describe('T-010 viewport zoom', () => {
  const v: Viewport = { startSec: 0, secPerPx: 0.1, widthPx: 1000, durationSec: 240, sampleRate: 48000 };
  it('keeps the anchor time under the same pixel', () => {
    const anchor = 30; const px = secToPx(v, anchor); const z = zoomAt(v, 2, anchor);
    expect(z.secPerPx).toBeCloseTo(0.05, 12); expect(secToPx(z, anchor)).toBeCloseTo(px, 6);
  });
  it('clamps zoom-in at 1 sample per pixel and zoom-out at whole track in view', () => {
    expect(zoomAt(v, 1e9, 10).secPerPx).toBeCloseTo(1 / 48000, 12);
    const out = zoomAt(v, 1e-9, 10); expect(out.secPerPx).toBeCloseTo(240 / 1000, 12); expect(out.startSec).toBe(0);
  });
  it('clamps start into [0, duration - visible]', () => {
    expect(clampViewport({ ...v, startSec: -5 }).startSec).toBe(0); expect(clampViewport({ ...v, startSec: 239 }).startSec).toBeCloseTo(140, 9);
  });
});
