import { NotImplementedError } from '../core/errors';
import type { PitchFrame } from '../core/types';
export interface TrackOptions { windowSize?: number; hopSize?: number; minClarity?: number; }
/** McLeod pitch method frames (pitchy). Defaults: windowSize 4096 @44.1k-equivalent, hop windowSize/4, minClarity 0.9. D-020 */
export function trackPitch(samples: Float32Array, sampleRate: number, opts?: TrackOptions): PitchFrame[] { throw new NotImplementedError('trackPitch'); }
