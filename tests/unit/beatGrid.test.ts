// FROZEN — DO NOT MODIFY (see tests/FROZEN_MANIFEST.sha256)
import { describe, it, expect } from 'vitest';
import { gridLines, validateGrid, secToBeats, BPM_MIN, BPM_MAX } from '../../src/core/beatGrid';
import type { BeatGrid } from '../../src/core/types';
/** T-008 — SC-6 (BPM lines + selector); D-014. Tolerance 1e-9 s: closed-form arithmetic in double precision. */
const g = (p: Partial<BeatGrid> = {}): BeatGrid => ({ bpm: 120, offsetSec: 0.25, beatsPerBar: 4, beatUnit: 4, ...p });
describe('T-008 beat grid', () => {
  it('places beats at offset + k*60/bpm and bars every beatsPerBar beats', () => {
    const L = gridLines(g(), 0, 3);
    expect(L.map((l) => l.timeSec)).toEqual([0.25, 0.75, 1.25, 1.75, 2.25, 2.75].map((x) => expect.closeTo(x, 9)));
    expect(L.map((l) => l.isBar)).toEqual([true, false, false, false, true, false]);
    expect(L[0].beatIndex).toBe(0);
  });
  it('extends before the offset with negative indices; bar lines stay aligned to index multiples of beatsPerBar', () => {
    const L = gridLines(g({ offsetSec: 2.0, bpm: 60, beatsPerBar: 3 }), 0, 2.5);
    expect(L.map((l) => l.beatIndex)).toEqual([-2, -1, 0]); expect(L.map((l) => l.isBar)).toEqual([false, false, true]);
  });
  it('supports fractional BPM without drift over 10 minutes', () => {
    const L = gridLines(g({ bpm: 97.5, offsetSec: 0 }), 599, 600); const last = L[L.length - 1];
    expect(last.timeSec).toBeCloseTo(last.beatIndex * (60 / 97.5), 9);
  });
  it('BPM is quarter-note tempo; lines fall on every beatUnit (7/8 at 120 -> 0.25 s spacing, bar every 7)', () => {
    const L = gridLines(g({ offsetSec: 0, beatsPerBar: 7, beatUnit: 8 }), 0, 2);
    expect(L).toHaveLength(8); expect(L[1].timeSec).toBeCloseTo(0.25, 9); expect(L.filter((l) => l.isBar).map((l) => l.beatIndex)).toEqual([0, 7]);
  });
  it('is half-open [from, to)', () => { expect(gridLines(g({ offsetSec: 0 }), 0, 1).map((l) => l.timeSec)).toEqual([0, 0.5]); });
  it('validates range', () => {
    expect(BPM_MIN).toBe(20); expect(BPM_MAX).toBe(400);
    expect(() => validateGrid(g({ bpm: 19.99 }))).toThrow(/bpm out of range/i); expect(() => validateGrid(g({ bpm: 400.01 }))).toThrow(/bpm out of range/i);
    expect(() => validateGrid(g({ bpm: NaN }))).toThrow(/bpm out of range/i); expect(() => validateGrid(g({ beatsPerBar: 0 }))).toThrow(/beatsPerBar out of range/i);
    expect(() => validateGrid(g({ beatsPerBar: 17 }))).toThrow(/beatsPerBar out of range/i); expect(validateGrid(g())).toEqual(g());
  });
  it('converts seconds to beats relative to the offset', () => { expect(secToBeats(g(), 1.25)).toBeCloseTo(2, 9); expect(secToBeats(g(), 0)).toBeCloseTo(-0.5, 9); });
});
