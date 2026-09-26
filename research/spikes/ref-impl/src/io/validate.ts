export const MAX_STEMS = 8, MAX_DURATION_SEC = 600, MAX_FILE_BYTES = 300 * 1024 * 1024;
export const ACCEPTED_EXT = ['.wav', '.mp3', '.ogg', '.oga', '.flac'] as const;
export interface FileLike { name: string; size: number; type: string; }
export interface Rejection { name: string; code: 'too-many' | 'bad-type' | 'too-large' | 'empty'; }
export function validateSelection(files: readonly FileLike[], loaded: number) { const accepted: FileLike[] = [], rejected: Rejection[] = [];
  for (const f of files) { const ext = f.name.toLowerCase().slice(f.name.lastIndexOf('.'));
    if (!(ACCEPTED_EXT as readonly string[]).includes(ext)) rejected.push({ name: f.name, code: 'bad-type' });
    else if (f.size === 0) rejected.push({ name: f.name, code: 'empty' }); else if (f.size > MAX_FILE_BYTES) rejected.push({ name: f.name, code: 'too-large' });
    else if (loaded + accepted.length >= MAX_STEMS) rejected.push({ name: f.name, code: 'too-many' }); else accepted.push(f); }
  return { accepted, rejected }; }
export function validateDecoded(d: number) { if (!(d <= MAX_DURATION_SEC)) throw new RangeError('audio too long'); }
export function mixToMono(ch: readonly Float32Array[]) { const o = new Float32Array(ch[0].length); for (const c of ch) for (let i = 0; i < o.length; i++) o[i] += c[i] / ch.length; return o; }
