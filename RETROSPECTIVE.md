# Retrospective — addendum run (protocol §3.7.1 S-RETRO, retroactive + live)

**Run:** `addendum-20261101T033000Z-audio-to-midi` · **Date:** 2026-11-01 · **Scope:** the completed
2026-09 implementation (reviewed retroactively — it predates S-RETRO) plus this addendum run.
One pass over the records; nothing re-run except the checkable verifications logged in
EXECUTION_LOG.md.

## Inputs digested
`OPERATIONS-LOG.md` (rollback drill), `DEVIATIONS.md` §1–§9, `GATE-G-002.md`, `perf/MOBILE.md`,
CI run 36274302596 evidence quoted therein, the original `.checkpoints/state.json`, and this run's
A-001..A-008 findings.

## Q1 — What went wrong, and is every correction recorded as a lesson?
| Correction (chronological) | Where | Lesson |
|---|---|---|
| Web Worker architecture unverifiable → main-thread substitution | DEVIATIONS §1 | L-20261101T041500Z |
| Browser tests not runnable in sandbox (CI-only) | DEVIATIONS §2 | R-003 (pre-existing; environment class, no new lesson needed — recurrence would strengthen L-20261101T041500Z's class) |
| GitHub-specific S-001 actions deferred (no credential) | DEVIATIONS §3 | process, not a mistake — planned behaviour |
| Headless Firefox Web Audio clock | DEVIATIONS §4 | L-20261101T041700Z |
| `AudioContext.resume()` race (genuine bug) fixed | DEVIATIONS §4 | folded into L-20261101T041700Z evidence |
| basic-pitch ESM import fix; bundler-only error class | DEVIATIONS §5 | L-20261101T041600Z |
| Perf harness never exercises play → 0 ms metric | DEVIATIONS §6 | L-20261101T041800Z |
| prod-smoke could not fail the job | DEVIATIONS §7 (addendum) | fixed immediately; class covered by L-20261101T041800Z (verification-gap family) |
| jsdom probe abandoned; substitution never logged | DEVIATIONS §8 (addendum) | L-20261101T041900Z |
| CI lacked a production build step | DEVIATIONS §9 (addendum) | L-20261101T041600Z (prevention implemented) |

## Q1a — Execution log & deviation completeness
`EXECUTION_LOG.md` now exists (retro digest + live lines). The 2026-09 session kept no per-attempt
log — itself noted as a gap the protocol's S-000/EXECUTION_LOG machinery (v3.3) now prevents.
Deviation completeness (3.7.1-Q1a) verified by diffing `package.json` and both workflow files
against `plan/ENVIRONMENT.md`/D-002: every difference now has an entry (§7, §8, §9).

## Q2 — What was overlooked?
1. **The protocol itself moved.** The plan was built on protocol v3.1; v3.2–v3.6 added lessons,
   knowledge, checkpointing, reviews, honest-verification and ephemeral protections. This addendum
   retro-applies them (plan/ADDENDUM.md). Overlooked no longer.
2. **Gate record discipline** — GATE-G-003.md never reached main (R-028) → L-20261101T042000Z.
3. **Harness-vs-metric discipline** — the 0 ms play-latency figure (R-023) → L-20261101T041800Z.

## Q3 — R0 lessons not applied / recurred?
No store existed at planning time (store postdates the plan), so nothing was loaded and nothing
recurred. Recorded in research/PRIOR_KNOWLEDGE.md so future runs can tell "no lessons" from
"lessons ignored".

## Q4 — New facts about the Subject now captured as knowledge?
25 knowledge items generated from `research/claims.json` (A-010), tagged for the store taxonomy.
New facts discovered *during the addendum* (pin existence set, headless-Firefox limitation
details, CI action versions) are captured in the spike files and lessons; store-versioned facts
that changed (upload-pages-artifact v5 exists; Pages headers still unsupported) are reflected in
R-026/R-027 context rather than as standalone items, since they derive from existing claims.

## Findings → L-/K- linkage
Every finding in `reviews/CODE_REVIEW.md`, `reviews/ADVERSARIAL_REVIEW.md`, and
`premortem/ASSUMPTION_AUDIT.md` links to an L-file (9), an R-entry (R-023..R-031), or a K-item
(25). Nothing unlinked.
