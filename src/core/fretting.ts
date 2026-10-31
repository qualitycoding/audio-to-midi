import type { NoteEvent, TabResult, TabNote, Tuning } from './types'; import { MAX_FRET } from './tunings'; import { groupSimultaneous } from './chord';
export interface FretOptions { maxFret?: number; chordWindowSec?: number; }
// D-015 reference: state = (voicing, hand position h). Fretted notes need h <= f <= h+3 (4-fret span), open strings any h.
// cost = |Δh| + 0.01*Σfret + (h >= 5 ? 0.5 : 0) per open string + 100 per dropped note.
type V = { frets: { n: NoteEvent; s: number; f: number }[]; dropped: NoteEvent[]; hs: number[]; own: number[] };
function voicings(ns: NoteEvent[], t: Tuning, mf: number): V[] {
  const S = t.length, res: V[] = [];
  const opts = ns.map((n) => { const o: { s: number; f: number }[] = []; for (let i = 0; i < S; i++) { const f = n.midi - t[i]; if (f >= 0 && f <= mf) o.push({ s: S - i, f }); } return o; });
  const rec = (k: number, used: Set<number>, acc: V['frets'], dropped: NoteEvent[]) => {
    if (res.length > 3000) return;
    if (k === ns.length) { const fr = acc.filter((a) => a.f > 0).map((a) => a.f); const lo = fr.length ? Math.max(1, Math.max(...fr) - 3) : 1, hi = fr.length ? Math.min(...fr) : mf;
      if (lo > hi) return; const hs: number[] = [], own: number[] = []; const opens = acc.length - fr.length, sum = fr.reduce((a, b) => a + b, 0);
      for (let h = lo; h <= hi; h++) { hs.push(h); own.push(0.01 * sum + (h >= 5 ? 0.5 * opens : 0) + 100 * dropped.length); }
      res.push({ frets: [...acc], dropped: [...dropped], hs, own }); return; }
    for (const o of opts[k]) if (!used.has(o.s)) { used.add(o.s); acc.push({ n: ns[k], ...o }); rec(k + 1, used, acc, dropped); acc.pop(); used.delete(o.s); }
    rec(k + 1, used, acc, [...dropped, ns[k]]);
  };
  rec(0, new Set(), [], []); const best = Math.min(...res.map((r) => r.dropped.length)); return res.filter((r) => r.dropped.length === best);
}
export function assignFrets(notes: readonly NoteEvent[], t: Tuning, o: FretOptions = {}): TabResult {
  const mf = o.maxFret ?? MAX_FRET, lo = Math.min(...t), hi = Math.max(...t) + mf; const unplayable: NoteEvent[] = [];
  const ok = notes.filter((n) => { const p = n.midi >= lo && n.midi <= hi; if (!p) unplayable.push(n); return p; });
  const groups = groupSimultaneous(ok, o.chordWindowSec ?? 0.05); if (!groups.length) return { notes: [], unplayable };
  const C = groups.map((g) => voicings(g, t, mf));
  // flatten states
  const st = C.map((vs) => vs.flatMap((v, vi) => v.hs.map((h, hi2) => ({ vi, h, own: v.own[hi2] }))));
  let cost = st[0].map((s) => s.own); const back: number[][] = [];
  for (let k = 1; k < st.length; k++) { const nc: number[] = [], nb: number[] = [];
    for (const s of st[k]) { let b = Infinity, bi = 0; for (let j = 0; j < st[k - 1].length; j++) { const v = cost[j] + Math.abs(s.h - st[k - 1][j].h); if (v < b - 1e-12) { b = v; bi = j; } } nc.push(b + s.own); nb.push(bi); }
    cost = nc; back.push(nb); }
  let i = 0; for (let j = 1; j < cost.length; j++) if (cost[j] < cost[i] - 1e-12) i = j;
  const out: TabNote[] = []; const picks: V[] = [];
  for (let k = st.length - 1; k >= 0; k--) { picks.unshift(C[k][st[k][i].vi]); if (k > 0) i = back[k - 1][i]; }
  for (const v of picks) { for (const x of v.frets) out.push({ startSec: x.n.startSec, durationSec: x.n.durationSec, midi: x.n.midi, string: x.s, fret: x.f }); unplayable.push(...v.dropped); }
  return { notes: out, unplayable };
}
