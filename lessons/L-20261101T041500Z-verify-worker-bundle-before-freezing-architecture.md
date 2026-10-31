---
id: L-20261101T041500Z-verify-worker-bundle-before-freezing-architecture
title: Verify a browser-only bundle (web worker) with a real browser before freezing it into the plan
status: active
supersedes: []
recurrence_of: null
occurrences: 1
severity: Medium
tags: [domain:audio, tech:web-workers, tech:vite, phase:specification, kind:wrong-assumption]
recorded_by: implementer
run: addendum-20261101T033000Z-audio-to-midi
recorded_at: 2026-11-01T04:15:00Z
---
## Trigger
A plan step assigns an architecture that can only be verified in a real browser (here: TF.js +
basic-pitch inside a Vite-built Web Worker, D-023), and the executing environment has no browser.
## What went wrong
The implementer could not verify the worker bundle in the sandbox and substituted main-thread
analysis instead (DEVIATIONS §1) — a real UX regression (UI stall during analysis) that no frozen
test catches, still carried as R-029.
## Correction
Substitution was disclosed rather than silently shipping an unverified worker — but the better
outcome is not needing the substitution.
## Prevention rule
Before freezing any browser-only architectural requirement, spike the exact bundling path and run
it in a real browser; if the planning sandbox has none, mark the requirement "verify at S-000,
fallback pre-decided" in the plan instead of assuming it works.
## Detection check
Plan steps naming workers/wasm/codec paths carry a recorded browser-verification spike output, or
an explicit fallback decision rule; absence = violation.
## Evidence
DEVIATIONS.md §1; src/analysis/pipeline.ts runs on the main thread; R-029.
