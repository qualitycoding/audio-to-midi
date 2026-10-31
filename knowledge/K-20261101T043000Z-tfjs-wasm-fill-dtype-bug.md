---
id: K-20261101T043000Z-tfjs-wasm-fill-dtype-bug
statement: "@tensorflow/tfjs-backend-wasm 3.21.0 fails on the basic-pitch graph ('Unknown dtype undefined' in Fill); re-registering Fill with dtype defaulting to float32 fixes it with identical accuracy; throughput 7.67x realtime single-thread SIMD on a 2.1 GHz Xeon core."
status: current
supersedes: []
tags: [domain:audio, tech:tensorflow-js, subject:tfjs-wasm-fill-dtype-bug, phase:research]
applies_to_version: "@tensorflow/tfjs-backend-wasm 3.21.0"
source: { url: "research/spikes/wasm_spike.mjs", doi: "", title: "spike wasm_spike.mjs", locator: "error + patched run", accessed: "2026-09-26", tier: 1 }
confidence: verified
derived_from: [C-009]
discovered_by: planner
run: 20260926T113449Z-audio-to-midi
recorded_at: 2026-11-01T04:30:00Z
---
Claim register entry C-009 from the base plan's research (load-bearing: True).
Full source list and verification notes: research/claims.json and research/SOURCES.md.
Contradicted by: []. Informs: D-023, DR-03, A-015.
