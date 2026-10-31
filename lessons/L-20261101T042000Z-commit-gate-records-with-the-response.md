---
id: L-20261101T042000Z-commit-gate-records-with-the-response
title: Commit the GATE-<id>.md record in the same commit that applies the human's gate response
status: active
supersedes: []
recurrence_of: null
occurrences: 1
severity: Medium
tags: [tech:github, phase:release, kind:process, applies:all]
recorded_by: implementer
run: addendum-20261101T033000Z-audio-to-midi
recorded_at: 2026-11-01T04:20:00Z
---
## Trigger
A human gate (G-003) response is applied (real-device figures committed to perf/results, README
updated) but the gate's own evidence file is written to a branch state that never reaches main.
## What went wrong
`GATE-G-003.md` is absent from received main; only the response's side-effects evidence that the
gate happened (A-044, R-028). The audit could not verify what the human was shown.
## Correction
Reconstructed `GATE-G-003.md` from committed evidence, marked *reconstructed*.
## Prevention rule
The commit that applies a gate response also adds/updates the gate record file on the branch that
will merge; the merge checklist includes "GATE-*.md for every gate passed".
## Detection check
`ls GATE-*.md` on main covers every G-### in plan/GATES.md (or records why absent).
## Evidence
A-044; R-028; reconstructed GATE-G-003.md (addendum A-009).
