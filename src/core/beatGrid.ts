import { NotImplementedError } from './errors';
import type { BeatGrid } from './types';
export const BPM_MIN = 20, BPM_MAX = 400;
export interface GridLine { timeSec: number; beatIndex: number; isBar: boolean; }
/** Throws ValidationError('bpm-range') outside [BPM_MIN, BPM_MAX], ('beats-per-bar') outside 1..16. D-014 */
export function validateGrid(g: BeatGrid): BeatGrid { throw new NotImplementedError('validateGrid'); }
/** Grid lines with fromSec <= t < toSec. beatIndex 0 is at offsetSec; negative indices allowed before it. */
export function gridLines(g: BeatGrid, fromSec: number, toSec: number): GridLine[] { throw new NotImplementedError('gridLines'); }
export function secToBeats(g: BeatGrid, sec: number): number { throw new NotImplementedError('secToBeats'); }
