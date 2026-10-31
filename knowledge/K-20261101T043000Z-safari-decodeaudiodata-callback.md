---
id: K-20261101T043000Z-safari-decodeaudiodata-callback
statement: "Safari's decodeAudioData has historically needed the callback form and may call the error callback with null; decode support differs from canPlayType."
status: current
supersedes: []
tags: [domain:audio, tech:web-audio, subject:safari-decodeaudiodata-callback, phase:research]
applies_to_version: "@tensorflow/tfjs 3.21.0"
source: { url: "https://api.dart.dev/dart-web_audio/AudioContext/decodeAudioData.html", doi: "", title: "Dart web_audio decodeAudioData notes", locator: "implementation comment", accessed: "2026-09-26", tier: 3 }
confidence: corroborated
derived_from: [C-014]
discovered_by: planner
run: 20260926T113449Z-audio-to-midi
recorded_at: 2026-11-01T04:30:00Z
---
Claim register entry C-014 from the base plan's research (load-bearing: True).
Full source list and verification notes: research/claims.json and research/SOURCES.md.
Contradicted by: []. Informs: D-020..D-023 step 1, DR-07.
