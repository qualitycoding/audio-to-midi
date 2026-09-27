// FROZEN — DO NOT MODIFY (see tests/FROZEN_MANIFEST.sha256)
// Deterministic E2E fixtures (D-027). Output: tests/fixtures/audio/*.wav (git-ignored, regenerated in CI).
import { mkdirSync, writeFileSync } from 'node:fs';
const SR = 44100;
function lcg(seed) { let s = seed >>> 0; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
function pluck(buf, n, amp, r, decay = 0.996) { const f = 440 * 2 ** ((n.midi - 69) / 12), N = Math.round(SR / f); const d = new Float32Array(N).map(() => r() * 2 - 1);
  const s0 = Math.round(n.t * SR), len = Math.round(n.d * SR); let i = 0; for (let k = 0; k < len && s0 + k < buf.length; k++) { const a = d[i], b = d[(i + 1) % N]; d[i] = decay * 0.5 * (a + b); buf[s0 + k] += amp * a * (k > len - 400 ? (len - k) / 400 : 1); i = (i + 1) % N; } }
function wav(samples) { const b = Buffer.alloc(44 + samples.length * 2); b.write('RIFF', 0); b.writeUInt32LE(36 + samples.length * 2, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(samples.length * 2, 40);
  for (let i = 0; i < samples.length; i++) b.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(samples[i] * 32767))), 44 + i * 2); return b; }
function render(notes, secs, seed, decay) { const r = lcg(seed), x = new Float32Array(Math.round(secs * SR)); for (const n of notes) pluck(x, n, 0.4, r, decay); return x; }
mkdirSync('tests/fixtures/audio', { recursive: true });
// 12 s, 120 BPM grid at offset 0: chord every 2 s (bar), 8-string voicings
const chords = [[30, 37, 42, 46, 49], [35, 42, 47, 50], [40, 47, 52, 55, 59, 64], [45, 52, 57, 61, 64], [38, 45, 50, 54], [43, 47, 50, 55, 59, 67]];
writeFileSync('tests/fixtures/audio/guitar8.wav', wav(render(chords.flatMap((c, k) => c.map((m) => ({ t: k * 2, midi: m, d: 1.8 }))), 12, 5)));
writeFileSync('tests/fixtures/audio/bass7.wav', wav(render([18, 23, 28, 33, 38, 43, 48, 20, 21, 30, 35, 40].map((m, k) => ({ t: k, midi: m, d: 0.8 })), 12, 11, 0.998)));
{ const r = lcg(3), x = new Float32Array(12 * SR); for (let b = 0; b < 24; b++) for (let k = 0; k < 2000; k++) x[Math.round(b * 0.5 * SR) + k] = (r() * 2 - 1) * Math.exp(-k / 300) * 0.8; writeFileSync('tests/fixtures/audio/drums.wav', wav(x)); }
{ const mel = []; const r = lcg(9); let t = 0; while (t < 239) { const d = 0.2 + r() * 0.4; mel.push({ t, midi: 40 + Math.floor(r() * 36), d }); t += d + 0.05; } writeFileSync('tests/fixtures/audio/long240.wav', wav(render(mel, 240, 13))); }
{ const b = Buffer.alloc(4096); lcg(1); for (let i = 0; i < b.length; i++) b[i] = (i * 131) & 255; b.write('RIFF', 0); writeFileSync('tests/fixtures/audio/corrupt.wav', b); }
console.log('fixtures written');
