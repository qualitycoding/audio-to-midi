# G-002 evidence bundle — publish approval

Per `plan/GATES.md`. Recorded at merge time (S-016).

## Evidence
- CI run (commit `b7b76f2`, reproduced identically at `3c3b08e`):
  https://github.com/qualitycoding/audio-to-midi/actions/runs/36274302596
  — `unit` green (91/91 frozen tests, freeze verify, audit, typecheck); `e2e` green on
  chromium/webkit/mobile-chromium/mobile-webkit (8/8 each); `e2e firefox` 7/8 (one known
  upstream-only failure, see below); `perf desktop-perf` and `perf mobile-perf` both green.
- Desktop perf: `perf/results/desktop-perf-2026-09-26T215252.946Z.json` — 240s stem analysed in
  41.9s (budget < 60s), zoom frame median 2ms / p95 3ms (budget < 16ms).
- Mobile perf (emulated, 4x CPU throttle): `perf/results/mobile-perf-2026-09-26T215539.648Z.json`
  — 203s analysis, zoom median 11.1ms / p95 12.9ms (recorded, not gated per A-013).
- Mobile perf (real Android device, via the on-page bench panel):
  `perf/results/real-android-2026-09-27T111013.json` — 40.0s analysis (6.01x realtime), zoom
  median 3.4ms / p95 7ms.
- Live deployment already verified reachable: https://qualitycoding.github.io/audio-to-midi/
  (deployed from `impl/v0.1` ahead of merge, at the person's explicit request, to obtain the
  real-device bench link above).
- `npm run audit`: 0 vulnerabilities.
- Deployed/reviewed commit: `impl/v0.1` at the point of merge into `main`.

## Known gap accepted
Headless Firefox on Linux CI cannot advance its Web Audio clock
(https://github.com/microsoft/playwright/issues/18206), failing one playback test
(T-022) for that CI project only. Chromium and WebKit pass the identical test against
identical app code. Documented in `DEVIATIONS.md` §4. **Explicitly accepted by the person
in this chat ("Proceed") rather than fixed or worked around**, per DR-11/Rule 9 — no test
was weakened or skipped to hide this.

## Evidence caveat disclosed
`playStartLatencyMs` in every recorded PerfReport is 0, not a real measurement — the frozen
`perf.spec.ts` never exercises the `play` button before calling `bench()`. Disclosed in
`perf/MOBILE.md` and `DEVIATIONS.md` §6 rather than presented as a clean pass.

## Questions answered (per plan/GATES.md)
0. Planning PAT revocation — asked of the person at hand-off; each token used during
   implementation was single-purpose and removed from the sandbox after use.
1. Publish this commit — **yes** (already live, per above; person confirmed via "Proceed").
2. Accept the recorded mobile figures — **yes** (emulated + real Android; no real iOS figure
   collected).

## Disposition
**proceed** — PR #1 merged into `main`.
