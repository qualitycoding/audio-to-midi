# audio-to-midi

A single-page web app, hosted on GitHub Pages, that turns isolated audio stems into MIDI and tablature — entirely in your browser.

> **Status:** planning. The execution plan lives on the `gen-*` planning branch (start at `HANDOFF.md`). Nothing is implemented on `main` yet.

## What it will do

- **Load multiple stems** (WAV, MP3, OGG, FLAC — whatever your browser can decode), up to 8 at once.
- **Show a waveform per stem** with linked zoom (buttons, Ctrl/⌘ + wheel, pinch) from the whole track down to individual samples.
- **Play any selection of stems** in sync, with per-stem gain and click-to-seek.
- **Show pitch under each waveform:** a time-aligned note lane with note names, chord names for polyphonic passages (e.g. `Am7`), and a playhead readout of frequency, note and cents offset (A4 reference adjustable, default 440 Hz).
- **Tempo grid:** beat and bar lines drawn over every waveform, with BPM, offset and beats-per-bar controls so you can line the grid up with the music by eye and ear. The grid drives the exports.
- **Export** a Standard MIDI File (one track per stem) and tablature as ASCII text and MusicXML.

### Instruments and tunings for tab

| Preset | Strings (low → high) |
|---|---|
| Guitar, 6-string | E2 A2 D3 G3 B3 E4 |
| Guitar, 8-string | F♯1 B1 E2 A2 D3 G3 B3 E4 |
| Bass, 4-string | E1 A1 D2 G2 |
| Bass, 7-string | F♯0 B0 E1 A1 D2 G2 C3 |

Every string can be retuned, and frets run from 0 to **27**.

## Privacy

All decoding, analysis and export happen locally in the browser. No audio is uploaded, and there are no analytics or cookies.

## How it works (planned)

- Polyphonic note detection with Spotify's [basic-pitch](https://github.com/spotify/basic-pitch-ts) model (Apache-2.0) running on TensorFlow.js (WebAssembly backend).
- A McLeod pitch-method tracker for the live frequency readout and for notes below A0 (the 7-string bass low F♯0 string is below basic-pitch's range).
- Fret positions chosen by a dynamic-programming search that minimises hand movement.

## Development

Planned stack: TypeScript, Vite, Vitest and Playwright (desktop Chromium, Firefox and WebKit, plus emulated Pixel 7 and iPhone 15). Setup commands will be in `plan/ENVIRONMENT.md` on the planning branch until the app lands on `main`.

## Licence

Licensed under the [Apache License, Version 2.0](LICENSE).
