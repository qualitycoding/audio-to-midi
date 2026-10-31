# Mobile & desktop performance figures

Source: CI run https://github.com/qualitycoding/audio-to-midi/actions/runs/36274302596
(commit `b7b76f2`, GitHub-hosted `ubuntu-latest` runner). Retrieved via the Contents API from the
`ci-diag/perf-*` branches, since this sandbox cannot reach GitHub's Actions log/artifact storage
directly (Azure blob host not in its network allow-list) — see `.github/scripts/pw-diagnostics.mjs`.

| Metric | Desktop (unthrottled Chromium) | Mobile (Pixel 7 emulated, 4× CPU throttle) | Desktop budget (SC-13) |
|---|---|---|---|
| Stem length | 240 s | 240 s | — |
| Backend | wasm | wasm | — |
| Decode | 104 ms | 171 ms | — |
| Analysis | 41.9 s | 203.3 s | < 60 s (desktop only) |
| Realtime factor | 5.72× | 1.18× | — |
| Zoom frame, median | 2 ms | 11.1 ms | < 16 ms (desktop only) |
| Zoom frame, p95 | 3 ms | 12.9 ms | — |
| Play-start latency | 0 ms* | 0 ms* | < 100 ms (desktop only) |

\* **Caveat, disclosed per Rule 9:** `tests/e2e/perf.spec.ts` (frozen) never clicks the play button
before calling `bench()`, so `playStartLatencyMs` is always `player.lastStartLatencyMs ?? 0` — i.e.
this figure is not a real measurement in either row, just the harness's default. Real play-start
latency was exercised manually only via `npm run build && npm run preview` locally (not measured
numerically there). This is a gap in the frozen test's coverage, not something the implementer can
fix without editing a frozen file; flagged here rather than silently accepted as a passing number.

## Real-device figures (G-003)
Collected via the on-page bench panel (`?bench=1`, no devtools needed) at
https://qualitycoding.github.io/audio-to-midi/?test=1&bench=1, deployed commit `216ea2e`.

| Metric | Real Android phone (Chrome Mobile 153, 8 cores) |
|---|---|
| Stem length | 240 s |
| Backend | wasm |
| Decode | ~0 ms (synthetic in-memory stem, no file decode) |
| Analysis | 40.0 s |
| Realtime factor | 6.01× |
| Zoom frame, median | 3.4 ms |
| Zoom frame, p95 | 7 ms |
| Play-start latency | 0 ms* (see caveat above — bench never clicks play) |

Full validated report: `perf/results/real-android-2026-09-27T111013.json`. This is a real, if
unspecified, Android phone (user agent doesn't identify the model), running noticeably faster than
the emulated Pixel 7 CI figure above — plausibly a modern mid/high-end device with a faster wasm
JIT than the 4×-throttled CI runner. No real iOS/Safari figure collected yet.

## Cross-browser functional results (same CI run)
| Project | Result |
|---|---|
| chromium | 8/8 passed |
| firefox | 7/8 passed — see DEVIATIONS.md §4 (upstream headless Web Audio limitation, playwright#18206) |
| webkit | 8/8 passed |
| mobile-chromium (Pixel 7 emulated) | 8/8 passed |
| mobile-webkit (iPhone 15 emulated) | 8/8 passed |
