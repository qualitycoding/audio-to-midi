export interface PitchInfo { midi: number; name: string; cents: number; }
const PC = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
export function midiToName(m: number): string { return PC[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1); }
export function midiToHz(m: number, a4 = 440): number { return a4 * 2 ** ((m - 69) / 12); }
export function freqToPitch(hz: number, a4 = 440): PitchInfo {
  if (!(hz > 0) || !Number.isFinite(hz)) throw new RangeError(`invalid frequency: ${hz}`);
  const x = 69 + 12 * Math.log2(hz / a4); const midi = Math.round(x); return { midi, name: midiToName(midi), cents: (x - midi) * 100 }; }
