import { NotImplementedError } from './errors';
export interface PitchInfo { midi: number; name: string; cents: number; }
/** Nearest equal-tempered note for a frequency; names use sharps and scientific octave (C4 = MIDI 60). D-011 */
export function freqToPitch(hz: number, a4Hz = 440): PitchInfo { throw new NotImplementedError('freqToPitch'); }
/** e.g. 18 -> "F#0", 61 -> "C#4". */
export function midiToName(midi: number): string { throw new NotImplementedError('midiToName'); }
export function midiToHz(midi: number, a4Hz = 440): number { throw new NotImplementedError('midiToHz'); }
