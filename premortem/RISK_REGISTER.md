# Risk register
| ID | Description | Lens | Severity (residual) | Likelihood | Root cause | Traces to | Mitigation |
|---|---|---|---|---|---|---|---|
| R-001 | basic-pitch cannot detect below A0 (7-string F#0–G#0) | technical | Low (was High) | certain w/o fix | model range | C-004, A-008 | D-021 MPM segmentation, T-012, T-020 |
| R-002 | tfjs-wasm 3.21 Fill kernel crash | dependency | Medium | certain w/o fix | backend bug | C-009 | D-023 patch; T-013 runs on wasm; DR-03 |
| R-003 | E2E tests not executed during planning | technical | Medium (was High) | medium | sandbox cannot fetch browsers | C-020 | S-002 red baseline; DR-10 |
| R-004 | Emulated mobile ≠ real devices | technical | Medium | high | emulation fidelity | C-021 | G-003 |
| R-005 | Accuracy on real recordings lower than on fixtures | research assumption | Medium | high | synthetic timbre | C-025 | mode override; README disclosure |
| R-006 | Desktop perf target missed on CI runner | performance | Medium | low | no GPU; runner variance | C-009, C-024 | 2× margin estimate; DR-05 |
| R-007 | tfjs 3.x ageing / supply chain | supply chain | Medium | medium | basic-pitch peer range | C-001, C-013 | pins, weekly audit, DR-08 |
| R-008 | Malicious media vs browser decoder | security | Low | low | third-party code | A-014 | browser sandbox |
| R-009 | Filename script injection | security | Low | medium | untrusted strings | D-024 | textContent; T-025 |
| R-010 | Out-of-memory with many/long stems on phones | scale | Low (was High) | high w/o fix | 32-bit float buffers | A-017 | D-030, T-017 |
| R-013 | iOS autoplay policy blocks playback | operational | Medium | medium | WebKit policy | A-018 | S-011; T-022 on mobile-webkit |
| R-014 | Safari cannot decode some formats | technical | Medium | medium | codec support | C-014 | DR-07 |
| R-016 | Planning PAT visible in chat transcript | security | Low (was Critical) | — | credential pasted in chat | A-001 | human revocation confirmed at G-002 (Q0); no token in repo |
| R-018 | workflow_dispatch unavailable pre-merge | operational | Low (was High) | certain | GitHub behaviour | D-005 | draft-PR trigger |
| R-019 | Scheduled smoke failure unnoticed | operational | Medium | low | no telemetry | OPERATIONS.md | auto-issue |
| R-020 | Rerun-until-green on perf | integrity | Medium | low | flaky threshold temptation | Rule 9 | artifacts per run; DR-05 |
| R-021 | Test-hook shape drift | misinterpretation | Low | low | contract ambiguity | D-025 | typed HookState |
| R-022 | Pre-mortem and cold-read not performed by fresh-context agents | process | Medium | — | no subagent capability | D-031 | mechanical checks scripted; human review at G-002 |
| R-023 | SC-13 "play start < 100 ms" unverified: frozen perf harness never clicks play, so `playStartLatencyMs` is always 0 | verification-gap | **High — human decision** | certain (as shipped) | frozen test coverage gap | DEVIATIONS §6, A-015 | options: (a) accept + document, (b) TEST_CHALLENGE → amend `tests/e2e/perf.spec.ts` (click play before bench), red-verify, re-freeze. Surfaced by addendum A-003; frozen file untouched |
| R-024 | Scheduled prod-smoke could not fail the job (`|| gh issue create`) | verification-gap | Medium → **closed 2026-11-01** | certain (as shipped) | alert swallowed the red | D-034 | fixed by addendum A-003 (issue + `exit 1`) |
| R-025 | Abandoned probe left in tree: `scripts/smoke-dom.mjs` + `jsdom ^27.4.0` (only caret pin; unused by any test or script) | supply chain | Medium | — | substitution never logged (logged retroactively as DEVIATIONS §8) | DEVIATIONS §8 | removal proposed in reviews/CODE_REVIEW.md; accepted-with-follow-up for maintainer |
| R-026 | `actions/upload-pages-artifact` pinned v3; v5 current (2026-11-01) | supply chain | Medium | low | major-tag drift | A-002 spike | upgrade on next deploy touchpoint; v3 pairs with deploy-pages@v4 and works today |
| R-027 | Planning PAT revocation not recorded (A-001) | security | Low | — | human-side action, no repo evidence | ASSUMPTION_AUDIT A-001 | no token in repo (secret scan clean); confirm revocation in person |
| R-028 | `GATE-G-003.md` record never committed to main (A-044) | process | Low | — | gate record committed off-branch or lost | ASSUMPTION_AUDIT A-020 | reconstructed `GATE-G-003.md` (marked) by addendum A-009; lesson recorded |
| R-029 | Analysis on main thread: UI may stall during long analyses (worker dropped, DEVIATIONS §1) | technical | Medium | medium (long stems) | unverifiable worker bundle in impl sandbox | DEVIATIONS §1, D-023 premise falsified | proposal in DEVIATIONS §1: module worker + T-020/T-028 re-run before next release; until then disclosed |
| R-030 | Duplicate stem names export the first same-named stem's notes for every match (export.ts find-by-name) | technical | Medium | low | no dedupe in validateSelection + name-keyed lookup | reviews/CODE_REVIEW.md CR-1 (A-006) | proposed fix: carry StemState through frettedStems; add regression test via Phase-2 machinery |
| R-031 | sub-A0 octave-ghost suppression (mergeLow) ships without a committed regression test | verification-gap | Medium | — | diag test zz_diag3 never committed | reviews/CODE_REVIEW.md CR-2 (A-006) | add ghost-note fixture via Phase-2 machinery (new test, red-verify, re-freeze) |
