import type { BeatGrid, TabResult, Tuning } from './types'; import { secToBeats } from './beatGrid';
export interface TabPart { name: string; tab: TabResult; tuning: Tuning; }
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const STEP = [['C',0],['C',1],['D',0],['D',1],['E',0],['F',0],['F',1],['G',0],['G',1],['A',0],['A',1],['B',0]] as const;
const pitch = (m: number) => { const [s, a] = STEP[m % 12]; return { s, a, o: Math.floor(m / 12) - 1 }; };
export function renderMusicXml(parts: readonly TabPart[], g: BeatGrid): string {
  const DIV = 4; const div = DIV * (g.beatUnit / 4); const barDiv = g.beatsPerBar * DIV; // divisions per quarter = DIV; per beatUnit = DIV*4/beatUnit
  const unitDiv = DIV * 4 / g.beatUnit; const perBar = g.beatsPerBar * unitDiv; void div; void barDiv;
  let x = `<?xml version="1.0" encoding="UTF-8"?>\n<score-partwise version="4.0"><part-list>`;
  parts.forEach((p, i) => { x += `<score-part id="P${i + 1}"><part-name>${esc(p.name)}</part-name></score-part>`; }); x += `</part-list>`;
  parts.forEach((p, i) => {
    const ev = p.tab.notes.map((n) => ({ ...n, q: Math.max(0, Math.round(secToBeats(g, n.startSec) * unitDiv)) })).sort((a, b) => a.q - b.q);
    const nbars = Math.max(1, Math.ceil(((ev.at(-1)?.q ?? 0) + 1) / perBar));
    x += `<part id="P${i + 1}">`;
    for (let b = 0; b < nbars; b++) { x += `<measure number="${b + 1}">`;
      if (b === 0) { x += `<attributes><divisions>${DIV}</divisions><key print-object="no"><fifths>0</fifths></key><time print-object="no"><beats>${g.beatsPerBar}</beats><beat-type>${g.beatUnit}</beat-type></time><clef><sign>TAB</sign><line>5</line></clef><staff-details><staff-lines>${p.tuning.length}</staff-lines>`;
        p.tuning.forEach((m, k) => { const q = pitch(m); x += `<staff-tuning line="${k + 1}"><tuning-step>${q.s}</tuning-step>${q.a ? '<tuning-alter>1</tuning-alter>' : ''}<tuning-octave>${q.o}</tuning-octave></staff-tuning>`; });
        x += `</staff-details></attributes><direction placement="above"><direction-type><words>tempo</words></direction-type><sound tempo="${g.bpm}"/></direction>`; }
      const inBar = ev.filter((e) => Math.floor(e.q / perBar) === b); const starts = [...new Set(inBar.map((e) => e.q - b * perBar))]; let cur = 0;
      for (const st of starts) { if (st > cur) { x += `<note><rest/><duration>${st - cur}</duration></note>`; cur = st; }
        const nx = starts.find((s) => s > st) ?? perBar; const dur = nx - st; inBar.filter((e) => e.q - b * perBar === st).forEach((e, k) => { const q = pitch(e.midi);
          x += `<note>${k ? '<chord/>' : ''}<pitch><step>${q.s}</step>${q.a ? '<alter>1</alter>' : ''}<octave>${q.o}</octave></pitch><duration>${dur}</duration><notations><technical><string>${e.string}</string><fret>${e.fret}</fret></technical></notations></note>`; }); cur = nx; }
      if (cur < perBar) x += `<note><rest/><duration>${perBar - cur}</duration></note>`; x += `</measure>`; }
    x += `</part>`; });
  return x + `</score-partwise>\n`;
}
