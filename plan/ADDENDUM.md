# Addendum plan — protocol v3.2–v3.6 retroactive application

**Status: READY** · run `addendum-20261101T033000Z-audio-to-midi` · profile `software` (`software.deploys = true`) · environment class: `ephemeral` (A-041)

**Base.** `plan/PLAN.md` (17 steps, S-001..S-017) was written against **planning-protocol v3.1**. The
protocol has since been updated through **v3.6** (`qualitycoding/skills`, recorded in
`protocols/planning-protocol-review.md`). The implementation is complete (v0.1.0 deployed, G-002
passed); the original plan's steps cannot be re-run. This addendum therefore applies the *added*
protocol machinery **retroactively** where it produces value for the delivered artifact, and records
where a step is planning-time-only for future runs.

**Amendment authority.** Protocol §2E.4 (added in v3.3): amendments re-run only the challenged item
and its dependants. This addendum is itself the amendment record; every change it makes is logged in
`DEVIATIONS.md` and traced here.

## What the updated protocol added, and where this addendum applies it

| Protocol change | Addendum step |
|---|---|
| v3.2 Rule 11 lessons; Rule 12 knowledge items; Rule 13 knowledge store; R0 prior-knowledge loading (`research/PRIOR_KNOWLEDGE.md`) | A-009, A-010 |
| v3.2 closing steps `S-RETRO` (3.7.1), `S-KNOW` + gate `G-003` (3.7.2) | A-009, A-010 (gate numbered **G-004** here — see D-033) |
| v3.3 Rule 5 / §1.2 checkpointing: full schema, periodic triggers, zero-context resumption (1.2.1–1.2.3) | A-001 |
| Speed rounds 1–3: `S-000` opening step + `EXECUTION_LOG.md`; step-template fields (`Lessons applied`, `Exclusive resources`); gate-idle rule (3.3); scoped amendments (2E.4); extended 0.1 diagnostics (permissions, per-host reachability, **environment-class probe**); 0.3.1 subject tags; 0.3.7 store-access check; mechanical Appendix C schema check | A-001, A-010, A-011 (template fields used by all A-steps) |
| v3.4 §4.7 Assumption & Premise Audit → `premortem/ASSUMPTION_AUDIT.md` | A-005 |
| v3.4 §3.8 `S-REVIEW` → `reviews/CODE_REVIEW.md`; `S-ADVERSARIAL` → `reviews/ADVERSARIAL_REVIEW.md`; `S-MUTATE` → `reviews/MUTATION.md` or opt-out `D-###` | A-006, A-007, A-008 |
| v3.5 Rule 14 honest verification (no swallowed failures, artifact post-conditions, budgets gate, baselines, per-environment targets, substitutions-as-deviations); §1.3.6 command & pin verification; §3.7.1-Q1a deviation completeness | A-002, A-003, A-004 |
| v3.6 §0.1 environment-class probe; §1.5 ephemeral-environment protections `[ephemeral]`; Global Rule 6 push cadence with `ls-remote` verification; §3.5 HANDOFF restatement | A-001, A-011 |

**N/A for this addendum (recorded, not skipped silently):** §1.5 items 3–4 specifics (no CMake/toolchain
staging in this stack); `S-MUTATE` execution (opt-out A-008/D-032); `G-001` (no math/computational
profile); subagent tier execution (single-agent, same-context reviews — same substitution class as
D-031, recorded as D-035).

## New assumptions
| ID | Assumption | Source |
|---|---|---|
| A-041 | This execution environment is **ephemeral** (fresh shell per call; `/tmp` wiped at sandbox release; only `/mnt/agents` durable) → §1.5 applies to this addendum run | Observed 0.1 probe, this run |
| A-042 | GitHub push is unavailable from this sandbox (no credential; direct git network blocked) → Rule 6 cadence executes as commit-per-chunk + final `git bundle` fallback (protocol §3.7.2(3)/§5.3 fallback) | Observed, this run |
| A-043 | Knowledge store default `qualitycoding/knowledge` (protocol-corrected default, per planning-protocol-review corrections 2026-10-27) | Protocol default |
| A-044 | `GATE-G-003.md` was written on the implementation branch but is absent from received `main`; the G-003 response itself is evidenced by `perf/results/real-android-2026-09-27T111013.json` + `perf/MOBILE.md` | Reconstructed |

## New decisions
| ID | Decision |
|---|---|
| D-032 | `S-MUTATE` opt-out: no mutation run. Justification (protocol §3.8): the suite's main correctness gate is the frozen accuracy/e2e matrix (T-013, T-020..T-030), which mutation tools cannot exercise in this sandbox (no browser binaries); StrykerJS against the unit subset only would measure the least load-bearing layer. Revisit if the unit layer becomes the gate. Recorded in `reviews/MUTATION.md`. |
| D-033 | Gate-numbering collision: this plan froze `G-003` = real-device figures (A-020) before protocol v3.2 redefined `G-003` = lessons/knowledge push. The addendum's knowledge-push gate is numbered **G-004**; the protocol semantic is preserved. Lesson recorded (L-file in A-009). |
| D-034 | Amendment (2E.4): `prod-smoke` job in `.github/workflows/ci.yml` (and template `plan/workflows/ci.yml`) currently reports green when the smoke fails (`smoke.sh || gh issue create`); Rule 14 forbids a check that cannot fail. Amended to create the issue **and** fail the job. Rationale: R-019's intent (failure noticed) is kept; the verification now also cannot silently pass. Logged in DEVIATIONS.md §7. |
| D-035 | Tier substitution (Rule 5): all A-step reviews/audits executed by the single planning-grade agent in one context; mechanical checks scripted (Appendix C schema check, idiom scan) per the D-031 precedent. |

## New risks (registered in `premortem/RISK_REGISTER.md` by the steps that create them)
- R-023 (High→human decision): SC-13 "play start < 100 ms" is unverified — the frozen perf harness never clicks play, so `playStartLatencyMs` is always 0 (DEVIATIONS.md §6). Fix requires a frozen-test amendment; the addendum surfaces it, it does not silently change the frozen file.
- R-024 (Medium): scheduled prod-smoke could not fail the job before D-034 (closed by A-003).
- R-025 (Medium): `scripts/smoke-dom.mjs` + `jsdom` devDependency are an abandoned probe left in the repo (dead code, un-audited dependency); removal proposed in `reviews/CODE_REVIEW.md` (A-006) as an accepted-with-follow-up finding.
- R-026 (Medium): `actions/upload-pages-artifact` pinned at v3 (v5 current at audit date); moving major tags, deprecation risk noted.

## Steps at a glance
| Step | Title | Protocol source | Gate |
|---|---|---|---|
| A-001 | Environment probe, checkpoint-schema upgrade, execution log | 0.1, 1.2, S-000 (3.7.0), 1.5 | — |
| A-002 | Command & pin verification | 1.3.6 | — |
| A-003 | Honest-verification audit + prod-smoke amendment | Rule 14, 2E.4 | — |
| A-004 | Deviation completeness | Rule 14 (last bullet), 3.7.1-Q1a | — |
| A-005 | Assumption & premise audit | 4.7 | — |
| A-006 | Code review | 3.8 S-REVIEW | — |
| A-007 | Adversarial review | 3.8 S-ADVERSARIAL | — |
| A-008 | Mutation-testing decision | 3.8 S-MUTATE | — |
| A-009 | Retrospective + lessons | 3.7.1 S-RETRO, Rule 11 | — |
| A-010 | Knowledge items + prior-knowledge record + G-004 gate | R0/R2, Rule 12/13, 3.7.2 S-KNOW | G-004 |
| A-011 | Consistency check, HANDOFF update, final checkpoint, bundle fallback | 3.5, 5.1, Rule 6 | — |

## A-001 Environment probe, checkpoint-schema upgrade, execution log
- Tier: Haiku/Sonnet
- Profile: software
- Depends on: none
- Inputs: `.checkpoints/state.json`, sandbox observation
- Actions:
  1. Run the 0.1 environment-class probe: verify durability semantics (fresh shell per tool call; `/tmp` wiped at sandbox release; `/mnt/agents` persistent) → classify `ephemeral`; record evidence.
  2. Confirm push access absent (A-042): `git ls-remote` to the origin fails / no credential → Rule 6 executes as commit-per-chunk + bundle fallback (A-011).
  3. Upgrade `.checkpoints/state.json` to the v3.6 schema (1.2.2): add `sequence`, `subphase`, `execution_context`, `active_variables`, `knowledge_store`, `lessons_loaded/recorded`, `knowledge_added`; set `run_id = addendum-20261101T033000Z-audio-to-midi`; mark completed phases including addendum steps as they finish (atomic write-and-rename).
  4. Start `EXECUTION_LOG.md` (retro covers the 2026-09 implementation from `OPERATIONS-LOG.md` + `DEVIATIONS.md` digest; live section covers this addendum run): one line per step attempt — UTC time, step, attempt, outcome, commit, note.
- Outputs: `.checkpoints/state.json`, `EXECUTION_LOG.md`
- Evidence produced: none
- Done when: state.json parses and contains every 1.2.2 field; EXECUTION_LOG.md non-empty with the retro digest + live header
- Checkpoint: `state.tmp.json` → rename → `state.json`; commit `checkpoint: A-001`
- On failure: halt — no delivery work before environment verification (3.7.0)
- Gate: none
- Relevant decisions/claims: A-041, A-042, D-035
- Lessons applied: none
- Exclusive resources: `.checkpoints/state.json`

## A-002 Command & pin verification
- Tier: Haiku
- Profile: software
- Depends on: A-001
- Inputs: `plan/ENVIRONMENT.md`, `plan/DECISIONS.md` D-002, `package.json`, `.github/workflows/*.yml`
- Actions:
  1. For every pinned npm package in D-002 (+ `jsdom`): look up the version in `https://registry.npmjs.org/<name>`; record exists/not-found with access date 2026-11-01.
  2. Verify Node `22.22.2` against `https://nodejs.org/dist/index.json`.
  3. Verify GitHub Actions tags used by workflows (`actions/checkout@v4`, `actions/setup-node@v4`, `actions/upload-artifact@v4`, `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v4`) against their release pages; record the newest release on the pinned major line.
  4. Verify `xmllint` availability note: not installable in this sandbox (no root); the pinned-version doc/CI equivalent (ci.yml installs `libxml2-utils`) is named — recorded as environment-blocked per §1.5(6), **not** as a pass.
  5. Write results to `research/spikes/pin-verification-20261101.md`; append a verification row to `plan/ENVIRONMENT.md`.
- Outputs: `research/spikes/pin-verification-20261101.md`, `plan/ENVIRONMENT.md` (addendum row)
- Evidence produced: none (planning-time check)
- Done when: every pin has a recorded lookup result; any non-existent pin would be flagged Critical (none expected)
- Checkpoint: commit `checkpoint: A-002`
- On failure: missing pin → finding in `reviews/CODE_REVIEW.md` + risk entry; pins are not changed silently (Rule 14 substitution rule)
- Gate: none
- Relevant decisions/claims: D-002, C-001, C-013, C-020, C-022, C-023
- Lessons applied: none
- Exclusive resources: none

## A-003 Honest-verification audit + prod-smoke amendment
- Tier: Sonnet
- Profile: software
- Depends on: A-001
- Inputs: `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`, `plan/workflows/*.yml`, `scripts/`, `tests/deploy/smoke.sh`, `perf/MOBILE.md`, DEVIATIONS.md §6
- Actions:
  1. Scan every plan-specified CI step and repo script for failure-swallowing idioms (`|| true`, `continue-on-error`, `set +e`, empty catch) on load-bearing commands (Rule 14). Finding: `ci.yml` `prod-smoke` — `smoke.sh … || gh issue create …` lets the job stay green when the smoke fails (a check that cannot fail).
  2. Amend per D-034 (2E.4 scoped amendment): `run: tests/deploy/smoke.sh … || gh issue create …` → `run: tests/deploy/smoke.sh … || { gh issue create …; exit 1; }` in `.github/workflows/ci.yml` **and** its template `plan/workflows/ci.yml`. The R-019 alert (issue creation) is preserved; the job now also fails. No frozen file touched.
  3. Artifact post-conditions: confirm `deploy.yml` builds before `upload-pages-artifact` (yes); e2e/perf jobs gate on the test step and upload artifacts `if: always()` (yes); note that nothing verifies the uploaded artifact is non-empty — record as Low observation, no change (upload-artifact v4 fails on missing paths by default — verified behaviour of the pinned action).
  4. Budgets gate: confirm T-028 (desktop < 60 s, zoom < 16 ms) fails the perf job when missed (yes — playwright exit status, no `continue-on-error`); T-029 mobile is recorded-not-gated per A-013, permitted by Rule 14 (informational-only for a metric with no acceptance criterion).
  5. Baselines/per-environment targets: perf targets name their environment (ubuntu-latest Chromium, D-026/A-015); no "within X% of baseline" check exists, so Rule 14's baseline-bootstrap clause is satisfied vacuously — record that.
  6. Record the SC-13 play-start finding (frozen harness never clicks play → `playStartLatencyMs` always 0) as **R-023 High, human decision**: options (a) accept and document, (b) TEST_CHALLENGE + unfreeze/extend `tests/e2e/perf.spec.ts` to click play before bench, re-freeze. The addendum does not edit the frozen file.
  7. Log §7 in `DEVIATIONS.md` (the workflow amendment is a substitution under Rule 14).
- Outputs: `.github/workflows/ci.yml`, `plan/workflows/ci.yml`, `DEVIATIONS.md`, `premortem/RISK_REGISTER.md`
- Evidence produced: R-023, R-024 (closed)
- Done when: idiom scan shows zero remaining swallowed failures on load-bearing commands; both workflow copies amended identically; DEVIATIONS.md §7 committed
- Checkpoint: commit `checkpoint: A-003`
- On failure: if the amendment cannot be applied to both copies, halt (workflows would drift from template)
- Gate: none
- Relevant decisions/claims: D-034, A-015, R-019, R-020
- Lessons applied: none
- Exclusive resources: none

## A-004 Deviation completeness (3.7.1-Q1a)
- Tier: Haiku/Sonnet
- Profile: software
- Depends on: A-002, A-003
- Inputs: `package.json`, `package-lock.json`, `.github/workflows/*.yml`, `plan/ENVIRONMENT.md`, `plan/DECISIONS.md`, DEVIATIONS.md
- Actions:
  1. Diff the dependency set against D-002/ENVIRONMENT.md: finding — `jsdom ^27.4.0` (devDependency) + `scripts/smoke-dom.mjs` were added during implementation (the abandoned jsdom smoke probe of DEVIATIONS.md §2) but never logged as a substitution. Basic-pitch ESM import (§5) IS logged; verify no other drift: package set otherwise matches D-002.
  2. Workflow drift: `.github/workflows/ci.yml` matches template after A-003 (diff the two copies); `deploy.yml` unchanged from template.
  3. Append DEVIATIONS.md §8 logging the jsdom/smoke-dom addition with reason and consequence (dead code + unaudited devDependency; removal proposed via reviews/CODE_REVIEW.md, accepted as follow-up R-025).
- Outputs: `DEVIATIONS.md`
- Evidence produced: R-025
- Done when: every substitution discovered by the diff has a DEVIATIONS.md entry
- Checkpoint: commit `checkpoint: A-004`
- On failure: unexplained drift → Critical finding, halt for human
- Gate: none
- Relevant decisions/claims: D-002, Rule 14 (substitutions are deviations)
- Lessons applied: none
- Exclusive resources: none

## A-005 Assumption & premise audit (4.7 retroactive)
- Tier: Opus (fresh-context stance within this run; D-035)
- Profile: software
- Depends on: A-002
- Inputs: `plan/ASSUMPTIONS.md` (A-001..A-022), `plan/DECISIONS.md` (premises behind D-001..D-031), `research/claims.json` (single-source C-015, C-021; inferred C-025), delivered artifact
- Actions:
  1. For each A-###: restate the premise, name falsifying evidence, check it where checkable (re-read records, re-run probes, re-fetch sources). Verdicts: `confirmed` / `falsified` / `unverifiable`.
  2. Premises behind decisions: D-002 pins (A-002 verified), D-023 "Web Worker" premise (falsified in implementation — DEVIATIONS §1, worker dropped; consequence disclosed), D-026 bench premise incl. play-latency dimension (falsified in practice for that dimension — DEVIATIONS §6, → R-023).
  3. Claims: C-015 (Pages cannot set custom headers → no wasm threads; still holds — deployed site runs non-threaded wasm), C-021 (Playwright WebKit ≠ Safari; still holds), C-025 (synthetic-fixture accuracy may overstate real-recording accuracy; remains `inferred` → carried as R-005).
  4. Falsified/unverifiable items → lesson (Rule 11) + risk entry; confirmed items cite what was checked.
- Outputs: `premortem/ASSUMPTION_AUDIT.md`, `premortem/RISK_REGISTER.md` additions
- Evidence produced: verdict counts for the PLAN.md header
- Done when: every in-scope item has exactly one verdict; every falsified/unverifiable item links to L-/R- IDs
- Checkpoint: commit `checkpoint: A-005`
- On failure: load-bearing falsified item → escalate per 4.7(7) (none expected beyond the two already-deviationed)
- Gate: none
- Relevant decisions/claims: all A-###, C-015, C-021, C-025
- Lessons applied: none
- Exclusive resources: none

## A-006 Traditional code review (S-REVIEW retroactive)
- Tier: Opus
- Profile: software
- Depends on: A-002, A-003, A-004
- Inputs: `src/**` (1016 LOC), `scripts/**`, `.github/workflows/*`, `package.json`, frozen tests (read-only)
- Actions:
  1. Review the full delivered source for: dead code / duplication / hidden mutation / unclear naming / unjustified complexity; untested code paths (map to frozen T-###); security (injection, unsafe handling, secrets, input validation at boundaries — per D-024); outdated/superseded dependencies (compare pinned versions against current releases, fixed-date wording).
  2. Classify findings per Rule 4. Critical/High must be fixed or risk-accepted with severity before A-011; findings that require touching frozen tests or scope changes are recorded as accepted-with-follow-up (human) instead.
  3. Output `reviews/CODE_REVIEW.md`, every finding linked to a fix (commit) or an `R-###` risk entry.
- Outputs: `reviews/CODE_REVIEW.md`, `premortem/RISK_REGISTER.md` additions
- Evidence produced: findings-by-severity counts for the header
- Done when: report exists; every Critical/High finding is fixed or linked to an R-entry; nothing in the report proposes weakening a frozen test
- Checkpoint: commit `checkpoint: A-006`
- On failure: unresolvable Critical → halt BLOCKED.md
- Gate: none
- Relevant decisions/claims: D-024, D-002, Rule 4
- Lessons applied: none
- Exclusive resources: none

## A-007 Adversarial review (S-ADVERSARIAL retroactive)
- Tier: Opus
- Profile: software
- Depends on: A-006
- Inputs: `src/io/validate.ts`, `src/io/decode.ts`, `src/audio/player.ts`, `src/ui/*`, `src/main.ts`, frozen tests (read-only), built app
- Actions:
  1. Challenge the assumptions the code embodies (A-014 threat model, A-017 input envelope, D-024 CSP, D-030 memory budget) and throw hostile input at every boundary: over-long/over-large/too-many files, empty files, extension spoofing, script-bearing filenames, NaN/±Infinity/2^k sample rates, corrupt audio headers, extreme BPM/grid values, 8+ stems at the memory budget line.
  2. Probe abuse/misuse flows: `?test=1` hook exposure off-mode, export with zero notes, grid changes mid-export, retuning to overlapping/impossible strings.
  3. Exercise resource-exhaustion and error paths per D-030; simulate dependency failure (wasm fetch 404 → DR-03 path).
  4. Execute the hostile-input battery as a throwaway spike (`research/spikes/adversarial-probe.spec.ts`, vitest, **not** frozen) against the real modules; record results. Confirmed breaks → new frozen test requires Phase-2 unfreeze machinery → recorded as findings with a proposed amendment, not silently fixed (frozen-suite discipline).
  5. Output `reviews/ADVERSARIAL_REVIEW.md`: every confirmed break → proposed frozen test / accepted risk (severity per Rule 4).
- Outputs: `research/spikes/adversarial-probe.spec.ts` (+ result log), `reviews/ADVERSARIAL_REVIEW.md`
- Evidence produced: confirmed-break count for the header
- Done when: battery executed and logged; every confirmed break linked to a proposed test or R-entry
- Checkpoint: commit `checkpoint: A-007`
- On failure: Critical/High break with no workaround → halt per Rule 4 (none expected; T-014/T-015/T-017/T-025 exist for this envelope)
- Gate: none
- Relevant decisions/claims: A-014, A-017, D-024, D-030, DR-03
- Lessons applied: none
- Exclusive resources: none

## A-008 Mutation-testing decision (S-MUTATE)
- Tier: Sonnet
- Profile: software
- Depends on: none (independent)
- Inputs: protocol §3.8
- Actions:
  1. Record the pre-decided opt-out as D-032 (rationale above) and write `reviews/MUTATION.md` documenting the considered tool (StrykerJS 8.x), scope that would have been mutated (unit layer), target (not set), and why the opt-out satisfies §3.8 ("plan omits S-MUTATE → DECISIONS.md records why").
- Outputs: `reviews/MUTATION.md`, D-032 (in `plan/ADDENDUM.md`; mirrored to `plan/DECISIONS.md`)
- Evidence produced: none
- Done when: opt-out recorded in both places
- Checkpoint: commit `checkpoint: A-008`
- On failure: n/a
- Gate: none
- Relevant decisions/claims: D-032
- Lessons applied: none
- Exclusive resources: none

## A-009 Retrospective + lessons (S-RETRO retroactive)
- Tier: Opus
- Profile: software
- Depends on: A-003..A-008
- Inputs: `OPERATIONS-LOG.md`, `DEVIATIONS.md`, `GATE-G-002.md`, this run's findings (A-002..A-008), `.checkpoints/state.json` (impl-era record)
- Actions:
  1. Haiku-role digest: collect the execution history into one pass — 2026-09 implementation (7 deviations, rollback drill, gate records) plus this addendum's findings.
  2. Answer 3.7.1 Q1–Q4: corrections → lessons? (each DEVIATIONS §1–§8 entry, the AudioContext.resume fix, the ESM-import fix, the missing GATE-G-003 record); overlooked steps (the protocol v3.2–v3.6 machinery this addendum retro-applies; gate record not committed); R0 lessons (none existed — store postdates the plan); new Subject facts → knowledge items (A-010).
  3. Write `RETROSPECTIVE.md`, one `lessons/L-<timestamp>-<slug>.md` per correction/finding per Appendix A, tagged from the taxonomy (domain:audio, tech:typescript, tech:tensorflow-js, tech:playwright, tech:github-actions, tech:github-pages, kind:…). Every finding links to an L- or K- ID. Include this run's own lessons (git-network flakiness → tarball fallback; /tmp wiped → durable-mount discipline; PAT-less sandbox → bundle fallback).
  4. Reconstruct `GATE-G-003.md` from committed evidence (A-044), marked *reconstructed*, and record the "commit gate records" lesson.
- Outputs: `RETROSPECTIVE.md`, `lessons/L-*.md`, `GATE-G-003.md` (reconstructed)
- Evidence produced: lesson count for the header
- Done when: every finding links to L-/K-; Appendix C schema check passes on `lessons/`
- Checkpoint: commit `checkpoint: A-009`
- On failure: schema check failure → fix and re-run
- Gate: none
- Relevant decisions/claims: D-033, D-035, Rule 11
- Lessons applied: none
- Exclusive resources: none

## A-010 Knowledge items + prior-knowledge record + G-004 gate (S-KNOW retroactive)
- Tier: Haiku/Sonnet
- Profile: software
- Depends on: A-005, A-009
- Inputs: `research/claims.json` (25 claims), A-043
- Actions:
  1. R0 retro-record: write `research/PRIOR_KNOWLEDGE.md` stating the knowledge store (`qualitycoding/knowledge`) did not exist when the plan was researched (store created by protocol v3.2, 2026-10-04; plan dated 2026-09-26) → R0 loaded nothing; list the prevention rules that *would* have applied had the store existed (none available), and how each addendum step applies them now.
  2. Generate knowledge items mechanically from `claims.json` (R2): one `knowledge/K-<id>-<slug>.md` per claim, Appendix B template, `derived_from` = C-###, first source carried, tags incl. `subject:` (e.g. subject:basic-pitch, subject:musicxml, subject:github-pages). Claims C-015/C-021 single-source and C-025 inferred keep their confidence. ~25 items.
  3. Halt at **G-004** (D-033). Write `GATE-G-004.md` listing lessons + knowledge items to push (IDs, titles, tags), proposing `qualitycoding/knowledge` (A-043). Allowed responses: `push-to-proposed`, `push-to: <target>`, `do-not-push`. Push impossible from this sandbox (A-042) → bundle fallback is executed in A-011 and the gate record carries the proposal.
- Outputs: `research/PRIOR_KNOWLEDGE.md`, `knowledge/K-*.md`, `GATE-G-004.md`
- Evidence produced: knowledge-item count for the header
- Done when: schema check passes on `knowledge/`; GATE-G-004.md lists every item
- Checkpoint: commit `checkpoint: A-010`
- On failure: store unreachable → record and continue (0.3.7: risk, not blocker); bundle fallback in A-011
- Gate: **G-004**
- Relevant decisions/claims: D-033, A-043, Rules 12–13
- Lessons applied: none
- Exclusive resources: none

## A-011 Consistency check, HANDOFF update, final checkpoint, bundle fallback
- Tier: Haiku
- Profile: software
- Depends on: A-001..A-010
- Inputs: all addendum artifacts
- Actions:
  1. Phase-5-style mechanical check (Haiku role, scripted): Appendix C schema check over `lessons/**` + `knowledge/**` (exit 0); every addendum artifact exists and is non-empty; no N/A artifact is required; DEVIATIONS.md covers every substitution made by this addendum; idiom scan re-run clean on amended workflows; freeze manifest still verifies (`npm run verify:freeze` — frozen files untouched); unit + accuracy suites still pass (environment-blocked: xmllint XSD subtest + all browser tests — CI equivalents named, §1.5(6) honest recording).
  2. Update `HANDOFF.md` per §3.5: addendum pointer, Rules 6 (push cadence + bundle fallback), 11–13 restated with where lessons/knowledge live, execution-log pointer.
  3. Final `.checkpoints/state.json` (all addendum steps complete, artifacts hashed per 1.2.3).
  4. Rule 6 cadence closure: pushes unavailable (A-042) → `git bundle create audio-to-midi-addendum-<run_id>.bundle main` as the protocol fallback; report its path.
- Outputs: `HANDOFF.md`, `.checkpoints/state.json`, `audio-to-midi-addendum-<run_id>.bundle`
- Evidence produced: final consistency result
- Done when: schema check exit 0; suites re-run with honest environment-blocked list; bundle exists and `git bundle verify` passes
- Checkpoint: commit `checkpoint: A-011`
- On failure: any check failure → fix or record BLOCKED
- Gate: none
- Relevant decisions/claims: A-042, Rule 6
- Lessons applied: this run's environment lessons
- Exclusive resources: none
