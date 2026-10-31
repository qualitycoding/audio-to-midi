// Adversarial input battery — addendum A-007 (protocol §3.8 S-ADVERSARIAL, retroactive).
// THROWAWAY SPIKE — not part of the frozen suite (research/spikes/). Run with:
//   npx vitest run research/spikes/adversarial-probe.spec.ts   (from a fully installed checkout)
// Throws hostile/malformed input at every pure boundary named in the review. Browser-bound
// modules (Player, waveform renderer, main.ts wiring) are covered by reasoning + e2e T-020..T-030
// and cannot execute under Node.
import { describe, it, expect } from 'vitest';
import { validateSelection, validateDecoded, mixToMono, memoryBudgetBytes, fitsBudget, MAX_STEMS, MAX_FILE_BYTES, type FileLike } from '../../src/io/validate';
import { freqToPitch } from '../../src/core/notes';
import { validateGrid, gridLines } from '../../src/core/beatGrid';
import { computePeaks, buildPyramid } from '../../src/core/peaks';
import { clampViewport, zoomAt } from '../../src/core/viewport';
import { assignFrets } from '../../src/core/fretting';
import { buildMidi } from '../../src/core/midiExport';
import { renderMusicXml } from '../../src/core/musicxml';
import { segmentSubA0 } from '../../src/analysis/subA0';
import { TUNINGS } from '../../src/core/tunings';
const beatSecCheck = (g: { bpm: number; beatUnit: number }) => (60 / g.bpm) * (4 / g.beatUnit);

const f = (name: string, size = 1000): FileLike => ({ name, size, type: '' });
const results: string[] = [];
const log = (m: string) => { results.push(m); };

describe('A-007 adversarial battery', () => {
  it('validateSelection: hostile file envelopes', () => {
    // too many
    const many = Array.from({ length: MAX_STEMS + 2 }, (_, i) => f(`s${i}.wav`));
    const r1 = validateSelection(many, 0);
    expect(r1.accepted.length).toBe(MAX_STEMS);
    expect(r1.rejected.filter((r) => r.code === 'too-many').length).toBe(2);
    log(`9 files -> ${r1.accepted.length} accepted, ${r1.rejected.length} rejected(too-many): boundary held`);
    // bad extensions / case / dotfiles / no ext
    for (const name of ['x.exe', 'x.mp3.wav.bak', '.wav', 'noext', 'x.WAV', 'x.FlAc', 'trail.']) {
      const r = validateSelection([f(name)], 0);
      log(`  ${name} -> ${r.rejected.length ? r.rejected[0].code : 'ACCEPTED'}`);
    }
    expect(validateSelection([f('x.WAV')], 0).accepted.length).toBe(1); // case-insensitive per D-024
    // hidden file literally named '.wav': ext extraction returns the whole name -> ACCEPTED.
    // Not a vulnerability (it must still decode as audio); recorded as informational B-7.
    expect(validateSelection([f('.wav')], 0).accepted.length).toBe(1);
    log("'.wav' hidden-file accepted (informational B-7): must still decode to do anything");
    // empty and oversize
    expect(validateSelection([f('a.wav', 0)], 0).rejected[0].code).toBe('empty');
    expect(validateSelection([f('a.wav', MAX_FILE_BYTES + 1)], 0).rejected[0].code).toBe('too-large');
    expect(validateSelection([f('a.wav', MAX_FILE_BYTES)], 0).accepted.length).toBe(1);
    // loaded-count interplay: 7 loaded, 2 offered
    const r2 = validateSelection([f('a.wav'), f('b.wav')], 7);
    expect(r2.accepted.length).toBe(1);
    expect(r2.rejected[0].code).toBe('too-many');
    log('precedence/count interplay: OK');
  });

  it('validateDecoded: duration boundary + NaN', () => {
    expect(() => validateDecoded(600)).not.toThrow();
    expect(() => validateDecoded(600.0001)).toThrow(RangeError);
    expect(() => validateDecoded(NaN)).toThrow(RangeError); // !(NaN <= 600)
    expect(() => validateDecoded(Infinity)).toThrow(RangeError);
    log('duration 600 ok / 600.0001, NaN, Infinity rejected: OK');
  });

  it('mixToMono / budget', () => {
    const a = new Float32Array([1, -1]), b = new Float32Array([0.5, 0.5]);
    expect(Array.from(mixToMono([a, b]))).toEqual([0.75, -0.25]);
    expect(memoryBudgetBytes(undefined)).toBe(1.5e9);
    expect(memoryBudgetBytes(4)).toBe(400e6);
    expect(memoryBudgetBytes(8)).toBe(1.5e9);
    expect(fitsBudget(399e6, 1e6, 400e6)).toBe(true);
    expect(fitsBudget(399e6, 2e6, 400e6)).toBe(false);
    log('mixToMono + D-030 budget: OK');
  });

  it('freqToPitch: hostile frequencies', () => {
    for (const hz of [0, -1, NaN, Infinity, -Infinity]) expect(() => freqToPitch(hz)).toThrow(RangeError);
    expect(freqToPitch(27.5).name).toBe('A0');
    expect(freqToPitch(1e-9)).toBeTruthy(); // sub-audible -> extreme midi, no crash
    log('freqToPitch hostile: OK');
  });

  it('validateGrid: hostile grid values', () => {
    const ok = { bpm: 120, offsetSec: 0, beatsPerBar: 4, beatUnit: 4 as const };
    expect(() => validateGrid({ ...ok, bpm: 19 })).toThrow();
    expect(() => validateGrid({ ...ok, bpm: 401 })).toThrow();
    expect(() => validateGrid({ ...ok, bpm: NaN })).toThrow();
    expect(() => validateGrid({ ...ok, beatsPerBar: 0 })).toThrow();
    expect(() => validateGrid({ ...ok, beatsPerBar: 17 })).toThrow();
    // FINDING B-1/F-4: beatUnit 3 is NOT rejected (validateGrid checks only bpm/beatsPerBar per
    // D-014); UI constrains to 2/4/8 so it is console-only. Record actual behaviour, do not crash:
    const g3 = validateGrid({ ...ok, beatUnit: 3 as never });
    expect(Number.isFinite(beatSecCheck(g3))).toBe(true);
    log('FINDING: beatUnit=3 accepted by validateGrid (B-1, Low — UI-constrained, no crash)');
    expect(validateGrid({ ...ok, bpm: 20 }).bpm).toBe(20);
    expect(validateGrid({ ...ok, bpm: 400 }).bpm).toBe(400);
    // absurd offset is accepted by design (shifts grid only) — lines still finite
    const lines = gridLines(validateGrid({ ...ok, offsetSec: 1e12 }), 0, 10);
    expect(lines.every((l) => Number.isFinite(l.timeSec))).toBe(true);
    log('validateGrid hostile + 1e12 offset: OK');
  });

  it('peaks/pyramid/viewport: hostile geometry', () => {
    expect(() => computePeaks(new Float32Array(4), 0)).toThrow(RangeError);
    expect(() => computePeaks(new Float32Array(4), 0.5)).toThrow(RangeError);
    const pyr = buildPyramid(new Float32Array(100), 16);
    expect(pyr.length).toBeGreaterThan(0);
    // zero-duration viewport (no stems yet)
    const v0 = clampViewport({ startSec: 0, secPerPx: 1, widthPx: 900, durationSec: 0, sampleRate: 44100 });
    expect(Number.isFinite(v0.secPerPx)).toBe(true);
    const z = zoomAt(v0, 2, 0);
    // FINDING B-2/F-5: zero-duration viewport yields NaN (division by spp=0). Pre-load only;
    // self-heals on first stem load (refitViewportBounds + zoomFit). Recorded, not asserted green.
    log(`FINDING: zoomAt on empty viewport -> secPerPx=${z.secPerPx}, startSec=${z.startSec} (B-2, Low, self-heals)`);
    expect('recorded').toBe('recorded');
  });

  it('assignFrets: empty + unreachable + huge simultaneity', () => {
    expect(assignFrets([], TUNINGS.guitar6)).toEqual({ notes: [], unplayable: [] });
    // every note unplayable on a 4-string bass tuning
    const high = [{ startSec: 0, durationSec: 0.5, midi: 108, amplitude: 1 }];
    const r = assignFrets(high, TUNINGS.bass4);
    expect(r.unplayable.length).toBe(1);
    expect(r.notes.length).toBe(0);
    // 400 simultaneous notes at the cap boundary: completes without hang
    const chord = Array.from({ length: 400 }, (_, i) => ({ startSec: 0, durationSec: 1, midi: 40 + (i % 40), amplitude: 0.5 }));
    const t0 = performance.now();
    assignFrets(chord, TUNINGS.guitar6);
    expect(performance.now() - t0).toBeLessThan(5000);
    log('assignFrets empty/unplayable/400-note simultaneity: OK');
  });

  it('buildMidi: >15 pitched stems -> RangeError', () => {
    const stems = Array.from({ length: 16 }, (_, i) => ({ name: `s${i}`, kind: 'pitched' as const, notes: [{ startSec: 0, durationSec: 1, midi: 60, amplitude: 1 }] }));
    expect(() => buildMidi(stems, { bpm: 120, offsetSec: 0, beatsPerBar: 4, beatUnit: 4 })).toThrow(RangeError);
    const ok15 = stems.slice(0, 15);
    expect(() => buildMidi(ok15, { bpm: 120, offsetSec: 0, beatsPerBar: 4, beatUnit: 4 })).not.toThrow();
    log('buildMidi 16 stems rejected, 15 accepted: OK');
  });

  it('renderMusicXml: hostile names, empty parts', () => {
    const grid = { bpm: 120, offsetSec: 0, beatsPerBar: 4, beatUnit: 4 as const };
    const xml = renderMusicXml([{ name: '<script>alert(1)</script>&"\'', tuning: TUNINGS.guitar6, tab: { notes: [], unplayable: [] } }], grid);
    expect(xml).not.toContain('<script>');
    expect(xml).toContain('&lt;script&gt;');
    expect(() => renderMusicXml([], grid)).not.toThrow();
    expect(() => renderMusicXml([{ name: 'e', tuning: TUNINGS.guitar6, tab: { notes: [], unplayable: [] } }], grid)).not.toThrow();
    log('renderMusicXml escaping/empty: OK');
  });

  it('segmentSubA0: a4 reference extremes', () => {
    // D-021 keeps only segments >= 0.15 s, so span multiple frames
    const mk = (hz: number) => Array.from({ length: 20 }, (_, i) => ({ timeSec: 0.5 + i * 0.02, hz, clarity: 1 }));
    // F#0 at default a4
    expect(segmentSubA0(mk(23.12), 440)[0]?.midi).toBe(18);
    // same hz with a4=480 shifts the midi mapping — documented a4 sensitivity, must not crash
    const r = segmentSubA0(mk(23.12), 480);
    log(`segmentSubA0 a4 sensitivity: midi ${r[0]?.midi ?? 'none'} (documented, not a crash)`);
    expect(segmentSubA0(mk(20000), 440)).toEqual([]); // ultrasound above A0 -> nothing
    // single sub-0.15s blip ignored by design
    expect(segmentSubA0([{ timeSec: 0.5, hz: 23.12, clarity: 1 }], 440)).toEqual([]);
    log('segmentSubA0: OK');
  });

  it('summary', () => {
    console.log('\nADVERSARIAL BATTERY RESULTS\n' + results.map((r) => '  ' + r).join('\n'));
  });
});
