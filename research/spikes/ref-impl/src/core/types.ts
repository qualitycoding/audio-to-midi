/** A detected note. Times in seconds from stem start. `midi` is an integer MIDI note number (may be < 21). */
export interface NoteEvent { startSec: number; durationSec: number; midi: number; amplitude: number; }
/** Tempo grid set by the user (D-014). */
export interface BeatGrid { bpm: number; offsetSec: number; beatsPerBar: number; beatUnit: 2 | 4 | 8; }
/** Open-string MIDI numbers, index 0 = lowest-pitched string. */
export type Tuning = readonly number[];
export interface TabNote { startSec: number; durationSec: number; midi: number; string: number; fret: number; }
/** `string` is 1-based with 1 = highest-pitched string (MusicXML convention, C-017). */
export interface TabResult { notes: TabNote[]; unplayable: NoteEvent[]; }
export type StemKind = 'guitar' | 'bass' | 'pitched' | 'unpitched';
export type DetectionMode = 'mono' | 'poly';
export interface StemExport { name: string; kind: StemKind; notes: NoteEvent[]; tuning?: Tuning; }
export interface PitchFrame { timeSec: number; hz: number; clarity: number; }
