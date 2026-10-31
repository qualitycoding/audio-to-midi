---
id: L-20261101T041600Z-vitest-and-tsc-pass-on-bundler-only-errors
title: Vitest and tsc both pass on ESM/CJS interop errors that only the production bundler rejects
status: active
supersedes: []
recurrence_of: null
occurrences: 1
severity: Medium
tags: [tech:vite, tech:vitest, tech:typescript, phase:verification, kind:verification-gap]
recorded_by: implementer
run: addendum-20261101T033000Z-audio-to-midi
recorded_at: 2026-11-01T04:16:00Z
---
## Trigger
TypeScript code imports an npm package through a CJS default export; the plan's CI runs `tsc` and
Vitest but never the production build.
## What went wrong
`transcribe.ts` imported basic-pitch's default export — fine under Vitest/ts-node transforms,
rejected by Vite's production bundler ("no default export"). CI would have stayed green; the error
was caught only because the implementer ran `npm run build` by hand (DEVIATIONS §5).
## Correction
Import the named ESM exports; and (addendum D-036) `npm run build` now runs in the CI `unit` job
on every PR.
## Prevention rule
CI builds the production bundle on every PR, not just at deploy time; any "works in tests" claim
for bundler-visible code is backed by a build log.
## Detection check
ci.yml `unit` job contains an `npm run build` step before the test step (added 2026-11-01).
## Evidence
DEVIATIONS.md §5, §9; .github/workflows/ci.yml.
