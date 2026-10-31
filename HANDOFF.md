# HANDOFF — audio-to-midi v0.1

**Purpose.** Build and ship (behind a human gate) a client-side GitHub Pages app that loads audio stems, shows zoomable waveforms with note/chord labels and a BPM grid, plays selected stems, and exports MIDI, ASCII tab and MusicXML. **Active profile:** `software` (`software.deploys = true`).

**Reading order.** HANDOFF.md → plan/PROFILE.md → plan/ASSUMPTIONS.md → plan/DECISIONS.md → tests/INDEX.md → plan/PLAN.md → plan/GATES.md → plan/OPERATIONS.md → plan/ENVIRONMENT.md. Background: research/claims.json, premortem/RISK_REGISTER.md.

**Environment setup.** See plan/ENVIRONMENT.md (literal commands). Node 22.x, `npm ci`, `libxml2-utils`, Playwright browsers (CI).

**Run the frozen suite.** `npm test` (unit), `npm run test:accuracy`, `npm run fixtures && npm run test:e2e`, `npx playwright test --project=desktop-perf`, `npm run test:perf-mobile`, `npm run audit`.

**Verify the freeze.** `npm run verify:freeze` (= `sha256sum -c tests/FROZEN_MANIFEST.sha256`). CI runs it first on every job.

**Steps at a glance.** S-001 bootstrap CI/Pages/environment → S-002 red baseline → S-003..S-007 core + analysis modules → S-008..S-014 UI, playback, grid, exports, bench → S-015 full matrix green → **G-003** → S-016 docs + merge → **G-002** → S-017 deploy + rollback drill.

**Human gates.** G-003 (real-device mobile figures) and G-002 (Pages publish; also confirms the planning PAT was revoked). At a gate: halt, write `GATE-<id>.md` with the evidence bundle in plan/GATES.md, wait for one of the allowed responses.

**Halt / deviation protocol.** Follow plan/DECISIONS.md decision rules. Log every deviation in `DEVIATIONS.md`. Write `BLOCKED.md` and halt when a rule says so or when anything touches frozen tests, security, data integrity, the D-025 contract, or integrity. A believed-invalid frozen test → `TEST_CHALLENGE.md` and halt. Never modify, skip, weaken or mark expected-fail any frozen file.

**Integrity rule (Rule 9, verbatim).** No step may fabricate, cherry-pick without disclosure, or manually alter data, test results, benchmarks, or figures.

**Deployment.** Only after G-002 `proceed`; runbook, monitoring and rollback in plan/OPERATIONS.md.

**Credentials.** Use your own GitHub credentials (scopes: contents, workflows, pages, administration for environments). No token is stored in this repository.

---

# Addendum (2026-11-01) — protocol v3.2–v3.6 retroactive application

**Status: ADDENDUM APPLIED.** The base plan above was written against planning-protocol **v3.1**;
`plan/ADDENDUM.md` retro-applies the machinery added through **v3.6** (lessons, knowledge items,
checkpointing, §4.7 assumption audit, §3.8 reviews, Rule 14 honest verification, ephemeral
protections). New artifacts: `EXECUTION_LOG.md`, `RETROSPECTIVE.md`, `lessons/` (9), `knowledge/`
(25), `reviews/` (3), `premortem/ASSUMPTION_AUDIT.md`, `research/PRIOR_KNOWLEDGE.md`,
reconstructed `GATE-G-003.md`, `GATE-G-004.md` (lessons/knowledge push — **executed 2026-11-01** on
`push-to-proposed`: branch pushed; 9 lessons → `qualitycoding/Lessons` @a01b608, 7 deduped
knowledge items → `qualitycoding/knowledge` @89da6c7; see GATE-G-004.md "Executed" + DEVIATIONS §10).
Workflow amendments D-034/D-036 are logged in `DEVIATIONS.md` §7/§9.

**Rule 6 (Everything Is Committed + push cadence, verbatim intent).** After every successful chunk,
commit and push immediately, verify with `ls-remote`, retry transient failures with backoff, and
report mismatches. In environments without push access (as this addendum's), commit per chunk and
produce `git bundle` as the fallback (§3.7.2(3)/§5.3).

**Rule 11 (Lessons).** Every correction to execution is recorded as one classified file in
`lessons/L-*.md` (Appendix A template) before work continues.

**Rule 12 (Knowledge).** Every fact discovered about the Subject becomes `knowledge/K-*.md`
(Appendix B template), `derived_from` its claim ID.

**Rule 13 (Knowledge store).** Lessons and knowledge persist in `qualitycoding/knowledge`;
research starts by loading relevant entries (R0) — see `research/PRIOR_KNOWLEDGE.md` for this
project's store history (the store postdates the base plan).

**Execution log.** `EXECUTION_LOG.md` — one line per step attempt (retro digest + live addendum).
While halted at a gate, independent steps may continue (3.3).
