/**
 * Browser port of tests/fixtures/make-fixtures.mjs's melody generator, for the on-page "Run bench"
 * button (?bench=1): lets a real phone with no devtools generate its own 240 s test stem instead of
 * needing tests/fixtures/audio/long240.wav transferred onto the device. Not part of the frozen
 * fixtures or tests — perf measurement only cares about realistic duration/complexity, not exact
 * fixture content.
 */
function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
}

function pluck(buf: Float32Array, sr: number, start: number, midi: number, dur: number, amp: number, rnd: () => number): void {
  const f = 440 * 2 ** ((midi - 69) / 12);
  const n = Math.max(2, Math.round(sr / f));
  const ring = new Float32Array(n).map(() => rnd() * 2 - 1);
  const s0 = Math.round(start * sr), len = Math.round(dur * sr);
  let i = 0;
  for (let k = 0; k < len && s0 + k < buf.length; k++) {
    const a = ring[i], b = ring[(i + 1) % n];
    ring[i] = 0.996 * 0.5 * (a + b);
    buf[s0 + k] += amp * a * (k > len - 400 ? (len - k) / 400 : 1);
    i = (i + 1) % n;
  }
}

/** 240 s mono buffer at 44100 Hz, same shape of content as the frozen long240.wav fixture. */
export function synthBenchStem(sampleRate = 44100, seconds = 240): Float32Array {
  const rnd = lcg(13);
  const buf = new Float32Array(Math.round(seconds * sampleRate));
  let t = 0;
  while (t < seconds - 1) {
    const dur = 0.2 + rnd() * 0.4;
    pluck(buf, sampleRate, t, 40 + Math.floor(rnd() * 36), dur, 0.4, rnd);
    t += dur + 0.05;
  }
  return buf;
}
