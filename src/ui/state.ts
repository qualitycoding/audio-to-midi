import type { BeatGrid, NoteEvent, StemKind, DetectionMode, PitchFrame } from '../core/types';
import type { LabelledEvent } from './noteLane';
import type { Tuning } from '../core/types';
import { TUNINGS, type TuningId } from '../core/tunings';

export interface StemState {
  id: number;
  name: string;
  kind: StemKind;
  tuningId: TuningId | 'custom';
  tuning: Tuning;
  mode: DetectionMode;
  selected: boolean;
  gain: number;
  sampleRate: number;
  mono: Float32Array;
  durationSec: number;
  analysis: 'pending' | 'running' | 'done' | 'error';
  notes: NoteEvent[];
  pitchFrames: PitchFrame[];
  /** Cached chord/note labels for `notes`; recompute only when `notes` changes (perf: avoids
   *  redoing tonal chord detection on every render/zoom frame). */
  labelledEvents: import('./noteLane').LabelledEvent[];
  analysisToken: number; // bumped to cancel an in-flight run
}

export interface Viewport { startSec: number; secPerPx: number; widthPx: number; durationSec: number; sampleRate: number; }

export interface PlayerState {
  playing: boolean;
  activeStemIndices: number[];
  currentTimeSec: number;
  startLatencyMs: number | null;
}

export const defaultTuning = (kind: StemKind): { id: TuningId; tuning: Tuning } =>
  kind === 'bass' ? { id: 'bass4', tuning: TUNINGS.bass4 } : { id: 'guitar6', tuning: TUNINGS.guitar6 };

export const defaultModeFor = (kind: StemKind): DetectionMode => (kind === 'bass' ? 'mono' : 'poly');

export interface AppState {
  stems: StemState[];
  grid: BeatGrid;
  a4Hz: number;
  viewport: Viewport;
  player: PlayerState;
  backend: string;
}

export function createInitialState(): AppState {
  return {
    stems: [],
    grid: { bpm: 120, offsetSec: 0, beatsPerBar: 4, beatUnit: 4 },
    a4Hz: 440,
    viewport: { startSec: 0, secPerPx: 1, widthPx: 900, durationSec: 0, sampleRate: 44100 },
    player: { playing: false, activeStemIndices: [], currentTimeSec: 0, startLatencyMs: null },
    backend: 'pending',
  };
}
