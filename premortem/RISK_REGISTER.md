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
