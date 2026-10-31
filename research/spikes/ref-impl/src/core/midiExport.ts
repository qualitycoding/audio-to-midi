import tm from '@tonejs/midi'; import type { BeatGrid, StemExport } from './types'; const { Midi } = tm;
export function buildMidi(stems: readonly StemExport[], g: BeatGrid): Uint8Array {
  const use = stems.filter((s) => s.kind !== 'unpitched' && s.notes.length); if (use.length > 15) throw new RangeError('too many pitched stems for 15 MIDI channels');
  const m = new Midi(); m.header.setTempo(g.bpm); m.header.timeSignatures.push({ ticks: 0, timeSignature: [g.beatsPerBar, g.beatUnit] }); m.header.update();
  use.forEach((s, i) => { const t = m.addTrack(); t.name = s.name; t.channel = i < 9 ? i : i + 1;
    for (const n of s.notes) t.addNote({ midi: n.midi, time: n.startSec, duration: n.durationSec, velocity: Math.max(1, Math.round(n.amplitude * 127)) / 127 }); });
  return m.toArray(); }
