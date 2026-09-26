import { NotImplementedError } from './errors';
import type { BeatGrid, StemExport } from './types';
/** D-018 SMF type 1: one track per stem that has notes, tempo + time signature from the grid, notes at real time. */
export function buildMidi(stems: readonly StemExport[], grid: BeatGrid): Uint8Array { throw new NotImplementedError('buildMidi'); }
