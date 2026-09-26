import { NotImplementedError } from './errors';
export interface Peaks { samplesPerBin: number; min: Float32Array; max: Float32Array; }
/** Min/max per bin of `samplesPerBin` samples; length = ceil(n / samplesPerBin). D-019 */
export function computePeaks(samples: Float32Array, samplesPerBin: number): Peaks { throw new NotImplementedError('computePeaks'); }
/** Pyramid levels at samplesPerBin = base * 2^k until one bin covers the whole signal. */
export function buildPyramid(samples: Float32Array, base?: number): Peaks[] { throw new NotImplementedError('buildPyramid'); }
