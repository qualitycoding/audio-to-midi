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
