---
id: L-20261101T041800Z-perf-harness-must-exercise-what-it-reports
title: A perf metric is only real if the harness performs the action it measures
status: active
supersedes: []
recurrence_of: null
occurrences: 1
severity: High
tags: [domain:audio, tech:playwright, phase:verification, kind:verification-gap]
recorded_by: implementer
run: addendum-20261101T033000Z-audio-to-midi
recorded_at: 2026-11-01T04:18:00Z
---
## Trigger
A frozen perf harness reports a metric it never exercises — `playStartLatencyMs` read from
`player.lastStartLatencyMs` with a `?? 0` fallback, but the spec never clicks play.
## What went wrong
Every committed PerfReport (desktop, emulated mobile, real Android) shows play-start latency
0 ms — not a measurement (DEVIATIONS §6). SC-13's "play start < 100 ms" budget was therefore
never verified. Disclosure saved it from being a silent integrity failure; it is still a
verification gap (R-023, human decision).
## Correction
Gap disclosed in DEVIATIONS.md and perf/MOBILE.md (Rule 9); addendum escalated it to a tracked
High risk with a concrete unfreeze-and-extend proposal instead of touching the frozen spec.
## Prevention rule
For every metric a harness reports, the harness must contain the exercising action (click, key
press, call); a `?? 0`/null-fallback on an unexercised metric fails review.
## Detection check
Read the frozen spec: each reported field has a producing action in the same file; grep for the
action name when adding a metric.
## Evidence
DEVIATIONS.md §6; perf/MOBILE.md caveat; R-023.
