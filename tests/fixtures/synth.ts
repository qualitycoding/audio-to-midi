// FROZEN — DO NOT MODIFY (see tests/FROZEN_MANIFEST.sha256)
// Deterministic Karplus-Strong fixture synthesis. Mirrors research/spikes/bp_spike3.mjs (C-006, C-007).
export interface RefNote { t: number; midi: number; d: number; }
export function lcg(seed: number): () => number { let s = seed >>> 0; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
export function pluck(buf: Float32Array, sr: number, n: RefNote, amp: number, rnd: () => number, decay = 0.996): void {
  const f = 440 * 2 ** ((n.midi - 69) / 12), N = Math.round(sr / f);
  const d = new Float32Array(N).map(() => rnd() * 2 - 1);
  const s0 = Math.round(n.t * sr), len = Math.round(n.d * sr); let i = 0;
  for (let k = 0; k < len && s0 + k < buf.length; k++) {
    const a = d[i], b = d[(i + 1) % N]; d[i] = decay * 0.5 * (a + b);
    buf[s0 + k] += amp * a * (k > len - 400 ? (len - k) / 400 : 1); i = (i + 1) % N;
  }
}
export function render(ref: RefNote[], lenSec: number, sr: number, seed: number, decay?: number): Float32Array {
  const r = lcg(seed), buf = new Float32Array(Math.round(lenSec * sr)); for (const n of ref) pluck(buf, sr, n, 0.5, r, decay); return buf;
}
/** Held-out monophonic fixture (C-007): random walk E2..E5, durations 0.18–0.6 s, seed 7 / render seed 99. */
export function monoHeldout(): { ref: RefNote[]; len: number; seed: number } {
  const r = lcg(7), ref: RefNote[] = []; let t = 0.2, p = 52;
  for (let k = 0; k < 30; k++) { p = Math.max(40, Math.min(76, p + Math.floor(r() * 11) - 5)); const d = 0.18 + r() * 0.42; ref.push({ t, midi: p, d }); t += d + 0.05; }
  return { ref, len: t + 1, seed: 99 };
}
/** Held-out 8-string chord fixture (C-007), seed 5. */
export function poly8Heldout(): { ref: RefNote[]; len: number; seed: number } {
  const chords = [[42, 49, 54, 57], [35, 42, 47, 50, 54], [30, 37, 42, 46, 49, 54], [47, 54, 59, 62, 66], [38, 45, 50, 54]];
  const ref: RefNote[] = []; let t = 0.3; for (const c of chords) { for (const m of c) ref.push({ t, midi: m, d: 0.9 }); t += 1.1; }
  return { ref, len: t + 1, seed: 5 };
}
/** Note-level F-measure: pitch exact (±50 cents after rounding), onset within tolSec, one-to-one matching. */
export function noteF1(ref: RefNote[], est: { startSec: number; midi: number }[], tolSec = 0.05) {
  const used = new Set<number>(); let tp = 0;
  for (const n of ref) { const j = est.findIndex((e, ix) => !used.has(ix) && e.midi === n.midi && Math.abs(e.startSec - n.t) <= tolSec); if (j >= 0) { used.add(j); tp++; } }
  const P = tp / Math.max(est.length, 1), R = tp / ref.length; return { P, R, F1: P + R ? (2 * P * R) / (P + R) : 0 };
}
