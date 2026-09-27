# Sources (tiers per protocol 1.3)
| Tier | Source | Used for | Verification note |
|---|---|---|---|
| 1 | npm registry metadata (`npm view`), 2026-09-26 | C-001, C-012, C-013, C-023 | Queried live; versions pinned in package-lock.json |
| 1 | basic-pitch-ts 1.0.1 source in npm tarball (`src/inference.ts`, `src/toMidi.ts`) | C-002..C-005 | Line numbers recorded in claims |
| 1 | Spikes in `research/spikes/` (code + printed output reproduced in rounds/round-2.md) | C-006..C-012, C-020, C-022, C-024 | Re-run commands listed in round-2.md |
| 1 | W3C MusicXML 4.0 tutorial (tablature) and element reference; XSD from github.com/w3c-cg/musicxml tag v4.0 | C-016, C-017, C-022 | XSD sha256 in tests/FROZEN_MANIFEST.sha256 |
| 1 | TensorFlow.js platform & environment guide | C-018 | Precision section |
| 1 | Chrome DevTools Protocol, Emulation domain | C-019 | setCPUThrottlingRate |
| 2 | GitHub community discussion #13309 | C-015 | Staff reply: custom headers unsupported |
| 2 | WebKit bug 226922 | C-014 | decodeAudioData vs canPlayType mismatch |
| 3 | Dart SDK web_audio docs | C-014 | Safari null error callback note |
| 3 | dev.to "Playwright supported browsers" | C-021 | WebKit ≠ Safari |
| 4 | Gist: Playwright CDP throttling | C-019 | Corroborates Tier 1 CDP doc only |
