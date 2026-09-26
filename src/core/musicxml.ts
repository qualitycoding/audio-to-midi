import { NotImplementedError } from './errors';
import type { BeatGrid, TabResult, Tuning } from './types';
export interface TabPart { name: string; tab: TabResult; tuning: Tuning; }
/** D-017 MusicXML 4.0 partwise score, one TAB-clef part per fretted stem. */
export function renderMusicXml(parts: readonly TabPart[], grid: BeatGrid): string { throw new NotImplementedError('renderMusicXml'); }
