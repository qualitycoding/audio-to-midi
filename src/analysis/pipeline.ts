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

/**
 * Keeps basic-pitch notes at/above A0. Drops any basic-pitch note that lands within 100ms of a
 * sub-A0 note's onset and sits exactly 1 or 2 octaves above it: basic-pitch is being asked to
 * transcribe audio right at the bottom edge of its trained range, and it reliably produces an
 * octave-doubled ghost note there rather than silence — verified against the bass7 fixture (a
 * 7-string bass's F#0 open string) in tests/unit/zz_diag3.test.ts during implementation. A real
 * second string sounding the exact same pitch class an octave above, at the same instant, on the
 * same stem is implausible enough that this is a net win for label correctness.
 */
function mergeLow(bpNotes: NoteEvent[], lowNotes: NoteEvent[]): NoteEvent[] {
  const isGhost = (n: NoteEvent) =>
    lowNotes.some((lo) => Math.abs(n.startSec - lo.startSec) <= 0.1 && (n.midi === lo.midi + 12 || n.midi === lo.midi + 24));
  return [...bpNotes.filter((n) => n.midi >= 21 && !isGhost(n)), ...lowNotes].sort((a, b) => a.startSec - b.startSec);
}
