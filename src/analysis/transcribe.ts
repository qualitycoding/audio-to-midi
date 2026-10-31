import * as tf from '@tensorflow/tfjs'; import { setWasmPaths } from '@tensorflow/tfjs-backend-wasm';
import { BasicPitch, outputToNotesPoly, addPitchBendsToNoteEvents, noteFramesToTime } from '@spotify/basic-pitch';
import type { DetectionMode, NoteEvent } from '../core/types';
export const PRESETS = { mono: { onsetThresh: 0.7, frameThresh: 0.5, minNoteLenFrames: 11 }, poly: { onsetThresh: 0.5, frameThresh: 0.3, minNoteLenFrames: 5 } } as const;
export type Backend = 'wasm' | 'webgl' | 'cpu';
export async function initBackend(pref: Backend[] = ['wasm', 'webgl', 'cpu'], wasmPath?: string): Promise<Backend> {
  for (const b of pref) { try { if (b === 'wasm' && wasmPath) setWasmPaths(wasmPath); if (!(await tf.setBackend(b))) continue; await tf.ready();
      if (b === 'webgl' && !tf.env().getBool('WEBGL_RENDER_FLOAT32_CAPABLE')) continue;
      if (b === 'wasm') { const k = tf.getKernel('Fill', 'wasm')!; tf.unregisterKernel('Fill', 'wasm'); tf.registerKernel({ ...k, kernelFunc: (a: any) => (k.kernelFunc as any)({ ...a, attrs: { ...a.attrs, dtype: a.attrs.dtype ?? 'float32' } }) }); }
      return b; } catch { /* try next */ } } throw new Error('no TF.js backend available'); }
export async function transcribe(x: Float32Array, mode: DetectionMode, model: unknown, onProgress?: (p: number) => void): Promise<NoteEvent[]> {
  const bp = new BasicPitch(typeof model === 'string' ? tf.loadGraphModel(model) : tf.loadGraphModel(model as any)); const fr: number[][] = [], on: number[][] = [], ct: number[][] = [];
  await bp.evaluateModel(x, (f: number[][], o: number[][], c: number[][]) => { fr.push(...f); on.push(...o); ct.push(...c); }, (p: number) => onProgress?.(p));
  onProgress?.(1); const P = PRESETS[mode];
  return noteFramesToTime(addPitchBendsToNoteEvents(ct, outputToNotesPoly(fr, on, P.onsetThresh, P.frameThresh, P.minNoteLenFrames)))
    .map((n: any) => ({ startSec: n.startTimeSeconds, durationSec: n.durationSeconds, midi: n.pitchMidi, amplitude: n.amplitude })); }
