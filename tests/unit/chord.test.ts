// FROZEN — DO NOT MODIFY (see tests/FROZEN_MANIFEST.sha256)
import { describe, it, expect } from 'vitest';
import { labelSimultaneous, groupSimultaneous } from '../../src/core/chord';
/** T-002 — SC-4 (chord names for polyphonic passages); C-011 (tonal Chord.detect), D-012. */
describe('T-002 chord labelling', () => {
  it.each([
    [[40, 47, 52, 55, 59, 64], 'Em'], [[45, 52, 57, 61, 64], 'A'], [[43, 47, 50, 55, 59, 67], 'G'],
    [[45, 52, 55, 60, 64], 'Am7'], [[40, 43, 47, 50], 'Em7'], [[36, 40, 43, 46], 'C7'], [[49, 53, 56], 'C#'], [[42, 45, 49], 'F#m'],
  ])('%j -> %s', (midis, name) => { expect(labelSimultaneous(midis)).toBe(name); });
  it('falls back to sorted note names for dyads and unisons', () => {
    expect(labelSimultaneous([52, 40])).toBe('E2 E3'); expect(labelSimultaneous([40, 47])).toBe('E2 B2'); expect(labelSimultaneous([61])).toBe('C#4');
  });
  it('never emits flats', () => { for (const m of [[49, 53, 56], [42, 46, 49], [51, 55, 58, 61]]) expect(labelSimultaneous(m)).not.toMatch(/b/); });
  it('groups onsets within 50 ms', () => {
    const g = groupSimultaneous([{ startSec: 0 }, { startSec: 0.03 }, { startSec: 0.2 }, { startSec: 0.249 }, { startSec: 0.5 }]);
    expect(g.map((x) => x.length)).toEqual([2, 2, 1]);
  });
});
