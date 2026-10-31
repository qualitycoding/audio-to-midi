// FROZEN — DO NOT MODIFY (see tests/FROZEN_MANIFEST.sha256)
import { describe, it, expect } from 'vitest';
import { renderAsciiTab } from '../../src/core/tabAscii';
import { assignFrets } from '../../src/core/fretting';
import { TUNINGS } from '../../src/core/tunings';
import type { BeatGrid, NoteEvent } from '../../src/core/types';
/** T-005 — SC-8 (ASCII tab export), SC-6 (grid drives bar lines); D-016. */
const grid: BeatGrid = { bpm: 120, offsetSec: 0, beatsPerBar: 4, beatUnit: 4 };
const n = (startSec: number, midi: number): NoteEvent => ({ startSec, durationSec: 0.2, midi, amplitude: 0.8 });
const tabLines = (s: string, count: number) => s.split('\n').filter((l) => /^[A-G]#?\d?\s*\|/.test(l)).slice(0, count);
describe('T-005 ASCII tab', () => {
  it('8-string guitar: 8 labelled lines, highest first, equal length, two-digit frets aligned', () => {
    const notes = [n(0, 30), n(0.5, 64 + 27), n(1.0, 64 + 10)];
    const out = renderAsciiTab(assignFrets(notes, TUNINGS.guitar8), TUNINGS.guitar8, grid);
    const L = tabLines(out, 8); expect(L).toHaveLength(8);
    expect(L[0]).toMatch(/^E4\s*\|/); expect(L[7]).toMatch(/^F#1\s*\|/);
    expect(new Set(L.map((l) => l.length)).size).toBe(1);
    expect(L[0]).toContain('27'); expect(L[7]).toMatch(/\|-*0/);
  });
  it('7-string bass labels F#0..C3', () => {
    const out = renderAsciiTab(assignFrets([n(0, 18)], TUNINGS.bass7), TUNINGS.bass7, grid);
    const L = tabLines(out, 7); expect(L[0]).toMatch(/^C3\s*\|/); expect(L[6]).toMatch(/^F#0\s*\|/);
  });
  it('draws a bar line at every bar of the grid: 3 bars -> 4 bar separators per string line', () => {
    const notes = [n(0, 40), n(2, 45), n(4, 50), n(5.9, 55)]; // 120 bpm, 4/4 -> 2 s per bar, 6 s = 3 bars
    const out = renderAsciiTab(assignFrets(notes, TUNINGS.guitar6), TUNINGS.guitar6, grid, { barsPerLine: 8 });
    const L = tabLines(out, 6); expect((L[0].replace(/^[^|]*/, '').match(/\|/g) ?? []).length).toBe(4);
  });
  it('changing BPM changes bar count (grid drives layout)', () => {
    const notes = [n(0, 40), n(5.9, 55)];
    const a = tabLines(renderAsciiTab(assignFrets(notes, TUNINGS.guitar6), TUNINGS.guitar6, { ...grid, bpm: 60 }, { barsPerLine: 8 }), 1)[0];
    expect((a.replace(/^[^|]*/, '').match(/\|/g) ?? []).length).toBe(3); // 60 bpm: 4 s per bar -> 2 bars
  });
  it('lists unplayable notes in a trailing comment block instead of dropping them', () => {
    const out = renderAsciiTab(assignFrets([n(0, 20)], TUNINGS.guitar6), TUNINGS.guitar6, grid);
    expect(out).toMatch(/unplayable/i); expect(out).toContain('G#0');
  });
});
