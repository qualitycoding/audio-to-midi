---
id: L-20261101T041900Z-log-every-substitution-in-the-commit-it-happens
title: Log every dependency/workflow substitution as a deviation in the commit that makes it
status: active
supersedes: []
recurrence_of: null
occurrences: 1
severity: Medium
tags: [tech:npm, phase:implementation, kind:process]
recorded_by: implementer
run: addendum-20261101T033000Z-audio-to-midi
recorded_at: 2026-11-01T04:19:00Z
---
## Trigger
A session adds a package or edits a workflow outside what plan/ENVIRONMENT.md and the D-### pins
record (here: `jsdom` + `scripts/smoke-dom.mjs` added for an ad-hoc probe).
## What went wrong
The probe was abandoned and its deviation never logged; 3.7.1-Q1a only caught it by diffing
package.json against D-002 months later (DEVIATIONS §8).
## Correction
Retroactive DEVIATIONS §8 entry; dead code removal proposed via reviews (R-025).
## Prevention rule
When the session ends, diff package.json / workflows / manifests against plan/ENVIRONMENT.md and
plan/DECISIONS.md; every unexplained difference becomes a DEVIATIONS.md entry in the same commit
that closes the session.
## Detection check
Session-closing commit message references the ENVIRONMENT diff; DEVIATIONS.md has one entry per
diff line.
## Evidence
DEVIATIONS.md §8; plan/ADDENDUM.md A-004.
