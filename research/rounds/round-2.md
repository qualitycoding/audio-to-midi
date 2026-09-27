# Round 2 — Synthesis, depth, empirical (R3, R4, R6)
Spikes (all in `research/spikes/`, run with Node 22.22.2 in `spike/` with the pinned deps):
| Spike | Command | Result |
|---|---|---|
| bp_spike.mjs | `node bp_spike.mjs` (cpu) | mono F1 0.647 (P 0.5), chords F1 0.896, low-bass F1 0.2; 23.3 s for 13.25 s audio |
| bp_spike2.mjs | `node bp_spike2.mjs` | thresholds 0.7/0.5/11 → mono F1 1.0 (tuning set); FPs are harmonics |
| bp_spike3.mjs | `node bp_spike3.mjs` | held-out: mono 0.984 @0.7/0.5/11; poly 0.896 / 0.833 @0.5/0.3/5; high thresholds cut poly recall |
| mpm_spike.mjs | `node mpm_spike.mjs` | MPM 11/11 correct MIDI 18–40, error ≤ 0.02 semitone |
| misc_spike.mjs | `node misc_spike.mjs` | tonal names; SMF round-trip, tempo 97.5000975 |
| xsd validation | `xmllint --schema musicxml.local.xsd tab8.xml` | 8-string, fret 27 validates; fret −1 rejected |
Findings: C-004 (range), C-006/C-007 (presets), C-008, C-011, C-012, C-016, C-022 verified. Contradiction resolved: "single preset for all stems" (default) contradicted by C-007 → D-022 two presets.
