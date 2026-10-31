---
id: K-20261101T043000Z-tfjs-cpu-realtime-factor
statement: "TF.js cpu backend runs basic-pitch at ~0.5-0.6x realtime in Node (23 s for 13 s audio), far too slow for the desktop target."
status: current
supersedes: []
tags: [domain:audio, tech:tensorflow-js, subject:tfjs-cpu-realtime-factor, phase:research]
applies_to_version: "@tensorflow/tfjs 3.21.0"
source: { url: "research/spikes/bp_spike.mjs", doi: "", title: "spike bp_spike.mjs", locator: "timing lines", accessed: "2026-09-26", tier: 1 }
confidence: verified
derived_from: [C-024]
discovered_by: planner
run: 20260926T113449Z-audio-to-midi
recorded_at: 2026-11-01T04:30:00Z
---
Claim register entry C-024 from the base plan's research (load-bearing: True).
Full source list and verification notes: research/claims.json and research/SOURCES.md.
Contradicted by: []. Informs: DR-03, R-006.
