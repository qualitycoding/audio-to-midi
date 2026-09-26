# Question tree (R1) — profile `software` (Engineering branch only)
Status: A = answered (claim), R = became a risk.

- Q1 Polyphonic transcription in-browser
  - Q1.1 Which library, licence, model size, input format? → C-001, C-002, C-005 (A) → D-002, D-004, D-022
  - Q1.2 Pitch range; can it detect F#0 (7-string bass)? → C-004 (A) → D-021, T-012
  - Q1.3 Accuracy on mono vs chords; threshold presets? → C-006, C-007 (A) → D-022, T-013
  - Q1.4 Which TF.js backend works under GitHub Pages + CSP; speed? → C-009, C-015, C-018, C-024 (A) → D-023, DR-03, T-028
  - Q1.5 Is basic-pitch MIDI writer browser-safe? → C-003 (A) → D-003
- Q2 Monophonic pitch/Hz readout and sub-A0 → C-008 (A) → D-020, T-011
- Q3 Chord naming → C-011 (A) → D-012, T-002
- Q4 Exports
  - Q4.1 MIDI writer, tempo precision → C-012 (A) → D-018, T-007
  - Q4.2 MusicXML tab for 8/7 strings, fret 27, validation → C-016, C-017, C-022 (A) → D-017, T-006
- Q5 Audio decode across browsers → C-014 (A), DR-07
- Q6 Testing
  - Q6.1 Mobile emulation + CPU throttling for recorded figures → C-019, C-020 (A) → D-026, D-028
  - Q6.2 Emulation fidelity vs real devices → C-021 (R-004) → G-003
  - Q6.3 Can the planner run browsers here? → C-020 (R-003)
  - Q6.4 Do synthetic fixtures predict real-recording accuracy? → C-025 (R-005)
- Q7 Toolchain compatibility / supply chain → C-013, C-023 (A) → D-002, DR-08
