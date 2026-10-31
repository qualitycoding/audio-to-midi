---
id: K-20261101T043000Z-tonejs-midi-smf
statement: "@tonejs/midi 2.0.28 writes SMF format 1 (ppq 480, tempo track + one per addTrack), round-trips time signatures, notes (incl. MIDI 18) and tempo quantised to integer us/quarter (97.5 -> 97.5000975)."
status: current
supersedes: []
tags: [domain:audio, tech:midi, subject:tonejs-midi-smf, phase:research]
applies_to_version: "@tonejs/midi 2.0.28"
source: { url: "research/spikes/misc_spike.mjs", doi: "", title: "spike misc_spike.mjs", locator: "SMF line + header hex", accessed: "2026-09-26", tier: 1 }
confidence: verified
derived_from: [C-012]
discovered_by: planner
run: 20260926T113449Z-audio-to-midi
recorded_at: 2026-11-01T04:30:00Z
---
Claim register entry C-012 from the base plan's research (load-bearing: True).
Full source list and verification notes: research/claims.json and research/SOURCES.md.
Contradicted by: []. Informs: D-018, T-007.
