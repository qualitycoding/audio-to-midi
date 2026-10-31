// FROZEN — DO NOT MODIFY (see tests/FROZEN_MANIFEST.sha256)
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { initBackend, transcribe } from '../../src/analysis/transcribe';
import { render, monoHeldout, poly8Heldout, noteF1 } from '../fixtures/synth';
/** T-013 — SC-10 (detection accuracy); C-005..C-007, C-009 (wasm Fill patch parity), D-022, D-023.
 *  Thresholds: mono F1 >= 0.95 (spike 0.984), poly F1 >= 0.80 (spike 0.833) on HELD-OUT fixtures not used to pick presets. */
const dir = 'node_modules/@spotify/basic-pitch/model/';
const handler = { load: async () => { const m = JSON.parse(readFileSync(dir + 'model.json', 'utf8')); const w = readFileSync(dir + m.weightsManifest[0].paths[0]);
  return { modelTopology: m.modelTopology, format: m.format, weightSpecs: m.weightsManifest[0].weights, weightData: w.buffer.slice(w.byteOffset, w.byteOffset + w.byteLength) }; } };
describe('T-013 transcription accuracy (wasm backend, Node)', () => {
  beforeAll(async () => { expect(await initBackend(['wasm'], 'node_modules/@tensorflow/tfjs-backend-wasm/dist/')).toBe('wasm'); });
  it('monophonic preset: F1 >= 0.95', async () => {
    const { ref, len, seed } = monoHeldout(); const notes = await transcribe(render(ref, len, 22050, seed), 'mono', handler); expect(noteF1(ref, notes).F1).toBeGreaterThanOrEqual(0.95);
  });
  it('polyphonic preset on 8-string chords: F1 >= 0.80', async () => {
    const { ref, len, seed } = poly8Heldout(); const notes = await transcribe(render(ref, len, 22050, seed), 'poly', handler); expect(noteF1(ref, notes).F1).toBeGreaterThanOrEqual(0.8);
  });
  it('reports progress monotonically ending at 1', async () => {
    const p: number[] = []; await transcribe(new Float32Array(22050 * 3), 'poly', handler, (x) => p.push(x));
    expect(p.at(-1)).toBeCloseTo(1, 6); for (let i = 1; i < p.length; i++) expect(p[i]).toBeGreaterThanOrEqual(p[i - 1]);
  });
});
