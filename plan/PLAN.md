# Plan

**Status: READY** — profiles: `software` (`software.deploys = true`) · branch `gen-20260926T113449Z-audio-to-midi`

| Metric | Count |
|---|---|
| Claims by confidence | verified 18 · corroborated 4 · single-source 2 · inferred 1 (25 total, 24 load-bearing) |
| Tests by category | unit 12 · integration/accuracy 1 · security 5 · operational 3 · e2e functional 5 · e2e mobile 1 · performance 2 · repo 1 · deployment 2 (32 total) |
| Steps | 17 |
| Gates | 2 (G-002, G-003) |
| Risks by residual severity | Critical 0 · High 0 · Medium 11 · Low 7 |
| Process deviation | D-031: single-agent tiers; same-context cold-read and pre-mortem (R-022) |

Reading order: HANDOFF.md → plan/PROFILE.md → plan/ASSUMPTIONS.md → plan/DECISIONS.md → tests/INDEX.md → this file → plan/GATES.md → plan/OPERATIONS.md.

## Success criteria
| ID | Criterion (measurable) |
|---|---|
| SC-1 | Up to 8 stems load via file picker; extra/invalid files rejected with a named alert |
| SC-2 | Each stem shows a non-blank waveform canvas |
| SC-3 | Linked zoom: ×2 per click, range whole-track … 1 sample/px, fit button |
| SC-4 | Note lane with note/chord labels; playhead readout Hz, note, cents |
| SC-5 | A4 reference adjustable (default 440) |
| SC-6 | BPM grid lines with BPM/offset/beats-per-bar/beat-unit selectors driving exports |
| SC-7 | Guitar 6/8, bass 4/7 presets, retunable strings, frets 0–27, sub-A0 notes on 7-string bass |
| SC-8 | ASCII tab and MusicXML (XSD-valid) exports |
| SC-9 | SMF type-1 MIDI export, one track per pitched stem |
| SC-10 | Held-out accuracy: mono F1 ≥ 0.95, poly F1 ≥ 0.80 |
| SC-11 | Corrupt files and script-bearing filenames are harmless |
| SC-12 | CSP without unsafe-eval/inline script; no off-origin requests; no errors; dependency audit clean |
| SC-13 | Desktop: 240 s stem analysed < 60 s, zoom median frame < 16 ms, play start < 100 ms |
| SC-14 | Mobile tested (emulated Pixel 7 + iPhone 15) and figures recorded (emulated throttled + real devices at G-003) |
| SC-15 | README.md and Apache-2.0 LICENSE present |
| SC-16 | Deployed to GitHub Pages behind G-002 with smoke test and rollback drill |
| SC-17 | Plays exactly the selected stems in sync; stop resets |

## Steps at a glance
| Step | Title | Tier | Gate |
|---|---|---|---|
| S-001 | Repository and CI bootstrap | Sonnet | D-005, D-029, G-002 |
| S-002 | CI red baseline (resolves R-003) | Sonnet | C-020, R-003 |
| S-003 | Notes, tunings, chord labels | Sonnet | C-010, C-011 |
| S-004 | Beat grid, peaks, viewport | Sonnet | D-014, D-019 |
| S-005 | Fret assignment DP | Opus | D-015 |
| S-006 | Exporters: ASCII tab, MusicXML, MIDI | Sonnet | C-012, C-016, C-017, C-022 |
| S-007 | Analysis modules, validation, perf schema | Opus | C-004..C-009, D-022, D-023 |
| S-008 | App shell, assets, loading, test hook | Sonnet | D-004, D-024, D-025, C-014 |
| S-009 | Waveform canvases and linked zoom | Sonnet | D-019 |
| S-010 | Worker analysis pipeline, note lane, readout | Opus | D-020..D-023 |
| S-011 | Synchronised multi-stem playback | Sonnet | A-010 |
| S-012 | BPM grid overlay and selectors | Sonnet | D-014 |
| S-013 | Export UI | Sonnet | D-016..D-018 |
| S-014 | Bench harness and perf records | Sonnet | C-009, C-019, A-013, A-015 |
| S-015 | Full matrix green in CI | Sonnet | D-028 |
| S-016 | Documentation and release candidate | Sonnet | A-022 |
| S-017 | Deploy to GitHub Pages + rollback drill | Sonnet | D-029 |

### S-001 Repository and CI bootstrap
- Tier: Sonnet
- Profile: software
- Depends on: none
- Inputs: branch gen-20260926T113449Z-audio-to-midi; plan/workflows/*.yml; env GH_TOKEN (implementer's own, scopes: contents, workflows, pages, administration:write for environments)
- Actions:
  1. `git checkout -b impl/v0.1 origin/gen-20260926T113449Z-audio-to-midi`
  2. `mkdir -p .github/workflows && cp plan/workflows/ci.yml plan/workflows/deploy.yml .github/workflows/`
  3. `gh api -X POST repos/qualitycoding/audio-to-midi/pages -f build_type=workflow || gh api -X PUT repos/qualitycoding/audio-to-midi/pages -f build_type=workflow`
  4. `UID=$(gh api users/qualitycoding --jq .id); gh api -X PUT repos/qualitycoding/audio-to-midi/environments/github-pages --input - <<<"{\"reviewers\":[{\"type\":\"User\",\"id\":$UID}]}"`
  5. `git add .github && git commit -m 'ci: install workflows (S-001)' && git push -u origin impl/v0.1 && gh pr create --draft --base main --head impl/v0.1 --title 'v0.1 implementation' --body 'Implements plan on gen-20260926T113449Z-audio-to-midi'`  (workflow_dispatch only works once a workflow is on the default branch, so CI on impl/v0.1 runs via this draft PR's `pull_request` trigger)
- Outputs: .github/workflows/ci.yml, .github/workflows/deploy.yml; Pages source = GitHub Actions; environment github-pages with required reviewer
- Evidence produced: none
- Done when: `gh api repos/qualitycoding/audio-to-midi/environments/github-pages --jq '.protection_rules[].type'` prints `required_reviewers`; `npm run verify:freeze` OK
- Checkpoint: record `S-001 done; commit hash` in `.checkpoints/impl-state.json` (same schema as planning state; phase = step id) and commit `checkpoint: S-001`
- On failure: If environment API returns 403/404: halt BLOCKED.md (G-002 enforcement impossible). Workflow push rejected for scope: halt BLOCKED.md naming the missing `workflow` scope. Rollback for any step: `git reset --hard <last checkpoint commit>` on impl/v0.1.
- Gate: none
- Relevant decisions/claims: D-005, D-029, G-002

### S-002 CI red baseline (resolves R-003)
- Tier: Sonnet
- Profile: software
- Depends on: S-001
- Inputs: impl/v0.1
- Actions:
  1. `gh run watch $(gh run list --branch impl/v0.1 --workflow ci.yml --limit 1 --json databaseId --jq '.[0].databaseId') || true`
  2. `gh run view $(gh run list --branch impl/v0.1 --workflow ci.yml --limit 1 --json databaseId --jq '.[0].databaseId') --log > ci-red.log`
  3. Classify every failure: unit/accuracy must fail only with `not implemented` or AssertionError; e2e must fail only on locator/expect timeouts or `__a2m` undefined (stub app); T-016, T-031, T-034 must pass; T-027 may pass.
  4. Write RED_BASELINE.md with counts per class and the run URL; commit.
- Outputs: RED_BASELINE.md
- Evidence produced: none (verifies frozen tests are red for the right reason)
- Done when: RED_BASELINE.md shows zero failures of class 'other' (syntax/config/fixture/browser-launch)
- Checkpoint: record `S-002 done; run id` in `.checkpoints/impl-state.json` (same schema as planning state; phase = step id) and commit `checkpoint: S-002`
- On failure: Any 'other' failure caused by test code/config → halt, write TEST_CHALLENGE.md (DR-10). Caused by CI environment (apt, browser install) → fix workflow only (not frozen), rerun, max 3. Rollback for any step: `git reset --hard <last checkpoint commit>` on impl/v0.1.
- Gate: none
- Relevant decisions/claims: C-020, R-003

### S-003 Notes, tunings, chord labels
- Tier: Sonnet
- Profile: software
- Depends on: S-002
- Inputs: src/core/{notes,tunings,chord}.ts stubs; D-011..D-013
- Actions:
  1. Implement per D-011, D-012 (use tonal Chord.detect on sharps; strip bare trailing M), D-013 values.
  2. `npx vitest run tests/unit/notes.test.ts tests/unit/chord.test.ts tests/unit/tunings.test.ts`
- Outputs: src/core/notes.ts, chord.ts, tunings.ts
- Evidence produced: T-001, T-002, T-003
- Done when: T-001..T-003 pass; `npx tsc --noEmit` clean
- Checkpoint: record `S-003 done` in `.checkpoints/impl-state.json` (same schema as planning state; phase = step id) and commit `checkpoint: S-003`
- On failure: Retry up to 3 fix cycles; then DR-10/DR-11. Rollback for any step: `git reset --hard <last checkpoint commit>` on impl/v0.1.
- Gate: none
- Relevant decisions/claims: C-010, C-011

### S-004 Beat grid, peaks, viewport
- Tier: Sonnet
- Profile: software
- Depends on: S-003
- Inputs: src/core/{beatGrid,peaks,viewport}.ts
- Actions:
  1. Implement per D-014, D-019 (normalise -0 in beatIndex).
  2. `npx vitest run tests/unit/beatGrid.test.ts tests/unit/peaks.test.ts`
- Outputs: src/core/beatGrid.ts, peaks.ts, viewport.ts
- Evidence produced: T-008, T-009, T-010
- Done when: T-008..T-010 pass
- Checkpoint: record `S-004 done` in `.checkpoints/impl-state.json` (same schema as planning state; phase = step id) and commit `checkpoint: S-004`
- On failure: As S-003. Rollback for any step: `git reset --hard <last checkpoint commit>` on impl/v0.1.
- Gate: none
- Relevant decisions/claims: D-014, D-019

### S-005 Fret assignment DP
- Tier: Opus
- Profile: software
- Depends on: S-003
- Inputs: src/core/fretting.ts; D-015; non-normative reference research/spikes/ref-impl/src/core/fretting.ts
- Actions:
  1. Implement D-015 exactly (voicing enumeration cap 3000, hand-position states, cost terms, tie-break).
  2. `npx vitest run tests/unit/fretting.test.ts`
- Outputs: src/core/fretting.ts
- Evidence produced: T-004
- Done when: T-004 passes incl. 2000-note < 2 s budget
- Checkpoint: record `S-005 done` in `.checkpoints/impl-state.json` (same schema as planning state; phase = step id) and commit `checkpoint: S-005`
- On failure: If budget fails: memoise voicings per pitch-set; never raise the budget (frozen). Rollback for any step: `git reset --hard <last checkpoint commit>` on impl/v0.1.
- Gate: none
- Relevant decisions/claims: D-015

### S-006 Exporters: ASCII tab, MusicXML, MIDI
- Tier: Sonnet
- Profile: software
- Depends on: S-004, S-005
- Inputs: src/core/{tabAscii,musicxml,midiExport}.ts; tests/schema/*
- Actions:
  1. Implement D-016, D-017, D-018.
  2. `sudo apt-get install -y libxml2-utils (if missing)`
  3. `npx vitest run tests/unit/tabAscii.test.ts tests/unit/musicxml.test.ts tests/unit/midiExport.test.ts`
- Outputs: src/core/tabAscii.ts, musicxml.ts, midiExport.ts
- Evidence produced: T-005, T-006, T-007
- Done when: T-005..T-007 pass
- Checkpoint: record `S-006 done` in `.checkpoints/impl-state.json` (same schema as planning state; phase = step id) and commit `checkpoint: S-006`
- On failure: XSD failure: fix generator, never the schema (frozen). Rollback for any step: `git reset --hard <last checkpoint commit>` on impl/v0.1.
- Gate: none
- Relevant decisions/claims: C-012, C-016, C-017, C-022

### S-007 Analysis modules, validation, perf schema
- Tier: Opus
- Profile: software
- Depends on: S-003
- Inputs: src/analysis/*, src/io/validate.ts, src/perf/report.ts
- Actions:
  1. Implement D-020..D-024, D-030, D-026 schema. Include the wasm Fill re-registration (C-009).
  2. `npm test && npm run test:accuracy`
- Outputs: src/analysis/pitchTrack.ts, subA0.ts, transcribe.ts, src/io/validate.ts, src/perf/report.ts
- Evidence produced: T-011..T-015, T-017
- Done when: `npm test` and `npm run test:accuracy` fully green
- Checkpoint: record `S-007 done; accuracy F1 values from test output` in `.checkpoints/impl-state.json` (same schema as planning state; phase = step id) and commit `checkpoint: S-007`
- On failure: T-013 below threshold: check preset wiring and resampling; do NOT tune presets (frozen D-022) → after 2 attempts DR-10. Rollback for any step: `git reset --hard <last checkpoint commit>` on impl/v0.1.
- Gate: none
- Relevant decisions/claims: C-004..C-009, D-022, D-023

### S-008 App shell, assets, loading, test hook
- Tier: Sonnet
- Profile: software
- Depends on: S-007
- Inputs: index.html, src/main.ts, vite.config.ts, D-004, D-024, D-025
- Actions:
  1. Write scripts/copy-assets.mjs copying node_modules/@spotify/basic-pitch/model/* → public/models/basic-pitch/ and node_modules/@tensorflow/tfjs-backend-wasm/dist/*.wasm → public/tfjs-wasm/; add `"prebuild": "node scripts/copy-assets.mjs"` and `"predev"` to package.json scripts (do not change other scripts).
  2. Build layout: header controls (transport, zoom, grid, A4, exports), stem list, alert region; file input validation (validateSelection) → decode (callback-form decodeAudioData wrapped) → validateDecoded → mono; stem rows per D-025.
  3. Expose window.__a2m only when new URLSearchParams(location.search).has('test').
  4. `npm run build && npm run fixtures && npx playwright test --project=chromium -g 'T-025|T-027'`
- Outputs: scripts/copy-assets.mjs, src/main.ts, src/ui/*.ts, public/ (generated, git-ignored), package.json scripts
- Evidence produced: partial T-025, T-027
- Done when: T-027 passes; T-025 passes except playback assertion (completed in S-011)
- Checkpoint: record `S-008 done` in `.checkpoints/impl-state.json` (same schema as planning state; phase = step id) and commit `checkpoint: S-008`
- On failure: CSP violation: DR-04. Rollback for any step: `git reset --hard <last checkpoint commit>` on impl/v0.1.
- Gate: none
- Relevant decisions/claims: D-004, D-024, D-025, C-014

### S-009 Waveform canvases and linked zoom
- Tier: Sonnet
- Profile: software
- Depends on: S-008
- Inputs: src/core/peaks.ts, viewport.ts
- Actions:
  1. Render per-stem canvas from pyramid level with samplesPerBin ≤ secPerPx·sampleRate; devicePixelRatio aware; ResizeObserver.
  2. Zoom buttons ×2/÷2 anchored at view centre; Ctrl/⌘+wheel and pinch anchored at pointer; zoom-fit.
  3. `npx playwright test --project=chromium -g T-021`
- Outputs: src/ui/waveform.ts, src/ui/zoom.ts
- Evidence produced: T-021
- Done when: T-021 passes on chromium
- Checkpoint: record `S-009 done` in `.checkpoints/impl-state.json` (same schema as planning state; phase = step id) and commit `checkpoint: S-009`
- On failure: Frame-time issues deferred to S-014 measurement. Rollback for any step: `git reset --hard <last checkpoint commit>` on impl/v0.1.
- Gate: none
- Relevant decisions/claims: D-019

### S-010 Worker analysis pipeline, note lane, readout
- Tier: Opus
- Profile: software
- Depends on: S-009
- Inputs: src/analysis/*
- Actions:
  1. Implement D-020..D-023 pipeline in src/worker/analyse.ts (module worker); OfflineAudioContext resample to 22050 on main thread; progress UI per stem; cancel on kind/tuning/mode/A4 change.
  2. Note lane under each waveform: labels from groupSimultaneous/labelSimultaneous aligned to viewport; readout of Hz/note/cents at playhead from trackPitch frames.
  3. `npx playwright test --project=chromium -g T-020`
- Outputs: src/worker/analyse.ts, src/ui/noteLane.ts, src/ui/readout.ts
- Evidence produced: T-020
- Done when: T-020 passes on chromium
- Checkpoint: record `S-010 done; backend reported by state()` in `.checkpoints/impl-state.json` (same schema as planning state; phase = step id) and commit `checkpoint: S-010`
- On failure: DR-03 for backend failures. Rollback for any step: `git reset --hard <last checkpoint commit>` on impl/v0.1.
- Gate: none
- Relevant decisions/claims: D-020..D-023

### S-011 Synchronised multi-stem playback
- Tier: Sonnet
- Profile: software
- Depends on: S-008
- Inputs: A-010
- Actions:
  1. One AudioContext; per stem GainNode; on play create AudioBufferSourceNodes for selected stems (none selected ⇒ all) and start all with the same `when = ctx.currentTime + 0.05` and offset; stop resets to 0; click on waveform seeks.
  2. Record startLatencyMs for the hook.
  3. `npx playwright test --project=chromium -g 'T-022|T-025'`
- Outputs: src/audio/player.ts
- Evidence produced: T-022, T-025
- Done when: T-022, T-025 pass on chromium
- Checkpoint: record `S-011 done` in `.checkpoints/impl-state.json` (same schema as planning state; phase = step id) and commit `checkpoint: S-011`
- On failure: If WebKit autoplay blocks: resume AudioContext inside the click handler. Rollback for any step: `git reset --hard <last checkpoint commit>` on impl/v0.1.
- Gate: none
- Relevant decisions/claims: A-010

### S-012 BPM grid overlay and selectors
- Tier: Sonnet
- Profile: software
- Depends on: S-004, S-009
- Inputs: D-014, A-012
- Actions:
  1. Grid inputs per D-025 (bpm min 20 max 400 step 0.1; aria-invalid on invalid, keep previous value); draw beat lines (thin) and bar lines (thick) over every waveform using gridLines for the visible range; expose gridLinesVisible.
  2. Grid feeds exports (S-013).
  3. `npx playwright test --project=chromium -g T-023`
- Outputs: src/ui/grid.ts
- Evidence produced: T-023
- Done when: T-023 passes on chromium
- Checkpoint: record `S-012 done` in `.checkpoints/impl-state.json` (same schema as planning state; phase = step id) and commit `checkpoint: S-012`
- On failure: none Rollback for any step: `git reset --hard <last checkpoint commit>` on impl/v0.1.
- Gate: none
- Relevant decisions/claims: D-014

### S-013 Export UI
- Tier: Sonnet
- Profile: software
- Depends on: S-006, S-010, S-012
- Inputs: D-016..D-018
- Actions:
  1. Buttons export-midi/export-tab-txt/export-musicxml; filenames `audio-to-midi-<yyyymmdd-hhmm>.<ext>`; tab/MusicXML include stems of kind guitar/bass using their tuning; ASCII = concatenated per-stem blocks with titles; download via Blob + object URL + <a download>.
  2. `npx playwright test --project=chromium -g T-024`
- Outputs: src/ui/export.ts
- Evidence produced: T-024
- Done when: T-024 passes on chromium
- Checkpoint: record `S-013 done` in `.checkpoints/impl-state.json` (same schema as planning state; phase = step id) and commit `checkpoint: S-013`
- On failure: none Rollback for any step: `git reset --hard <last checkpoint commit>` on impl/v0.1.
- Gate: none
- Relevant decisions/claims: D-016..D-018

### S-014 Bench harness and perf records
- Tier: Sonnet
- Profile: software
- Depends on: S-010, S-011, S-012
- Inputs: D-026
- Actions:
  1. Implement window.__a2m.bench(deviceLabel) (only with bench=1) per D-026, plus a visible 'Copy perf report' button when bench=1 (for G-003).
  2. `npm run fixtures && npx playwright test --project=desktop-perf && npm run test:perf-mobile`
  3. Write perf/MOBILE.md summarising perf/results/*.json (table: device, backend, realtimeFactor, zoom median/p95, play latency) and commit the JSON files.
- Outputs: src/perf/bench.ts, perf/results/*.json, perf/MOBILE.md
- Evidence produced: T-028, T-029
- Done when: T-028 passes; T-029 produced a valid JSON (pass/fail of its thresholds is record-only)
- Checkpoint: record `S-014 done; realtimeFactor values` in `.checkpoints/impl-state.json` (same schema as planning state; phase = step id) and commit `checkpoint: S-014`
- On failure: DR-05 (desktop), DR-06 (mobile). Rollback for any step: `git reset --hard <last checkpoint commit>` on impl/v0.1.
- Gate: none
- Relevant decisions/claims: C-009, C-019, A-013, A-015

### S-015 Full matrix green in CI
- Tier: Sonnet
- Profile: software
- Depends on: S-013, S-014
- Inputs: impl/v0.1
- Actions:
  1. `git push && sleep 20 && gh run watch --exit-status $(gh run list --branch impl/v0.1 --workflow ci.yml --limit 1 --json databaseId --jq '.[0].databaseId')`
  2. Fix implementation (never tests) until all jobs green across chromium, firefox, webkit, mobile-chromium, mobile-webkit, desktop-perf, mobile-perf.
  3. Write GATE-G-003.md per plan/GATES.md and halt.
- Outputs: GATE-G-003.md
- Evidence produced: T-001..T-031, T-034 green in CI
- Done when: ci.yml run on impl/v0.1 green; GATE-G-003.md committed
- Checkpoint: record `S-015 done; run URL` in `.checkpoints/impl-state.json` (same schema as planning state; phase = step id) and commit `checkpoint: S-015`
- On failure: Browser-specific failures: fix in app; FLAC/OGG decode gaps per DR-07. Rollback for any step: `git reset --hard <last checkpoint commit>` on impl/v0.1.
- Gate: G-003
- Relevant decisions/claims: D-028

### S-016 Documentation and release candidate
- Tier: Sonnet
- Profile: software
- Depends on: S-015 (+G-003 response)
- Inputs: README.md, perf/MOBILE.md
- Actions:
  1. Apply G-003 response (commit real-device JSONs or record 'none').
  2. Update README: usage, supported browsers, mobile figures table link, privacy, AI-assistance note (A-022), licence section unchanged.
  3. `gh pr ready` on the S-001 draft PR; wait for CI green; `gh pr merge --squash` (this puts deploy.yml on main, enabling workflow_dispatch).
  4. Write GATE-G-002.md per plan/GATES.md and halt.
- Outputs: README.md, perf/MOBILE.md, GATE-G-002.md
- Evidence produced: T-031 still green
- Done when: PR merged; CI on main green; GATE-G-002.md committed
- Checkpoint: record `S-016 done; merge commit` in `.checkpoints/impl-state.json` (same schema as planning state; phase = step id) and commit `checkpoint: S-016`
- On failure: none Rollback for any step: `git reset --hard <last checkpoint commit>` on impl/v0.1.
- Gate: G-002
- Relevant decisions/claims: A-022

### S-017 Deploy to GitHub Pages + rollback drill
- Tier: Sonnet
- Profile: software
- Depends on: S-016 (+G-002 proceed)
- Inputs: plan/OPERATIONS.md
- Actions:
  1. `git tag v0.1.0-rc1 && git push origin v0.1.0-rc1`
  2. `gh workflow run deploy.yml --ref main -f ref=v0.1.0-rc1 → approve environment (human) → gh run watch --exit-status`
  3. Rollback drill T-033 per OPERATIONS.md; then tag v0.1.0 on the good commit and deploy it.
  4. `tests/deploy/smoke.sh https://qualitycoding.github.io/audio-to-midi/`
- Outputs: OPERATIONS-LOG.md, tags v0.1.0-rc1, v0.1.0-rc2, v0.1.0
- Evidence produced: T-032, T-033
- Done when: smoke OK after final deploy; drill recorded
- Checkpoint: record `S-017 done; deployed commit` in `.checkpoints/impl-state.json` (same schema as planning state; phase = step id) and commit `checkpoint: S-017`
- On failure: DR-09: redeploy last good or disable Pages; halt. Rollback for any step: `git reset --hard <last checkpoint commit>` on impl/v0.1.
- Gate: none (runs only after G-002)
- Relevant decisions/claims: D-029

## Resume rule (implementer)
On start, read `.checkpoints/impl-state.json`; verify `npm run verify:freeze`; resume at the first step not in `completed`. Every step is idempotent: re-running rewrites the same files and re-runs its tests.
