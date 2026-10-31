// FROZEN — DO NOT MODIFY (see tests/FROZEN_MANIFEST.sha256)
import { describe, it, expect } from 'vitest';
import { validateSelection, validateDecoded, mixToMono, MAX_STEMS } from '../../src/io/validate';
import { validatePerfReport } from '../../src/perf/report';
/** T-014 — SC-1 (multi-stem input limits), SC-11 (hostile input); threat model A-014, D-024. */
const f = (name: string, size = 1000, type = 'audio/wav') => ({ name, size, type });
describe('T-014 input validation', () => {
  it('accepts up to 8 stems in order and rejects the rest as too-many', () => {
    const files = Array.from({ length: 10 }, (_, i) => f('s' + i + '.wav'));
    const r = validateSelection(files, 0); expect(MAX_STEMS).toBe(8); expect(r.accepted.map((x) => x.name)).toEqual(files.slice(0, 8).map((x) => x.name));
    expect(r.rejected).toEqual([{ name: 's8.wav', code: 'too-many' }, { name: 's9.wav', code: 'too-many' }]);
    expect(validateSelection(files.slice(0, 3), 7).accepted).toHaveLength(1);
  });
  it('accepts by extension case-insensitively even with empty MIME; rejects others', () => {
    const r = validateSelection([f('A.FLAC', 10, ''), f('b.mp3', 10, 'audio/mpeg'), f('x.exe', 10, 'audio/wav'), f('evil.wav.html', 10, 'text/html')], 0);
    expect(r.accepted.map((x) => x.name)).toEqual(['A.FLAC', 'b.mp3']); expect(r.rejected.map((x) => x.code)).toEqual(['bad-type', 'bad-type']);
  });
  it('rejects empty and oversized files', () => {
    const r = validateSelection([f('e.wav', 0), f('big.wav', 300 * 1024 * 1024 + 1)], 0); expect(r.rejected.map((x) => x.code)).toEqual(['empty', 'too-large']);
  });
  it('rejects decoded audio longer than 10 minutes', () => { expect(() => validateDecoded(600.001)).toThrow(/too long/i); expect(() => validateDecoded(600)).not.toThrow(); });
  it('mixes channels to mono by averaging', () => { expect(Array.from(mixToMono([Float32Array.from([1, 0]), Float32Array.from([0, 1])]))).toEqual([0.5, 0.5]); });
});
/** T-015 — SC-13 (mobile + desktop performance figures recorded in a fixed schema); D-026. */
describe('T-015 perf report schema', () => {
  const ok = { schema: 'a2m-perf/1', appCommit: 'abc1234', userAgent: 'UA', device: 'Pixel 7 (emulated)', backend: 'wasm', hardwareConcurrency: 8, stemSeconds: 240,
    decodeMs: 900, analysisMs: 40000, realtimeFactor: 6, zoomFrameMsMedian: 8, zoomFrameMsP95: 14, playStartLatencyMs: 40, timestampUtc: '2026-09-26T12:00:00Z' };
  it('accepts a complete report', () => { expect(validatePerfReport(ok)).toEqual(ok); });
  it.each(['analysisMs', 'device', 'timestampUtc', 'backend'])('rejects a report missing %s', (k) => { const x: Record<string, unknown> = { ...ok }; delete x[k]; expect(() => validatePerfReport(x)).toThrow(/invalid perf report/i); });
  it('rejects negative timings and a wrong schema tag', () => { expect(() => validatePerfReport({ ...ok, decodeMs: -1 })).toThrow(/invalid perf report/i); expect(() => validatePerfReport({ ...ok, schema: 'x' })).toThrow(/invalid perf report/i); });
});
/** T-017 — SC-1, SC-14 (no out-of-memory on mobile); R-010, D-030. */
import { memoryBudgetBytes, fitsBudget } from '../../src/io/validate';
describe('T-017 memory budget', () => {
  it('uses 400 MB on devices reporting <= 4 GB, else 1.5 GB (also when unknown)', () => {
    expect(memoryBudgetBytes(2)).toBe(400e6); expect(memoryBudgetBytes(4)).toBe(400e6); expect(memoryBudgetBytes(8)).toBe(1.5e9); expect(memoryBudgetBytes(undefined)).toBe(1.5e9);
  });
  it('admits a stem only if the running total stays within budget', () => {
    expect(fitsBudget(300e6, 100e6, 400e6)).toBe(true); expect(fitsBudget(300e6, 100e6 + 1, 400e6)).toBe(false);
  });
});
