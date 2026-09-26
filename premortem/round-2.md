# Pre-mortem round 2
## Incident report — 6 months after release
"Transcriptions of real distorted guitar are noisy; users assumed the app was broken. The weekly smoke job failed silently for a month. An implementer, blocked by a flaky perf threshold, reran CI until it passed."
| Risk | Lens | Severity | Disposition |
|---|---|---|---|
| R-005 synthetic-fixture accuracy overstates real-audio accuracy (C-025) | invalid research assumption | Medium | Per-stem mono/poly override; README states accuracy basis; not gated (A-016) |
| R-019 scheduled smoke failure unnoticed | operational | Medium | ci.yml opens a GitHub issue on failure (notifications to owner) |
| R-020 rerun-until-green on perf | integrity | Medium | Rule 9 in HANDOFF; DR-05 forbids threshold changes; perf JSON of every run uploaded as artifact (disclosure) |
| R-004 emulation ≠ real phones (C-021) | technical | Medium | G-003 real-device capture |
| R-009 filename XSS | security | Low | textContent rule D-024, T-025 |
| R-008 malicious media exploiting browser decoders | security | Low | Outside app control; browser sandbox; no persistence |
| R-021 implementer diverges from D-025 test-hook shape | misinterpretation | Low | HookState typed in frozen helpers.ts |
Round result: 0 Critical, 0 High → converged (Phase 4.5).
