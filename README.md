# audio-to-midi

A single-page web app, hosted on GitHub Pages, that turns isolated audio stems into MIDI and tablature — entirely in your browser.

**Live:** https://qualitycoding.github.io/audio-to-midi/

## What it does

- **Load multiple stems** (WAV, MP3, OGG, FLAC — whatever your browser can decode), up to 8 at once.
- **Shows a waveform per stem** with linked zoom (buttons, Ctrl/⌘ + wheel, pinch) from the whole track down to individual samples.
- **Plays any selection of stems** in sync, with per-stem gain and click-to-seek.
- **Shows pitch under each waveform:** a time-aligned note lane with note names, chord names for polyphonic passages (e.g. `Am7`), and a playhead readout of frequency, note and cents offset (A4 reference adjustable, default 440 Hz).
- **Tempo grid:** beat and bar lines drawn over every waveform, with BPM, offset, beats-per-bar and beat-unit controls so you can line the grid up with the music by eye and ear. The grid drives both exports.
- **Exports** a Standard MIDI File (one track per pitched stem) and tablature as ASCII text and MusicXML.

### Instruments and tunings for tab

| Preset | Strings (low → high) |
|---|---|
| Guitar, 6-string | E2 A2 D3 G3 B3 E4 |
| Guitar, 8-string | F♯1 B1 E2 A2 D3 G3 B3 E4 |
| Bass, 4-string | E1 A1 D2 G2 |
| Bass, 7-string | F♯0 B0 E1 A1 D2 G2 C3 |

Every string can be retuned, and frets run from 0 to **27**.

## Browser support

Current desktop Chrome, Firefox and Safari. Mobile is best-effort: tested on emulated Pixel 7 and
iPhone 15 in CI, plus a real Android phone (see `perf/MOBILE.md` for figures) — there's an on-page
bench panel (open the app with `?bench=1` appended to the URL) that generates its own test audio
and measures performance in one tap, no devtools required.

**Known gap:** headless Firefox on Linux (as used in this project's CI) has a
[documented upstream limitation](https://github.com/microsoft/playwright/issues/18206) where the
Web Audio clock doesn't advance, so one automated playback test fails there. This does not affect
real, non-headless Firefox users. See `DEVIATIONS.md` for detail.

## Privacy

All decoding, analysis and export happen locally in the browser. No audio is uploaded, and there
are no analytics or cookies.

## How it works

- Polyphonic note detection with Spotify's [basic-pitch](https://github.com/spotify/basic-pitch-ts) model (Apache-2.0) running on TensorFlow.js (WebAssembly backend).
- A McLeod pitch-method tracker for the live frequency readout and for notes below A0 (the 7-string bass's low F♯0 string is below basic-pitch's range).
- Fret positions chosen by a dynamic-programming search that minimises hand movement.

On a 240-second stem, analysis takes roughly 40 seconds on both a typical desktop and a real
Android phone (see `perf/MOBILE.md`); a 4×-throttled emulated mid-range phone takes closer to
three minutes.

## Development

Stack: TypeScript, Vite, Vitest and Playwright (desktop Chromium, Firefox and WebKit, plus
emulated Pixel 7 and iPhone 15). See `plan/ENVIRONMENT.md` for exact setup commands,
`plan/PLAN.md` for the implementation plan this was built from, and `DEVIATIONS.md` for where the
implementation departed from that plan and why.

This project's plan and initial implementation were produced with the help of an AI planning and
coding agent (Claude), under human review and with human-gated approval before publishing.

## Licence

Licensed under the [Apache License, Version 2.0](LICENSE).
