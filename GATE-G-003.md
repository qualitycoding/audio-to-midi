# G-003 evidence bundle — real-device mobile figures (A-013)

> **RECONSTRUCTED** by addendum A-009 (2026-11-01): this record was required by `plan/GATES.md`
> but was not present on the received `main` (A-044, R-028). It is rebuilt verbatim from the
> committed evidence of the gate response — `perf/results/real-android-2026-09-27T111013.json`,
> `perf/MOBILE.md`, and the deployed preview URL recorded there — and marked reconstructed rather
> than presented as the original. Lesson: L-20261101T042000Z.

Per `plan/GATES.md` (trigger: end of S-015; questions: paste 1–3 PerfReport JSONs from real phones
or reply `none`).

## Evidence (as committed 2026-09-27)
- Response type applied: `reports: <json>` — one real Android device report committed as
  `perf/results/real-android-2026-09-27T111013.json` (validated with `validatePerfReport`), table
  published in `perf/MOBILE.md` §"Real-device figures (G-003)".
- Figures (real Android phone, Chrome Mobile 153, 8 cores, deployed commit `216ea2e`):
  240 s stem analysed in **40.0 s (6.01× realtime)**, zoom frame median **3.4 ms** / p95 **7 ms**.
  Play-start latency row shows `0 ms*` — carries the bench-harness caveat (never clicks play;
  DEVIATIONS §6 → R-023).
- Collection channel: on-page bench panel at
  `https://qualitycoding.github.io/audio-to-midi/?test=1&bench=1` (deployed preview ahead of
  merge, at the person's explicit request, per GATE-G-002.md).
- No real iOS/Safari figure was submitted ("No real iOS/Safari figure collected yet",
  perf/MOBILE.md) — residual risk R-004 stands.

## Handler actions recorded
- JSON validated and committed; perf/MOBILE.md updated; S-016 proceeded to docs+merge; G-002
  followed on 2026-09-27 with this bundle cross-referenced.

## Open item carried forward
R-023 (play-start metric not a real measurement) — human decision pending: accept, or unfreeze/
extend `tests/e2e/perf.spec.ts` via the Phase-2 machinery.
