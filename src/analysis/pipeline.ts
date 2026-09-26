import { initBackend, transcribe, type Backend } from './transcribe';
import { trackPitch } from './pitchTrack';
import { segmentSubA0 } from './subA0';
import { resampleTo22050 } from '../io/decode';
import type { DetectionMode, NoteEvent, PitchFrame } from '../core/types';

let backendPromise: Promise<Backend> | null = null;
export function ensureBackend(base: string): Promise<Backend> {
  if (!backendPromise) backendPromise = initBackend(['wasm', 'webgl', 'cpu'], `${base}tfjs-wasm/`);
  return backendPromise;
}

export interface AnalysisResult { notes: NoteEvent[]; backend: Backend; pitchFrames: PitchFrame[] }

/**
 * Runs basic-pitch (mono or poly preset) plus the McLeod low-range tracker, merging in any note
 * below MIDI 21 that basic-pitch cannot see (C-004). `hasLowString` gates the sub-A0 pass so it
 * only runs for stems whose tuning actually reaches that low (7-string bass).
 */
export async function analyseStem(
  mono: Float32Array,
  sampleRate: number,
  mode: DetectionMode,
  a4Hz: number,
  hasLowString: boolean,
  base: string,
  onProgress?: (p: number) => void,
): Promise<AnalysisResult> {
  const backend = await ensureBackend(base);
  const at22k = await resampleTo22050(mono, sampleRate);
  const bpNotes = await transcribe(at22k, mode, `${base}models/basic-pitch/model.json`, onProgress);
  const pitchFrames = trackPitch(mono, sampleRate);
  const notes = hasLowString ? mergeLow(bpNotes, segmentSubA0(pitchFrames, a4Hz)) : bpNotes.filter((n) => n.midi >= 21);
  return { notes, backend, pitchFrames };
}

/** Keeps basic-pitch notes at/above A0 and adds the sub-A0 notes found separately (they occupy disjoint MIDI ranges). */
function mergeLow(bpNotes: NoteEvent[], lowNotes: NoteEvent[]): NoteEvent[] {
  return [...bpNotes.filter((n) => n.midi >= 21), ...lowNotes].sort((a, b) => a.startSec - b.startSec);
}
