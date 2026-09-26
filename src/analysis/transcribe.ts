import { NotImplementedError } from '../core/errors';
import type { DetectionMode, NoteEvent } from '../core/types';
/** D-022 thresholds, chosen by spike (research/spikes/basic-pitch-thresholds). */
export const PRESETS = {
  mono: { onsetThresh: 0.7, frameThresh: 0.5, minNoteLenFrames: 11 },
  poly: { onsetThresh: 0.5, frameThresh: 0.3, minNoteLenFrames: 5 },
} as const;
export type Backend = 'wasm' | 'webgl' | 'cpu';
/** Select and initialise a TF.js backend in order wasm -> webgl (float32-capable only) -> cpu. D-023 */
export async function initBackend(preferred?: Backend[], wasmPath?: string): Promise<Backend> { throw new NotImplementedError('initBackend'); }
/** Transcribe 22050 Hz mono audio with basic-pitch. `model` is a URL or a tf.io.IOHandler. */
export async function transcribe(samples22k: Float32Array, mode: DetectionMode, model: unknown, onProgress?: (p: number) => void): Promise<NoteEvent[]> { throw new NotImplementedError('transcribe'); }
