# Execution log

Started by the addendum run `addendum-20261101T033000Z-audio-to-midi` (protocol v3.6 §3.7.0 `S-000`
machinery, opened retroactively). One line per step attempt: UTC time · step · attempt · outcome ·
commit · note.

## Retro digest — 2026-09 implementation (reconstructed from OPERATIONS-LOG.md, DEVIATIONS.md,
GATE-G-002.md; the implementation session predates this log and kept no per-attempt record — itself
a lesson, see lessons/)

| Time (UTC) | Step | Attempt | Outcome | Commit | Note |
|---|---|---|---|---|---|
| 2026-09-26T11:34Z | planning push | 1 | pass | — | plan branch `gen-20260926T113449Z-audio-to-midi` pushed; planning PAT deleted after |
| 2026-09-26..27 | S-001..S-017 | — | mixed | — | per DEVIATIONS.md §1–§6: worker→main-thread substitution; browser tests CI-only; S-001 GitHub actions done later; firefox headless Web Audio limitation; ESM import fix; perf-harness play-latency gap |
| 2026-09-27 | G-003 | 1 | pass | — | real-device Android figures collected; response evidenced in perf/results + perf/MOBILE.md; GATE-G-003.md not present on received main (A-044) |
| 2026-09-27 | rollback drill (T-033) | 1 | pass | e5e93df | 4 deploys, all smoke OK; OPERATIONS-LOG.md |
| 2026-09-27 | G-002 | 1 | pass | e5e93df | publish approved; known firefox-headless gap accepted |

## Live — addendum run 2026-11-01 (UTC)

| Time (UTC) | Step | Attempt | Outcome | Commit | Note |
|---|---|---|---|---|---|
| 2026-11-01T03:30Z | import baseline | 1 | pass | f2dba0a | repo imported as received from qualitycoding/audio-to-midi main |
| 2026-11-01T03:31Z | addendum plan | 1 | pass | — | plan/ADDENDUM.md + A-041..A-044, D-032..D-035, new risks |
| 2026-11-01T03:35Z | A-001 | 1 | in progress | — | env class=ephemeral; push unavailable→bundle fallback; state.json upgraded to v3.6 schema |
