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
| 2026-11-01T03:35Z | A-001 | 1 | pass | a4c4beb | env class=ephemeral; push unavailable→bundle fallback; state.json upgraded to v3.6 schema |
| 2026-11-01T03:52Z | A-004 | 1 | pass | — | deviation completeness: jsdom/smoke-dom logged as DEVIATIONS §8; R-025 added
| 2026-11-01T04:00Z | A-005 | 1 | pass | — | assumption audit: 20 confirmed, 3 falsified-in-part (tracked), 2 unverifiable; R-023/027/028/029
| 2026-11-01T04:05Z | A-006 | 1 | pass | — | code review: 0 Critical/0 High; CR-1..CR-9 -> R-030/R-031 + follow-ups; reviews/CODE_REVIEW.md
| 2026-11-01T04:12Z | A-007 | 1 | pass | — | adversarial battery 11/11 (research/spikes/adversarial-probe.spec.ts); B-1/B-2/B-7 Low+Info; reviews/ADVERSARIAL_REVIEW.md
| 2026-11-01T04:14Z | A-008 | 1 | pass | — | S-MUTATE opt-out D-032; reviews/MUTATION.md
