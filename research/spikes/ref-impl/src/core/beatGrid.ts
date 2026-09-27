import type { BeatGrid } from './types'; export const BPM_MIN = 20, BPM_MAX = 400;
export interface GridLine { timeSec: number; beatIndex: number; isBar: boolean; }
const beatSec = (g: BeatGrid) => (60 / g.bpm) * (4 / g.beatUnit);
export function validateGrid(g: BeatGrid): BeatGrid { if (!(g.bpm >= BPM_MIN && g.bpm <= BPM_MAX)) throw new RangeError('bpm out of range'); if (!(Number.isInteger(g.beatsPerBar) && g.beatsPerBar >= 1 && g.beatsPerBar <= 16)) throw new RangeError('beatsPerBar out of range'); return g; }
export function gridLines(g: BeatGrid, from: number, to: number): GridLine[] { const b = beatSec(g); const out: GridLine[] = [];
  for (let k = Math.ceil((from - g.offsetSec) / b - 1e-9); ; k++) { const t = g.offsetSec + k * b; if (t >= to - 1e-12) break; if (t < from - 1e-12) continue; out.push({ timeSec: t, beatIndex: k + 0, isBar: ((k % g.beatsPerBar) + g.beatsPerBar) % g.beatsPerBar === 0 }); } return out; }
export function secToBeats(g: BeatGrid, s: number): number { return (s - g.offsetSec) / beatSec(g); }
