# FROZEN — DO NOT MODIFY (see tests/FROZEN_MANIFEST.sha256)
# Test index
| ID | Category | File / command | Requirement |
|---|---|---|---|
| T-001 | unit | tests/unit/notes.test.ts | SC-4, SC-5 |
| T-002 | unit | tests/unit/chord.test.ts | SC-4 |
| T-003 | unit | tests/unit/tunings.test.ts | SC-7 |
| T-004 | unit (+perf budget) | tests/unit/fretting.test.ts | SC-7, SC-8 |
| T-005 | unit | tests/unit/tabAscii.test.ts | SC-6, SC-8 |
| T-006 | unit (schema) | tests/unit/musicxml.test.ts | SC-8 |
| T-007 | unit | tests/unit/midiExport.test.ts | SC-9 |
| T-008 | unit | tests/unit/beatGrid.test.ts | SC-6 |
| T-009 | unit | tests/unit/peaks.test.ts (T-009 block) | SC-2 |
| T-010 | unit | tests/unit/peaks.test.ts (T-010 block) | SC-3 |
| T-011 | unit | tests/unit/pitch.test.ts (T-011) | SC-4 |
| T-012 | unit | tests/unit/pitch.test.ts (T-012) | SC-7 |
| T-013 | integration (accuracy) | tests/accuracy/transcribe.test.ts | SC-10 |
| T-014 | security (input) | tests/unit/validate.test.ts (T-014) | SC-1, SC-11 |
| T-015 | operational (schema) | tests/unit/validate.test.ts (T-015) | SC-13, SC-14 |
| T-016 | security (deps) | `npm run audit` exits 0 | SC-12 |
| T-017 | operational (memory) | tests/unit/validate.test.ts (T-017) | SC-1, SC-14 |
| T-020 | e2e integration | tests/e2e/app.spec.ts T-020 | SC-1, SC-2, SC-4, SC-7 |
| T-021 | e2e | T-021 | SC-3 |
| T-022 | e2e | T-022 | SC-17 |
| T-023 | e2e | T-023 | SC-6 |
| T-024 | e2e | T-024 | SC-8, SC-9 |
| T-025 | e2e security/operational | T-025 | SC-11 |
| T-026 | e2e security | T-026 | SC-12 |
| T-027 | e2e security | T-027 | SC-12 |
| T-028 | performance (desktop) | `npx playwright test --project=desktop-perf` | SC-13 |
| T-029 | performance (mobile, recorded) | `npm run test:perf-mobile` | SC-14 |
| T-030 | e2e mobile functional | T-020..T-027 under projects mobile-chromium, mobile-webkit | SC-14 |
| T-031 | repo | tests/unit/repo.test.ts | SC-15 |
| T-032 | deployment smoke | tests/deploy/smoke.sh <url> | SC-16 |
| T-033 | deployment rollback drill | OPERATIONS.md §Rollback drill (staging = fork-free: redeploy previous tag, then smoke) | SC-16 |
| T-034 | operational (freeze) | `npm run verify:freeze` | all |
Red status at freeze: T-001..T-015, T-017 red (NotImplemented / assertion); T-020..T-030 red expected (stub app; verified in CI by S-002, R-003); T-016, T-031 green by design; T-032/T-033 not runnable until deploy.
