// FROZEN — DO NOT MODIFY (see tests/FROZEN_MANIFEST.sha256)
import { describe, it, expect } from 'vitest';
import { assignFrets } from '../../src/core/fretting';
import { TUNINGS, MAX_FRET } from '../../src/core/tunings';
import type { NoteEvent, Tuning } from '../../src/core/types';
/** T-004 — SC-7, SC-8 (tab export correctness); D-015. */
const n = (startSec: number, midi: number, durationSec = 0.25): NoteEvent => ({ startSec, durationSec, midi, amplitude: 0.8 });
const openOf = (t: Tuning, s: number) => t[t.length - s]; // string 1 = highest
function checkInvariants(t: Tuning, res: ReturnType<typeof assignFrets>, input: NoteEvent[]) {
  expect(res.notes.length + res.unplayable.length).toBe(input.length);
  for (const x of res.notes) {
    expect(x.string).toBeGreaterThanOrEqual(1); expect(x.string).toBeLessThanOrEqual(t.length);
    expect(x.fret).toBeGreaterThanOrEqual(0); expect(x.fret).toBeLessThanOrEqual(MAX_FRET);
    expect(openOf(t, x.string) + x.fret).toBe(x.midi);
  }
  const byStart = new Map<number, number[]>();
  for (const x of res.notes) { const k = Math.round(x.startSec * 1000); byStart.set(k, [...(byStart.get(k) ?? []), x.string]); }
  for (const strings of byStart.values()) expect(new Set(strings).size).toBe(strings.length);
}
describe('T-004 fret assignment', () => {
  it('reaches fret 27 and rejects notes above it', () => {
    const r = assignFrets([n(0, 64 + 27), n(1, 64 + 28)], TUNINGS.guitar6);
    expect(r.notes).toHaveLength(1); expect(r.notes[0]).toMatchObject({ string: 1, fret: 27 }); expect(r.unplayable.map((u) => u.midi)).toEqual([92]);
  });
  it('puts notes below the lowest open string in unplayable, never drops them', () => {
    const r = assignFrets([n(0, 39), n(0.5, 40)], TUNINGS.guitar6); expect(r.unplayable.map((u) => u.midi)).toEqual([39]); expect(r.notes[0]).toMatchObject({ string: 6, fret: 0 });
  });
  it('uses the 8-string low F#1 string and the 7-string bass F#0 string', () => {
    expect(assignFrets([n(0, 30)], TUNINGS.guitar8).notes[0]).toMatchObject({ string: 8, fret: 0 });
    expect(assignFrets([n(0, 18)], TUNINGS.bass7).notes[0]).toMatchObject({ string: 7, fret: 0 });
    expect(assignFrets([n(0, 48 + 27)], TUNINGS.bass7).notes[0]).toMatchObject({ string: 1, fret: 27 });
  });
  it('assigns chord tones to distinct strings (6-note E major, 8-note stack)', () => {
    const e = [40, 47, 52, 56, 59, 64].map((m) => n(1, m)); const r = assignFrets(e, TUNINGS.guitar6); checkInvariants(TUNINGS.guitar6, r, e); expect(r.unplayable).toHaveLength(0);
    const s8 = [30, 37, 42, 47, 52, 57, 61, 66].map((m) => n(2, m)); const r8 = assignFrets(s8, TUNINGS.guitar8); checkInvariants(TUNINGS.guitar8, r8, s8); expect(r8.unplayable).toHaveLength(0);
  });
  it('marks chord tones unplayable when a simultaneity needs more notes than strings allow', () => {
    const c = [40, 41, 42, 43, 44, 45, 46].map((m) => n(0, m)); const r = assignFrets(c, TUNINGS.guitar6);
    checkInvariants(TUNINGS.guitar6, r, c); expect(r.unplayable.length).toBeGreaterThanOrEqual(1);
  });
  it('keeps a two-octave A-minor pentatonic run within one hand position (fret span <= 3)', () => {
    const run = [45, 48, 50, 52, 55, 57, 60, 62, 64, 67, 69, 72].map((m, i) => n(i * 0.25, m));
    const r = assignFrets(run, TUNINGS.guitar6); checkInvariants(TUNINGS.guitar6, r, run);
    const frets = r.notes.map((x) => x.fret); expect(Math.max(...frets) - Math.min(...frets)).toBeLessThanOrEqual(3);
  });
  it('is deterministic', () => {
    const run = [52, 55, 57, 59, 62, 64, 67].map((m, i) => n(i * 0.2, m));
    expect(assignFrets(run, TUNINGS.guitar8)).toEqual(assignFrets(run, TUNINGS.guitar8));
  });
  it('handles 2000 notes in under 2 s (tolerance: generous 10x of O(n·S·F²) estimate)', () => {
    const many = Array.from({ length: 2000 }, (_, i) => n(i * 0.1, 40 + ((i * 7) % 30)));
    const t0 = performance.now(); const r = assignFrets(many, TUNINGS.guitar8); expect(performance.now() - t0).toBeLessThan(2000); checkInvariants(TUNINGS.guitar8, r, many);
  });
});
