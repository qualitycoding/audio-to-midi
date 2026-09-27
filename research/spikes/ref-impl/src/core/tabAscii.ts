import type { BeatGrid, TabResult, Tuning } from './types'; import { secToBeats } from './beatGrid'; import { midiToName } from './notes';
export interface AsciiOptions { colsPerBeat?: number; barsPerLine?: number; title?: string; }
export function renderAsciiTab(tab: TabResult, t: Tuning, g: BeatGrid, o: AsciiOptions = {}): string {
  const cpb = o.colsPerBeat ?? 4, bpl = o.barsPerLine ?? 4, S = t.length; const all = [...tab.notes];
  const firstBar = all.length ? Math.floor(Math.min(0, ...all.map((n) => secToBeats(g, n.startSec))) / g.beatsPerBar) : 0;
  const lastBar = all.length ? Math.floor(Math.max(...all.map((n) => secToBeats(g, n.startSec))) / g.beatsPerBar) : 0;
  const nb = lastBar - firstBar + 1, W = g.beatsPerBar * cpb; const cells: string[][][] = Array.from({ length: S }, () => Array.from({ length: nb }, () => Array(W).fill('')));
  for (const n of all) { const b = secToBeats(g, n.startSec) - firstBar * g.beatsPerBar; const bar = Math.floor(b / g.beatsPerBar); const col = Math.min(W - 1, Math.round((b - bar * g.beatsPerBar) * cpb)); cells[n.string - 1][bar][col] = String(n.fret); }
  const labels = Array.from({ length: S }, (_, i) => midiToName(t[S - 1 - i])); const lw = Math.max(...labels.map((l) => l.length));
  const colW = Array.from({ length: nb }, (_, bar) => Array.from({ length: W }, (_, c) => Math.max(1, ...cells.map((r) => r[bar][c].length))));
  const out: string[] = o.title ? [o.title, ''] : [];
  for (let s0 = 0; s0 < nb; s0 += bpl) { for (let s = 0; s < S; s++) { let line = labels[s].padEnd(lw) + ' |';
      for (let bar = s0; bar < Math.min(nb, s0 + bpl); bar++) { for (let c = 0; c < W; c++) line += (cells[s][bar][c] || '').padEnd(colW[bar][c], '-') + '-'; line += '|'; }
      out.push(line); } out.push(''); }
  if (tab.unplayable.length) out.push('# unplayable: ' + tab.unplayable.map((n) => `${midiToName(n.midi)}@${n.startSec.toFixed(3)}s`).join(', '));
  return out.join('\n');
}
