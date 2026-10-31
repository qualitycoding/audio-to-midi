# TEST_CHALLENGE — tests/e2e/perf.spec.ts (R-023, decision D-037)

**Raised:** 2026-11-01, addendum run (A-003 red verification)
**Human decision:** R-023 option (b) — approve unfreeze-and-extend (this document, per DR-10).
**Status:** approved → amend → red-verify → re-freeze.

## Challenge

The frozen perf harness (`tests/e2e/perf.spec.ts`, T-028/T-029) asserts SC-13
`playStartLatencyMs < 100` (desktop), but never clicks play. `runBench()` reads
`player.lastStartLatencyMs`, which is only set inside `Player.play()`; the harness therefore
records the `?? 0` fallback on every run, and the SC-13 assertion passes vacuously with the
metric at its default. Every recorded PerfReport (desktop and mobile, including the real-device
one) carries `playStartLatencyMs: 0`. Same finding as the base run (DEVIATIONS §6; lesson
L-20261009T151801Z filed 2026-10-09); the file was frozen, so the addendum disclosed it as R-023
rather than touching it.

## Proposed amendment (minimal, frozen-file scoped)

1. After `waitAnalysed`, click `[data-testid="play"]`, poll `__a2m.state().player.startLatencyMs`
   until non-null (the play handler resolves after scheduling + first-sample wait), then click
   stop. Playback is stopped before the zoom bench so the zoom figures stay comparable with all
   prior runs (zoom-only); `lastStartLatencyMs` persists across stop.
2. Assert `playStartLatencyMs > 0` before the `< 100` gate (desktop) so the metric can never
   silently return to the `?? 0` fallback (prevention rule of L-20261009T151801Z).
3. No threshold changes; no other frozen file touched; `helpers.ts` unchanged.

## Red verification

- Local (this sandbox): `tsc --noEmit` + `npm run build` + unit/accuracy suites green;
  the e2e run itself is environment-blocked here (no browser binaries in the sandbox — the
  established A-002 finding; the first real measurement therefore happens on CI, which is the
  named verification environment for the perf projects).
- Expected on CI (headless Chromium, autoplay allowed by the test runner): measured latency is
  the player's own scheduling constant (~50 ms `when` offset) plus resume overhead — comfortably
  under the 100 ms budget. If a runner's `AudioContext.resume()` hangs, the player's 500 ms race
  bounds the measurement at ~550 ms and the gate fails honestly instead of recording 0.

## Re-freeze

`tests/FROZEN_MANIFEST.sha256` entry for `tests/e2e/perf.spec.ts` replaced with the amended
file's sha256 in the same commit as the amendment (freeze machinery: hash governs).
