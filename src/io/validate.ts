import { NotImplementedError } from '../core/errors';
export const MAX_STEMS = 8, MAX_DURATION_SEC = 600, MAX_FILE_BYTES = 300 * 1024 * 1024;
export const ACCEPTED_EXT = ['.wav', '.mp3', '.ogg', '.oga', '.flac'] as const;
export interface FileLike { name: string; size: number; type: string; }
export interface Rejection { name: string; code: 'too-many' | 'bad-type' | 'too-large' | 'empty'; }
/** D-024: returns accepted files (in order, up to MAX_STEMS minus alreadyLoaded) and a rejection per other file. */
export function validateSelection(files: readonly FileLike[], alreadyLoaded: number): { accepted: FileLike[]; rejected: Rejection[] } { throw new NotImplementedError('validateSelection'); }
/** Called after decode. Throws ValidationError('too-long') if durationSec > MAX_DURATION_SEC. */
export function validateDecoded(durationSec: number): void { throw new NotImplementedError('validateDecoded'); }
/** Mix N channels to mono by averaging. */
export function mixToMono(channels: readonly Float32Array[]): Float32Array { throw new NotImplementedError('mixToMono'); }
