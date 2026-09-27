# Assumptions (A-###)
Source: Phase 0 intake batch (turn 1) and the human's reply (turn 2). "Default" = proposed default adopted because unanswered.

| ID | Topic | Resolution | Source |
|---|---|---|---|
| A-001 | GitHub push | Human supplied a fine-grained PAT; push verified (`qualitycoding`, admin/push). Token is never written to any file; implementer supplies own credentials. **Human advised to revoke after the planning push.** | Human |
| A-002 | Repo | `qualitycoding/audio-to-midi` (was empty). Default branch `main`. | Human |
| A-003 | Repo docs | Add `README.md` (human wrote "reader.md"; interpreted as README) and canonical Apache-2.0 `LICENSE` (from GitHub licenses API) — committed to `main` at planning time at the human's explicit request. | Human |
| A-004 | Licence | Apache-2.0 for all project code; dependencies must be Apache-2.0/MIT/BSD/ISC compatible. | Default |
| A-005 | Polyphonic detection | basic-pitch (TF.js) for note events; McLeod pitch method (pitchy) for live Hz readout and sub-A0 notes. | Default (+ C-004) |
| A-006 | Display beneath waveform | Time-aligned note lane with note names; chord name when ≥3 pitch classes match a template, else note set; playhead readout of Hz, note, cents. | Default |
| A-007 | Max fret | **27** for every instrument. | Human |
| A-008 | Instruments | Guitar 6 (E2 A2 D3 G3 B3 E4) and **8-string** (+F#1, B1 below). Bass 4 (E1 A1 D2 G2) and **7-string** (+F#0, B0 below, +C3 above). Every string retunable. | Human |
| A-009 | Tuning reference | 12-TET, A4 = 440 Hz, user-adjustable 400–480 Hz. | Default |
| A-010 | Playback | Per-stem select checkbox + gain; none ticked ⇒ play all; shared transport; click-to-seek; no loop regions. | Default |
| A-011 | Zoom | Horizontal, linked across stems; buttons, Ctrl/⌘+wheel, pinch; range whole-track … 1 sample/px. | Default |
| A-012 | **BPM grid** | Beat/bar lines over every waveform; selectors for BPM (quarter-note BPM, 20–400, step 0.1), offset (s), beats-per-bar (1–16), beat unit (2/4/8). Grid drives MIDI tempo/time signature and tab bar lines. | Human |
| A-013 | **Mobile** | Best-effort support, but **tested**: functional E2E on emulated Pixel 7 + iPhone 15, and a mobile-perf run that **records** figures (4× CPU throttle) in `perf/results/`; plus a real-device figure capture at gate G-003. Mobile figures are recorded, not pass/fail gated. | Human |
| A-014 | Threat model | Hostile audio files and filenames; no uploads, analytics, cookies, third-party requests; strict CSP via meta tag. | Default |
| A-015 | Performance (desktop) | 240 s stem analysed < 60 s; zoom median frame < 16 ms; play start < 100 ms. Measured on GitHub `ubuntu-latest` Chromium (the "mid-range laptop" proxy, D-026). | Default |
| A-016 | Accuracy | On held-out synthesized fixtures: mono F1 ≥ 0.95, poly F1 ≥ 0.80 (onset ±50 ms, pitch ±50 cents). No target on real recordings. | Default |
| A-017 | Inputs | WAV/MP3/OGG/FLAC as the browser decodes; ≤ 8 stems; ≤ 10 min each; ≤ 300 MB each; stems assumed start-aligned. | Default |
| A-018 | Browsers | Current desktop Chrome, Firefox, Safari; mobile best-effort per A-013. | Default |
| A-019 | Stack | TypeScript + Vite, no UI framework, Canvas 2D, Web Workers, Vitest, Playwright. | Default |
| A-020 | Gates | G-002 before any Pages publish; G-003 for real-device mobile figures (added from A-013). | Default + Human |
| A-021 | Out of scope v1 | Stem separation, recording, note editing, drum transcription, automatic tempo detection, staff notation, Guitar Pro, integration with `stem-splitter`. | Default |
| A-022 | AI disclosure | README states the plan was produced with an AI planning agent. Not a venue requirement (no `publication` profile). | Planner |
