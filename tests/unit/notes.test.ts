// FROZEN — DO NOT MODIFY (see tests/FROZEN_MANIFEST.sha256)
import { describe, it, expect } from 'vitest';
import { freqToPitch, midiToName, midiToHz } from '../../src/core/notes';
/** T-001 — SC-4 (note + Hz readout), SC-5 (A4 reference); C-010 (12-TET), D-011. */
describe('T-001 note naming and frequency conversion', () => {
  it('names MIDI numbers with sharps and scientific octave, including sub-A0', () => {
    expect(midiToName(60)).toBe('C4'); expect(midiToName(61)).toBe('C#4'); expect(midiToName(69)).toBe('A4');
    expect(midiToName(18)).toBe('F#0'); expect(midiToName(21)).toBe('A0'); expect(midiToName(30)).toBe('F#1'); expect(midiToName(91)).toBe('G6');
  });
  it('midiToHz follows 12-TET (tolerance 1e-9 relative: double precision, closed form)', () => {
    expect(midiToHz(69)).toBeCloseTo(440, 9); expect(midiToHz(18) / 23.124651419477 - 1).toBeLessThan(1e-9);
    expect(midiToHz(69, 432)).toBeCloseTo(432, 9);
  });
  it('freqToPitch returns nearest note and signed cents', () => {
    const p = freqToPitch(440 * 2 ** (30 / 1200));
    expect(p.midi).toBe(69); expect(p.name).toBe('A4'); expect(p.cents).toBeCloseTo(30, 6);
    const q = freqToPitch(440 * 2 ** (-49 / 1200)); expect(q.midi).toBe(69); expect(q.cents).toBeCloseTo(-49, 6);
    expect(freqToPitch(23.125).name).toBe('F#0');
  });
  it('honours a custom A4 reference', () => {
    const p = freqToPitch(432, 432); expect(p.midi).toBe(69); expect(Math.abs(p.cents)).toBeLessThan(1e-6);
    expect(freqToPitch(440, 432).cents).toBeCloseTo(1200 * Math.log2(440 / 432), 6);
  });
  it('rejects non-positive or non-finite frequencies', () => {
    for (const bad of [0, -1, NaN, Infinity]) expect(() => freqToPitch(bad)).toThrow(/invalid frequency/i);
  });
});
