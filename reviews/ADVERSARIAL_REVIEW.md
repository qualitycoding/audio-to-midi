# Adversarial review — S-ADVERSARIAL (retroactive, protocol §3.8)

**Reviewer:** addendum run `addendum-20261101T033000Z-audio-to-midi` (D-035). **Date:** 2026-11-01.
Method: challenge the assumptions the code embodies, throw hostile/malformed input at every pure
boundary, exercise abuse/misuse flows and resource-exhaustion paths. Executable battery:
`research/spikes/adversarial-probe.spec.ts` (throwaway, **not frozen**), run under Vitest 5.0.2 /
Node 22 — **11/11 probes pass, 0 Critical, 0 High breaks confirmed.**

## Assumptions challenged

| Assumption in code | Attack | Result |
|---|---|---|
| A-014 hostile files/filenames harmless | extension spoofing (`x.exe`, `x.mp3.wav.bak`, `trail.`, no-ext), case tricks (`x.WAV`), hidden-file (`.wav`), empty file, 300 MB+1 boundary, 9-file burst, 7-loaded+2-offered | all rejected with the right precedence codes; boundary exact (CR: `MAX_FILE_BYTES` itself accepted, +1 rejected) |
| A-017 input envelope | `validateDecoded` at 600 s / 600.0001 s / NaN / Infinity | exact boundary held; NaN/Infinity rejected (`!(d <= max)`) |
| D-030 memory budget | `deviceMemory` undefined/4/8 GB branches; budget line ±1 MB | correct branch + arithmetic |
| D-024/XSS | part name `<script>alert(1)</script>&"'` into MusicXML | fully escaped, no raw `<script>`; empty parts and empty tab render without crash |
| D-014 grid sanity | bpm 19/20/400/401, NaN, beatsPerBar 0/17, offset 1e12 | out-of-range rejected; 1e12 offset yields finite grid lines |
| Export abuse | 16 pitched stems into `buildMidi` | `RangeError("too many pitched stems …")` as designed; 15 accepted |
| Fretting abuse | empty note list; all notes unplayable on bass4; **400 simultaneous notes** against the 3000-voicing cap | empty→`{notes:[],unplayable:[]}`; unplayables flagged; 400-note chord completes in ~1.4 s (no hang; cap + DP holds) |
| Sub-A0 tracker | F#0 sequence; 20 kHz "ultrasound"; single 10 ms blip; a4=480 remapping | MIDI 18 detected for F#0 at A4=440; >A0 ignored; sub-0.15 s blips ignored per D-021; a4 sensitivity documented, no crash |
| Geometry | `computePeaks` spb 0 / 0.5; pyramid on 100 samples; **zoom on a zero-duration viewport** | RangeError on bad spb; pyramid fine; **FINDING B-2: NaN viewport (Low, self-heals)** |

## Misuse / abuse flows (reasoned + e2e-covered)
- **`?test=1` exposure:** hook installs only with the param, is read-only, and exposes no audio
  data beyond labels/state; bench requires `?bench=1` additionally (D-025/D-026). Off-mode pages
  carry no hook (verified in `main.ts` gating; e2e T-020 relies on the hook only with the param).
- **Exports with zero notes / unpitched-only stems:** MIDI export filters `kind !== 'unpitched'`;
  tab exports filter to guitar/bass kinds; both produce empty-but-valid outputs (unit tests T-005/T-006/T-007 + probe).
- **Grid edits mid-session:** invalid input restores previous values and marks `aria-invalid`
  (frozen T-023 + probe of the same validateGrid path).
- **Dependency failure mode:** wasm fetch failure → DR-03 fallback chain wasm→webgl→cpu
  (`transcribe.ts initBackend`); TF kernel patch (C-009) applied only to the wasm backend. Browser
  binaries unavailable in this sandbox, so the fallback chain itself remains CI-verified (T-020/T-026
  green in run 36274302596) — recorded as environment-blocked here, not re-run (§1.5(6)).
- **Corrupt audio:** decode failure caught per-file; alert names the file; other stems unaffected
  (T-014/T-025 + `main.ts` try/catch).

## Confirmed breaks → disposition (Rule 4 severities)
| # | Break | Severity | Disposition |
|---|---|---|---|
| B-1 | `beatUnit=3` (off-contract) accepted by `validateGrid` | Low | recorded; spec-level fix extends D-014 — CR-4 |
| B-2 | `zoomAt` NaN viewport on empty app state | Low | recorded; self-heals on first load — CR-5 |
| B-7 | file named `.wav` passes the allow-list | Info | recorded — CR-8 |

No Critical/High break; **nothing blocks release**. Proposed new frozen tests (via Phase-2
machinery, not applied here): beatUnit rejection once D-014 is extended (B-1); duplicate-name
export regression test once CR-1's fix lands; octave-ghost fixture (R-031).

## Environment honesty
Browser-bound abuse flows (codec bombs inside the decoder, AudioContext exhaustion, CSP bypass
attempts in a real engine) cannot execute in this sandbox (no browser binaries — C-020/R-003).
They are covered by the frozen e2e security tests T-025/T-026/T-027, green in CI on three engines
plus two mobile emulations; this review does not present that coverage as re-run.
