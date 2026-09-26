import { NotImplementedError } from '../core/errors';
import type { NoteEvent, PitchFrame } from '../core/types';
/** D-021: segment frames whose rounded MIDI < 21 into notes (min duration 0.15 s, gap-merge 0.06 s). */
export function segmentSubA0(frames: readonly PitchFrame[], a4Hz?: number): NoteEvent[] { throw new NotImplementedError('segmentSubA0'); }
