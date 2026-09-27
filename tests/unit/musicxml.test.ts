// FROZEN — DO NOT MODIFY (see tests/FROZEN_MANIFEST.sha256)
import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os'; import { join } from 'node:path';
import { renderMusicXml } from '../../src/core/musicxml';
import { assignFrets } from '../../src/core/fretting';
import { TUNINGS } from '../../src/core/tunings';
import type { BeatGrid, NoteEvent } from '../../src/core/types';
/** T-006 — SC-8 (MusicXML tab export); C-016, C-017 (MusicXML 4.0 tab encoding), D-017.
 *  Validates against the official W3C MusicXML 4.0 XSD vendored in tests/schema (hashes in FROZEN_MANIFEST). */
const grid: BeatGrid = { bpm: 100, offsetSec: 0.1, beatsPerBar: 7, beatUnit: 8 };
const n = (startSec: number, midi: number, d = 0.3): NoteEvent => ({ startSec, durationSec: d, midi, amplitude: 0.7 });
function validate(xml: string) {
  const dir = mkdtempSync(join(tmpdir(), 'a2m-')); const f = join(dir, 'out.musicxml'); writeFileSync(f, xml);
  return execFileSync('xmllint', ['--noout', '--schema', 'tests/schema/musicxml.local.xsd', f], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}
describe('T-006 MusicXML tab', () => {
  const build = () => { const g8 = assignFrets([n(0.1, 30), n(0.5, 64 + 27), n(0.9, 42), n(0.9, 49), n(0.9, 54), n(2.0, 55, 1.5)], TUNINGS.guitar8);
  const b7 = assignFrets([n(0.1, 18), n(0.6, 48 + 27)], TUNINGS.bass7);
  return renderMusicXml([{ name: 'Guitar <8>', tab: g8, tuning: TUNINGS.guitar8 }, { name: 'Bass & 7', tab: b7, tuning: TUNINGS.bass7 }], grid); };
  let cached: string | undefined; const xmlOf = () => (cached ??= build());
  it('validates against the MusicXML 4.0 XSD', () => { const xml = xmlOf(); expect(() => validate(xml)).not.toThrow(); });
  it('declares TAB clef, staff-lines per string count, tunings bottom-to-top', () => { const xml = xmlOf();
    expect(xml).toMatch(/<sign>TAB<\/sign>/); expect(xml).toMatch(/<staff-lines>8<\/staff-lines>/); expect(xml).toMatch(/<staff-lines>7<\/staff-lines>/);
    expect(xml).toMatch(/<staff-tuning line="1">\s*<tuning-step>F<\/tuning-step>\s*<tuning-alter>1<\/tuning-alter>\s*<tuning-octave>1<\/tuning-octave>/);
    expect(xml).toMatch(/<staff-tuning line="1">\s*<tuning-step>F<\/tuning-step>\s*<tuning-alter>1<\/tuning-alter>\s*<tuning-octave>0<\/tuning-octave>/);
  });
  it('encodes string (1 = highest) and fret, including fret 27', () => { const xml = xmlOf();
    expect(xml).toMatch(/<string>1<\/string>\s*<fret>27<\/fret>/); expect(xml).toMatch(/<string>8<\/string>\s*<fret>0<\/fret>/); expect(xml).toMatch(/<string>7<\/string>\s*<fret>0<\/fret>/);
  });
  it('writes the grid time signature and tempo', () => { const xml = xmlOf();
    expect(xml).toMatch(/<beats>7<\/beats>\s*<beat-type>8<\/beat-type>/); expect(xml).toMatch(/<sound tempo="100(\.0+)?"/);
  });
  it('escapes part names', () => { const xml = xmlOf(); expect(xml).toContain('Guitar &lt;8&gt;'); expect(xml).toContain('Bass &amp; 7'); });
});
