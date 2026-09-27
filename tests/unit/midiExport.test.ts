// FROZEN — DO NOT MODIFY (see tests/FROZEN_MANIFEST.sha256)
import { describe, it, expect } from 'vitest';
import tm from '@tonejs/midi';
import { buildMidi } from '../../src/core/midiExport';
import type { BeatGrid, StemExport } from '../../src/core/types';
const { Midi } = tm;
/** T-007 — SC-9 (MIDI export); C-012 (@tonejs/midi SMF round-trip, tempo quantised to integer µs/quarter), D-018. */
const grid: BeatGrid = { bpm: 97.5, offsetSec: 0.25, beatsPerBar: 7, beatUnit: 8 };
const stems: StemExport[] = [
  { name: 'Bass 7', kind: 'bass', notes: [{ startSec: 0.5, durationSec: 0.4, midi: 18, amplitude: 0.9 }, { startSec: 1.0, durationSec: 0.4, midi: 75, amplitude: 0.5 }] },
  { name: 'Gtr', kind: 'guitar', notes: [{ startSec: 0.5, durationSec: 1, midi: 40, amplitude: 0.7 }, { startSec: 0.5, durationSec: 1, midi: 47, amplitude: 0.7 }] },
  { name: 'Drums', kind: 'unpitched', notes: [] },
  { name: 'Keys', kind: 'pitched', notes: [{ startSec: 3.25, durationSec: 0.5, midi: 72, amplitude: 1 }] },
];
describe('T-007 MIDI export', () => {
  let c: { bytes: Uint8Array; m: InstanceType<typeof Midi> } | undefined;
  const get = () => (c ??= (() => { const bytes = buildMidi(stems, grid); return { bytes, m: new Midi(bytes) }; })());
  it('is SMF format 1 with MThd header', () => { const { bytes, m } = get(); expect(Buffer.from(bytes.slice(0, 4)).toString('latin1')).toBe('MThd'); expect((bytes[8] << 8) | bytes[9]).toBe(1); });
  it('one named track per stem with notes; empty/unpitched stems skipped', () => { const { bytes, m } = get();
    const named = m.tracks.filter((t) => t.notes.length > 0); expect(named.map((t) => t.name)).toEqual(['Bass 7', 'Gtr', 'Keys']);
  });
  it('tempo within 1e-3 BPM (µs/quarter quantisation) and time signature from grid', () => { const { bytes, m } = get();
    expect(Math.abs(m.header.tempos[0].bpm - 97.5)).toBeLessThan(1e-3); expect(m.header.timeSignatures[0].timeSignature).toEqual([7, 8]);
  });
  it('note times are real seconds within one tick, pitches preserved including MIDI 18', () => { const { bytes, m } = get();
    const tick = 60 / 97.5 / m.header.ppq; const bass = m.tracks.find((t) => t.name === 'Bass 7')!;
    expect(bass.notes.map((x) => x.midi)).toEqual([18, 75]); expect(Math.abs(bass.notes[0].time - 0.5)).toBeLessThanOrEqual(tick); expect(Math.abs(bass.notes[0].duration - 0.4)).toBeLessThanOrEqual(2 * tick);
  });
  it('velocity maps amplitude to 1..127', () => { const { bytes, m } = get(); const k = m.tracks.find((t) => t.name === 'Keys')!; expect(Math.round(k.notes[0].velocity * 127)).toBe(127); });
  it('each track has a distinct channel and none uses channel 10 (index 9, percussion)', () => { const { bytes, m } = get();
    const ch = m.tracks.filter((t) => t.notes.length).map((t) => t.channel); expect(new Set(ch).size).toBe(ch.length); expect(ch).not.toContain(9);
  });
  it('rejects more than 15 pitched stems', () => { const { bytes, m } = get();
    const many = Array.from({ length: 16 }, (_, i) => ({ ...stems[3], name: 's' + i })); expect(() => buildMidi(many, grid)).toThrow(/too many pitched stems/i);
  });
});
