---
id: L-20261101T041700Z-headless-firefox-web-audio-clock
title: Headless Firefox on Linux CI has no advancing Web Audio clock — document it, never fake around it
status: active
supersedes: []
recurrence_of: null
occurrences: 1
severity: Medium
tags: [tech:playwright, tech:firefox, tech:web-audio, phase:verification, kind:environment]
recorded_by: implementer
run: addendum-20261101T033000Z-audio-to-midi
recorded_at: 2026-11-01T04:17:00Z
---
## Trigger
An e2e test waits for `AudioContext.currentTime` to advance; the CI job runs headless Firefox on
Linux (Playwright's docker images).
## What went wrong
`currentTime` never advances (upstream: microsoft/playwright#18206, open since 2022). T-022/T-025
stayed red on the firefox project only. The real app bug adjacent to it (a `resume()` race) was
fixed; the engine limitation itself was correctly NOT worked around by making the app fake time.
## Correction
Kept the app honest; documented the limitation; accepted as a known gap at G-002; the genuine
`AudioContext.resume()` race was fixed for all browsers.
## Prevention rule
When one engine's headless CI behaviour diverges, fix only what is a genuine app defect; record
engine-specific expected redness with an upstream link instead of weakening frozen tests or
faking app behaviour.
## Detection check
DEVIATIONS.md carries a per-engine CI limitation section linking the upstream issue; README
"Browser support" discloses it.
## Evidence
DEVIATIONS.md §4; README Known gap; GATE-G-002 "Known gap accepted".
