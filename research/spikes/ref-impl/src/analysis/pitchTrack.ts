import { PitchDetector } from 'pitchy'; import type { PitchFrame } from '../core/types';
export interface TrackOptions { windowSize?: number; hopSize?: number; minClarity?: number; }
export function trackPitch(x: Float32Array, sr: number, o: TrackOptions = {}): PitchFrame[] {
  const W = o.windowSize ?? 2 ** Math.round(Math.log2(4096 * sr / 44100)), H = o.hopSize ?? W / 4, mc = o.minClarity ?? 0.9; const d = PitchDetector.forFloat32Array(W); const out: PitchFrame[] = [];
  for (let s = 0; s + W <= x.length; s += H) { const w = x.subarray(s, s + W); let e = 0; for (const v of w) e += v * v; if (e / W < 1e-8) continue;
    const [hz, c] = d.findPitch(w, sr); if (c >= mc && hz > 15) out.push({ timeSec: (s + W / 2) / sr, hz, clarity: c }); } return out; }
