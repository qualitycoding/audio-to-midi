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
| 2026-11-01T04:25Z | A-009 | 1 | pass | — | RETROSPECTIVE.md; 9 lessons; GATE-G-003.md reconstructed; D-036 CI build step + DEVIATIONS §9
| 2026-11-01T04:31Z | A-010 | 1 | pass | — | 25 knowledge items from claims.json; PRIOR_KNOWLEDGE.md; halt at G-004 (GATE-G-004.md, awaiting human)
| 2026-11-01T04:41Z | A-011 | 1 | pass | — | schema check exit 0 (9 L + 25 K); unit 87/88 + accuracy 3/3 re-run (xmllint env-blocked, CI named); freeze OK; HANDOFF/PLAN updated; bundle fallback executed |
| 2026-11-01T04:55Z | G-004 response | 1 | pass | — | human answered `push-to-proposed` with one-time PAT; PAT used for the pushes only, stored nowhere (post-push secret scan clean) |
| 2026-11-01T04:56Z | G-004 push: branch | 1 | pass | — | `addendum-20261101T033000Z-protocol-v3.6` pushed to qualitycoding/audio-to-midi @0aef1f9; ls-remote verified; `main` (deployed v0.1.0) untouched |
| 2026-11-01T04:58Z | G-004 store probe | 1 | pass | — | store @d07959e fetched (tarball matched, zero drift); README/scripts: lessons→companion repo `qualitycoding/Lessons`, knowledge→`qualitycoding/knowledge`; existing 2026-10-09 curated set from this project found → dedupe before push |
| 2026-11-01T05:00Z | G-004 push: Lessons | 1 | pass | — | 9 lessons filed (4 as recurrences with recurrence_of; occurrences 2/2/2/3); tech:web-workers + tech:firefox added to store taxonomy same commit; schema+index OK; pushed @a01b608; ls-remote verified |
| 2026-11-01T05:03Z | G-004 push: knowledge | 2 | pass | — | 18/25 generated K-items dropped as already-curated duplicates; 7 new filed (3 new subjects; tfjs/nodejs tag remap to store vocabulary); schema+index OK; attempt 1 transport timeout, attempt 2 @89da6c7; ls-remote verified; DEVIATIONS §10 |
| 2026-11-01T05:25Z | R-023 human decision | 1 | pass | — | human approved option (b): unfreeze-and-extend tests/e2e/perf.spec.ts |
| 2026-11-01T05:28Z | D-037 amendment | 1 | pass | — | TEST_CHALLENGE.md (DR-10); spec amended (click play → poll startLatencyMs → stop → bench; desktop asserts > 0); tsc+build clean; unit 87/88 (T-006 XSD xmllint env-block, pre-existing); accuracy 3/3; manifest re-frozen, 26/26 verify; R-023 closed; DEVIATIONS §11 |
| S-ADD-000 | 1 | pass | `5eae2559d874` || S-ADD-001 | 1 | pass | `96cc75ec3990` || S-ADD-060 | 1 | pass | `6e01fada0203` || S-ADD-070 | 1 | pass | `6e01fada0203` || S-ADD-080 | 1 | pass | `6e01fada0203` || S-ADD-090 | 1 | pass | verifier run below |
| S-ADD-100 | 1 | pass | remote `6e01fada0203` verified |
