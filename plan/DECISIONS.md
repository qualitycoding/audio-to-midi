# Decisions (D-###), interfaces and decision rules

## Architecture & dependencies
- **D-001** Profiles: `software` only, `software.deploys=true` (see PROFILE.md).
- **D-002** Pins (C-001, C-013): `@spotify/basic-pitch 1.0.1`, `@tensorflow/tfjs 3.21.0` (forced by basic-pitch's `^3.2.0`; overrides pin a single copy), `@tensorflow/tfjs-backend-wasm 3.21.0`, `@tonejs/midi 2.0.28`, `pitchy 4.1.0`, `tonal 6.4.3`; dev: `vite 8.3.1`, `vitest 5.0.2`, `@playwright/test 1.63.0`, `typescript 5.9.3` (not 7.x — new compiler major, avoid), `@types/node 22.20.4`. Node 22.x.
- **D-003** Do **not** use basic-pitch's `generateFileData` (uses Node `Buffer`, C-003); MIDI is written with `@tonejs/midi` directly (D-018).
- **D-004** Model files (`model.json`, `group1-shard1of1.bin`, ~904 KB) and tfjs-backend-wasm `.wasm` files are copied into `public/models/basic-pitch/` and `public/tfjs-wasm/` by `scripts/copy-assets.mjs` at build time (served same-origin; required by CSP and offline use). Runtime URLs: `${import.meta.env.BASE_URL}models/basic-pitch/model.json` and wasm path `${import.meta.env.BASE_URL}tfjs-wasm/`. Both `public/` subfolders are git-ignored.
- **D-005** CI workflow files are delivered as templates in `plan/workflows/` and installed to `.github/workflows/` by step S-001 (the planning PAT is not assumed to carry the `workflow` scope).

## Public interfaces (D-010) — stubs committed in `src/`, signatures are frozen by the tests
| Module | Function(s) | Error contract |
|---|---|---|
| `core/notes.ts` (D-011) | `freqToPitch(hz,a4?)`, `midiToName(m)`, `midiToHz(m,a4?)` | non-positive/non-finite hz → `RangeError("invalid frequency: …")`. Names use sharps, octave = floor(m/12)−1. |
| `core/chord.ts` (D-012) | `labelSimultaneous(midis)`, `groupSimultaneous(notes, 0.05)` | Label = first `tonal` `Chord.detect` result on sharp pitch classes ordered bass-first, with a bare trailing `M` removed (`"C#M"`→`"C#"`); < 3 pitch classes or no match → note names ascending, space-joined. Groups: onset within 50 ms of the group's first onset. |
| `core/tunings.ts` (D-013) | `MAX_FRET=27`, `TUNINGS` | Values in T-003. |
| `core/beatGrid.ts` (D-014) | `validateGrid`, `gridLines`, `secToBeats` | `bpm` is **quarter-note** BPM; line spacing = (60/bpm)·(4/beatUnit); bars where beatIndex ≡ 0 (mod beatsPerBar); half-open [from,to); `RangeError("bpm out of range")`, `RangeError("beatsPerBar out of range")` (1–16). beatIndex normalised so −0 never appears. |
| `core/fretting.ts` (D-015) | `assignFrets(notes,tuning,{maxFret=27,chordWindowSec=0.05})` | See D-015 algorithm. |
| `core/tabAscii.ts` (D-016) | `renderAsciiTab` | Line format `<label padEnd(maxLabel)> |<cells>|<cells>|…` highest string first; bars from the bar containing min(first onset beat, 0) to the bar containing the last onset; `colsPerBeat=4`, `barsPerLine=4`; a column is as wide as its widest fret number, padded with `-`, plus one `-` separator; trailing `# unplayable: NAME@t.tttS, …`. |
| `core/musicxml.ts` (D-017) | `renderMusicXml(parts, grid)` | MusicXML 4.0 partwise; TAB clef line 5; `staff-lines` = string count; `staff-tuning line=1` = lowest string; `<string>` 1 = highest; `<sound tempo=bpm>`; time signature from grid; names XML-escaped; onsets quantised to 16th-of-quarter (`divisions=4`); must validate against `tests/schema/musicxml.local.xsd`. |
| `core/midiExport.ts` (D-018) | `buildMidi(stems, grid)` | SMF type 1 via `@tonejs/midi`; one track per stem with kind ≠ unpitched and ≥1 note, in stem order; channels 0–8 then 10–15 (skip 9); > 15 such stems → `RangeError("too many pitched stems …")`; velocity = max(1, round(amp·127)); real-time note placement (no quantisation). |
| `core/peaks.ts` (D-019) | `computePeaks`, `buildPyramid(x, base=16)` | `RangeError("samplesPerBin must be >= 1")`. |
| `core/viewport.ts` (D-019) | `zoomAt`, `clampViewport`, `secToPx` | secPerPx ∈ [1/sampleRate, duration/widthPx]. |
| `analysis/pitchTrack.ts` (D-020) | `trackPitch(x, sr, {windowSize, hopSize, minClarity=0.9})` | Default window = 2^round(log2(4096·sr/44100)), hop = window/4; skip windows with mean-square < 1e-8; keep hz > 15 and clarity ≥ minClarity; `timeSec` = window centre. |
| `analysis/subA0.ts` (D-021) | `segmentSubA0(frames, a4=440, windowSec=4096/44100)` | Frames with round(MIDI) < 21; consecutive same-MIDI frames with gap ≤ 0.06 s form a note; keep ≥ 0.15 s; startSec = first centre − windowSec (≥0). |
| `analysis/transcribe.ts` (D-022, D-023) | `PRESETS`, `initBackend(order, wasmPath)`, `transcribe(x22k, mode, model, onProgress)` | Presets: mono 0.7/0.5/11, poly 0.5/0.3/5 (onset/frame/minNoteLen frames). Backend order wasm → webgl (only if `WEBGL_RENDER_FLOAT32_CAPABLE`) → cpu; after selecting wasm, re-register `Fill` with `dtype ?? 'float32'` (C-009). `onProgress` non-decreasing, final call 1. |
| `io/validate.ts` (D-024, D-030) | `validateSelection`, `validateDecoded`, `mixToMono`, `memoryBudgetBytes`, `fitsBudget` | Extension allow-list (case-insensitive, MIME ignored); codes `bad-type` > `empty` > `too-large` > `too-many` precedence; `RangeError("audio too long")`. |
| `perf/report.ts` (D-026) | `validatePerfReport` | Throws `Error("invalid perf report: <field>")`. |

## D-015 fret assignment
Group notes into simultaneities (D-012). For each group enumerate voicings: each note on a distinct string with 0 ≤ fret ≤ maxFret, or dropped; keep only voicings with the minimum number of dropped notes (dropped → `unplayable`); cap 3000 voicings per group (enumeration order: notes ascending, strings low→high). A voicing admits hand positions h with max(fretted)−3 ≤ h ≤ min(fretted), h ≥ 1 (all-open: any h). DP over states (voicing, h): cost = Σ|Δh| + 0.01·Σfret + 0.5·(#open strings) if h ≥ 5 + 100·#dropped. Ties → first state in enumeration order. Notes outside [lowest open, highest open+maxFret] → `unplayable` directly. Reference implementation: `research/spikes/ref-impl/src/core/fretting.ts` (non-normative).

## D-020..D-023 analysis pipeline (per pitched stem, in a Web Worker)
1. Decode (main thread `decodeAudioData`, callback form wrapped in a Promise for Safari, C-014) → `validateDecoded` → `mixToMono`.
2. Resample to 22 050 Hz with `OfflineAudioContext` (main thread) → transfer to worker.
3. Worker: `initBackend(['wasm','webgl','cpu'], '<base>/tfjs-wasm/')` once; `transcribe(…, mode)` where mode defaults to `poly` for kind `guitar`/`pitched`, `mono` for `bass`; user can override per stem.
4. Worker: `trackPitch` on the original-rate mono signal; for kind `bass` (or tuning lowest string < MIDI 21) merge `segmentSubA0` notes.
5. Post notes + frames to main thread; note lane labels: `groupSimultaneous` → `labelSimultaneous` (single notes → `midiToName`).

## D-030 memory budget (R-010)
Decoded AudioBuffer bytes = length × channels × 4. `memoryBudgetBytes(navigator.deviceMemory)`: ≤ 4 GB → 400e6, otherwise/unknown → 1.5e9. A stem that would exceed the budget is rejected with an alert naming the file (“not enough memory for this stem on this device”). Resampled/mono copies are released after transfer to the worker.

## D-024 security
CSP meta exactly as in `index.html` (no `unsafe-eval`, no inline script). All user strings rendered with `textContent`. No network requests except same-origin assets. `?test=1` hook is read-only.

## D-025 UI / test-hook contract (frozen by tests/e2e)
`data-testid`: `file-input`, `stem` (×N) containing `waveform` (canvas), `note-lane`, `note-label`, `stem-select` (checkbox, default checked), `stem-gain`, `stem-kind` (guitar|bass|pitched|unpitched; default `pitched`), `stem-tuning` (guitar6|guitar8|bass4|bass7|custom), `stem-mode` (mono|poly); transport `play`, `stop`; `zoom-in`, `zoom-out` (factor 2), `zoom-fit`; grid `bpm` (number input, min 20 max 400 step 0.1, `aria-invalid="true"` and value not applied when out of range; applied on Enter/change), `grid-offset`, `beats-per-bar`, `beat-unit`; `export-midi` (`<name>.mid`), `export-tab-txt` (`.txt`), `export-musicxml` (`.musicxml`); errors in a `role="alert"` region naming the file. Analysis starts on load; changing kind, tuning, mode or A4 cancels and re-runs that stem's analysis (bench measures the last completed run). Default tuning for kind guitar = guitar6, bass = bass4. `a4` (number input 400–480, default 440). `window.__a2m` (only with `?test=1`): `stems[i].labels` = the note-lane label strings of that stem in time order;  `state()` returning `HookState` (tests/e2e/helpers.ts) — `gridLinesVisible` counts lines with startSec ≤ t < startSec+widthPx·secPerPx; `bench(deviceLabel)` (only with `bench=1`) returns a `PerfReport`.

## D-026 performance measurement
`bench()` measures: decodeMs, analysisMs (worker start→notes posted), realtimeFactor = stemSeconds/(analysisMs/1000), zoom frame times over 60 programmatic zoom steps via `requestAnimationFrame` deltas (median, p95), playStartLatencyMs = time from `play` click to `AudioContext.currentTime` advancing. `appCommit` comes from a Vite `define` constant `__APP_COMMIT__` = `process.env.GITHUB_SHA` (first 7 chars) or `git rev-parse --short HEAD` at build time. Desktop perf gate runs on GitHub `ubuntu-latest` Chromium; mobile runs are recorded only (A-013).

## D-027 fixtures
Unit/accuracy fixtures are synthesized in-test (`tests/fixtures/synth.ts`); E2E audio is generated by `npm run fixtures` (deterministic; not committed). No copyrighted audio anywhere.

## D-028 test matrix — see `playwright.config.ts`.
## D-029 Vite `base: '/audio-to-midi/'`; Pages deploy via `actions/upload-pages-artifact` + `actions/deploy-pages`, workflow_dispatch only, `environment: github-pages` with required reviewer (G-002).

## Decision rules (3.2)
| ID | If … | Then … |
|---|---|---|
| DR-01 | `npm ci` fails | Retry once; if `ERESOLVE`, do not add `--force`/`--legacy-peer-deps`; halt `BLOCKED.md`. |
| DR-02 | basic-pitch output shape differs from C-005 (e.g. `evaluateModel` callback args) | Adapt the wrapper only; T-013 must still pass unchanged; else `TEST_CHALLENGE.md`. |
| DR-03 | wasm backend fails in a browser (T-020/T-026 red with wasm errors) | Try webgl (float32-capable) then cpu; record which in `DEVIATIONS.md`; if desktop perf (T-028) then fails → halt `BLOCKED.md`. |
| DR-04 | CSP blocks TF.js/wasm | Add only `'wasm-unsafe-eval'`-class allowances already present; never `unsafe-eval`/inline script → else halt `BLOCKED.md` (security). |
| DR-05 | T-028 desktop analysis ≥ 60 s | Profile; allowed fixes: chunked worker pipelining, WebGL backend when float32-capable. Never change thresholds. After 2 attempts → halt `BLOCKED.md` with measurements. |
| DR-06 | Mobile perf run crashes / exceeds 900 s | Record the failure as the figure (`analysisMs` = timeout, note in `perf/MOBILE.md`); do not gate; continue. |
| DR-07 | A browser cannot decode FLAC/OGG | Show `role=alert` "format not supported by this browser"; document in README; not a failure. |
| DR-08 | `npm audit --audit-level=high` reports a vuln | Upgrade within pinned major if a fix exists; otherwise halt `BLOCKED.md`. |
| DR-09 | Pages deploy or post-deploy smoke fails | Roll back per OPERATIONS.md; halt. |
| DR-10 | Frozen test believed wrong | Halt; write `TEST_CHALLENGE.md`. |
| DR-11 | Default rule | Most reversible option that does not expand scope; log in `DEVIATIONS.md`; halt instead if it touches frozen tests, security, data integrity, the D-025 public contract, or integrity (Rule 9). |

## D-031 Process deviation (tier fallback, Global Rule 5)
Subagent spawning is unavailable in the planning environment. All tiers (Fable/Opus/Sonnet/Haiku roles) were performed by the single planning agent; "fresh-context" cold-read (3.6) and pre-mortem (Phase 4) were therefore performed in the same context. Mechanical (Haiku-role) checks were scripted (`research/spikes/check_plan.py`) to reduce self-review bias. Recorded as R-022 and in `.checkpoints/state.json` `tier_substitutions`.
