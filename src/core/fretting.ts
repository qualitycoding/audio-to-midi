import { NotImplementedError } from './errors';
import type { NoteEvent, TabResult, Tuning } from './types';
export interface FretOptions { maxFret?: number; chordWindowSec?: number; }
/** D-015: DP fret assignment minimising hand movement. Notes outside the instrument range go to `unplayable`. */
export function assignFrets(notes: readonly NoteEvent[], tuning: Tuning, opts?: FretOptions): TabResult { throw new NotImplementedError('assignFrets'); }
