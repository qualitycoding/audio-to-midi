// FROZEN — DO NOT MODIFY (see tests/FROZEN_MANIFEST.sha256)
import { describe, it, expect } from 'vitest';
import { TUNINGS, MAX_FRET } from '../../src/core/tunings';
/** T-003 — SC-7 (instrument presets, max fret 27); A-007, A-008. */
describe('T-003 tuning presets', () => {
  it('max fret is 27', () => expect(MAX_FRET).toBe(27));
  it('6-string guitar E2 A2 D3 G3 B3 E4', () => expect([...TUNINGS.guitar6]).toEqual([40, 45, 50, 55, 59, 64]));
  it('8-string guitar adds F#1 B1 below standard', () => expect([...TUNINGS.guitar8]).toEqual([30, 35, 40, 45, 50, 55, 59, 64]));
  it('4-string bass E1 A1 D2 G2', () => expect([...TUNINGS.bass4]).toEqual([28, 33, 38, 43]));
  it('7-string bass: F#0 B0 below, C3 above standard 4', () => expect([...TUNINGS.bass7]).toEqual([18, 23, 28, 33, 38, 43, 48]));
});
