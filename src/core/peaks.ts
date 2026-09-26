export interface Peaks { samplesPerBin: number; min: Float32Array; max: Float32Array; }
export function computePeaks(x: Float32Array, spb: number): Peaks { if (!(spb >= 1)) throw new RangeError('samplesPerBin must be >= 1');
  const n = Math.ceil(x.length / spb), mn = new Float32Array(n), mx = new Float32Array(n);
  for (let b = 0; b < n; b++) { let lo = Infinity, hi = -Infinity; for (let i = b * spb; i < Math.min(x.length, (b + 1) * spb); i++) { if (x[i] < lo) lo = x[i]; if (x[i] > hi) hi = x[i]; } mn[b] = lo; mx[b] = hi; }
  return { samplesPerBin: spb, min: mn, max: mx }; }
export function buildPyramid(x: Float32Array, base = 16): Peaks[] { const out: Peaks[] = []; for (let s = base; ; s *= 2) { out.push(computePeaks(x, s)); if (s >= x.length) break; } return out; }
