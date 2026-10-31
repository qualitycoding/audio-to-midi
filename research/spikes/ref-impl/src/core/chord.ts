import { Chord } from 'tonal'; import { midiToName } from './notes';
export function labelSimultaneous(midis: readonly number[]): string {
  const s = [...midis].sort((a, b) => a - b); const pcs = [...new Set(s.map((m) => midiToName(m).replace(/-?\d+$/, '')))];
  const names = [...new Set(s)].map(midiToName).join(' ');
  if (pcs.length < 3) return names; const d = Chord.detect(pcs); if (!d.length) return names;
  return d[0].replace(/^([A-G]#?)M$/, '$1'); }
export function groupSimultaneous<T extends { startSec: number }>(notes: readonly T[], w = 0.05): T[][] {
  const s = [...notes].sort((a, b) => a.startSec - b.startSec); const out: T[][] = [];
  for (const n of s) { const g = out.at(-1); if (g && n.startSec - g[0].startSec <= w) g.push(n); else out.push([n]); } return out; }
