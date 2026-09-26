import { NotImplementedError } from './errors';
/** Label for simultaneous notes (D-012): best tonal chord name with sharps (e.g. "Am7", "C#m"),
 *  or the sorted note names joined by spaces when no chord matches or fewer than 3 pitch classes. */
export function labelSimultaneous(midis: readonly number[]): string { throw new NotImplementedError('labelSimultaneous'); }
/** Group notes whose onsets fall within `windowSec` (default 0.05) into simultaneities. */
export function groupSimultaneous<T extends { startSec: number }>(notes: readonly T[], windowSec?: number): T[][] { throw new NotImplementedError('groupSimultaneous'); }
