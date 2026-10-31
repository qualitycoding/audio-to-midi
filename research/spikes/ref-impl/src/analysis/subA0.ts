import type { NoteEvent, PitchFrame } from '../core/types';
// D-021 reference: onset = first confident frame centre − windowSec (window that first fully contains the note);
export function segmentSubA0(fr: readonly PitchFrame[], a4 = 440, windowSec = 4096 / 44100): NoteEvent[] { const out: NoteEvent[] = []; let cur: { m: number; s: number; e: number } | null = null;
  const flush = () => { if (cur && cur.e - cur.s >= 0.15) out.push({ startSec: Math.max(0, cur.s - windowSec), durationSec: cur.e - cur.s + windowSec, midi: cur.m, amplitude: 0.8 }); cur = null; };
  for (const f of fr) { const m = Math.round(69 + 12 * Math.log2(f.hz / a4)); if (m >= 21) { flush(); continue; }
    if (cur && cur.m === m && f.timeSec - cur.e <= 0.06) cur.e = f.timeSec; else { flush(); cur = { m, s: f.timeSec, e: f.timeSec }; } }
  flush(); return out; }
