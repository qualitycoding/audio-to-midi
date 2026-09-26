import { NotImplementedError } from './errors';
import type { BeatGrid, TabResult, Tuning } from './types';
export interface AsciiOptions { colsPerBeat?: number; barsPerLine?: number; title?: string; }
/** D-016 ASCII tab. One text line per string, highest string first, labelled with the open-string name. */
export function renderAsciiTab(tab: TabResult, tuning: Tuning, grid: BeatGrid, opts?: AsciiOptions): string { throw new NotImplementedError('renderAsciiTab'); }
