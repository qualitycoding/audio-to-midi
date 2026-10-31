---
id: L-20261101T042300Z-probe-knowledge-store-dont-adopt-defaults
title: Probe the knowledge store's existence and name at intake; never adopt protocol defaults silently
status: active
supersedes: []
recurrence_of: null
occurrences: 1
severity: Low
tags: [phase:intake, kind:wrong-assumption, applies:all]
recorded_by: implementer
run: addendum-20261101T033000Z-audio-to-midi
recorded_at: 2026-11-01T04:23:00Z
---
## Trigger
A run starts under a protocol version whose knowledge-store default was later corrected
(`agent-knowledge` → `knowledge`, planning-protocol-review corrections 2026-10-27), or — as here —
predates the store entirely (plan of 2026-09-26 vs store introduced 2026-10-04).
## What went wrong
Nothing broke in this repo (the store did not exist), but the intake has no record that R0 loaded
nothing or why; a future reader cannot tell "no lessons existed" from "lessons were ignored".
## Correction
Addendum wrote research/PRIOR_KNOWLEDGE.md recording the store state at planning time and the
default-store assumption (A-043) with an explicit access-check note (0.3.7).
## Prevention rule
At intake, verify the knowledge store is reachable and record its location + commit + readability
in .checkpoints/state.json; if it postdates the work or is unreadable, record that in
research/PRIOR_KNOWLEDGE.md — never assume the default silently.
## Detection check
state.json `knowledge_store` field is non-empty on every run; PRIOR_KNOWLEDGE.md exists for runs
claiming R0.
## Evidence
research/PRIOR_KNOWLEDGE.md; .checkpoints/state.json; A-043.
