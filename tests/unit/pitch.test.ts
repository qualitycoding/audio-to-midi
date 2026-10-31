// FROZEN — DO NOT MODIFY (see tests/FROZEN_MANIFEST.sha256)
import { describe, it, expect } from 'vitest';
import { trackPitch } from '../../src/analysis/pitchTrack';
import { segmentSubA0 } from '../../src/analysis/subA0';
import { render, noteF1 } from '../fixtures/synth';
/** T-011 — SC-4 (Hz readout); C-008 (MPM detects F#0..E4 on synthetic plucks, spike ≈1 cent), D-020.
 *  Tolerance ±10 cents: 10x the spike error, well under the ±50 cents note-identity threshold. */
const SR = 44100;
describe('T-011 MPM pitch tracking', () => {
  it.each([18, 19, 20, 21, 23, 28, 30, 40, 52, 64])('MIDI %i median within ±10 cents', (m) => {
    const x = render([{ t: 0, midi: m, d: 1.2 }], 1.2, SR, 3, 0.998);
    const fr = trackPitch(x, SR).filter((f) => f.timeSec > 0.1 && f.timeSec < 1.0);
    expect(fr.length).toBeGreaterThan(5);
    const c = fr.map((f) => 1200 * Math.log2(f.hz / (440 * 2 ** ((m - 69) / 12)))).sort((a, b) => a - b);
    expect(Math.abs(c[c.length >> 1])).toBeLessThan(10);
  });
  it('emits no confident frames for silence', () => { expect(trackPitch(new Float32Array(SR), SR)).toHaveLength(0); });
  it('frames carry clarity >= 0.9 by default and increasing timestamps', () => {
    const fr = trackPitch(render([{ t: 0, midi: 45, d: 1 }], 1, SR, 3), SR); expect(fr.every((f) => f.clarity >= 0.9)).toBe(true);
    for (let i = 1; i < fr.length; i++) expect(fr[i].timeSec).toBeGreaterThan(fr[i - 1].timeSec);
  });
});
/** T-012 — SC-7 (7-string bass F#0 string usable); C-004 (basic-pitch lowest note A0), C-008; D-021. */
describe('T-012 sub-A0 segmentation', () => {
  it('recovers F#0, G0, G#0 notes (recall >= 0.9, onset ±50 ms) and ignores >= A0', () => {
    const ref = [18, 19, 20, 18, 20, 21, 23].map((m, k) => ({ t: 0.25 + k * 0.9, midi: m, d: 0.7 }));
    const x = render(ref, 7, SR, 11, 0.998);
    const notes = segmentSubA0(trackPitch(x, SR));
    const sub = ref.filter((r) => r.midi < 21); const s = noteF1(sub, notes);
    expect(s.R).toBeGreaterThanOrEqual(0.9); expect(notes.every((n) => n.midi < 21)).toBe(true);
  });
});
