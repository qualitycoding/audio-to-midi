# Deviations from the plan (implementation session, following DR-11)

## 1. Analysis runs on the main thread, not in a Web Worker (D-023 said "Web Workers")
**What:** `src/analysis/pipeline.ts` is called directly from `main.ts`; there is no `src/worker/analyse.ts`.
**Why:** No frozen test requires a literal worker — D-025's contract and every T-### assert on
observable state (`analysis: 'running'|'done'`, note counts, labels), not on thread architecture.
Building a correct Vite worker bundle for TF.js + basic-pitch could not be verified in this
sandbox (no browser to load it in), so shipping an unverified worker seemed riskier than a
verified main-thread path with the same public behaviour.
**Consequence:** during analysis (up to ~60 s for a 4-minute stem per the desktop budget) the UI
thread is busy; zoom/scroll may stall while a stem is analysing. This is a real regression against
the intent of D-023 (SC-13 measures zoom smoothness only via the bench harness, not concurrently
with analysis, so no frozen test currently catches it).
**Recommendation:** before G-002, move `analyseStem` into a module worker and re-run T-020/T-028 in
CI to confirm the UI stays responsive during analysis. Left as an open item rather than guessed at,
per DR-11 (touches performance, which is gated).

## 2. Browser-level verification (T-020..T-030) not run in this session
**Cause:** confirmed in planning (C-020, R-003) and unchanged here: this sandbox cannot download
Playwright's browser binaries. What *was* verified here:
- `npx tsc --noEmit` clean across the whole app (src + tests).
- `npm run build` succeeds; the built bundle serves correctly under `vite preview` (confirmed with
  `curl` against `/`, `/models/basic-pitch/model.json`, `/tfjs-wasm/*.wasm`, and the JS bundle — all
  200).
- All 91 frozen unit + accuracy tests pass unchanged (`npm test`, `npm run test:accuracy`).
- `npm run verify:freeze` and `npm run audit` both clean.
- A jsdom-based ad hoc DOM smoke test was attempted and abandoned: jsdom does not execute
  `<script type="module">`, so it cannot exercise this app's entry point. No working substitute for
  a real browser was found in this sandbox; this is not a new finding (R-003 already covers it).
**What remains:** run S-002 (red baseline classification) then the full CI matrix in
`.github/workflows/ci.yml` on real GitHub Actions runners, which do have Playwright browsers. Until
that runs, T-020 through T-030 are implemented but **unverified**.

## 3. S-001's GitHub-specific actions not performed (no credential in this session)
The workflow files exist at `plan/workflows/{ci,deploy}.yml` but have not been installed to
`.github/workflows/`, no draft PR was opened, and no `github-pages` environment/reviewer was
configured, because implementing this step requires push credentials this session does not hold
(the planning PAT was deliberately deleted from the sandbox after the planning push, per the
person's security guidance). This is step S-001 exactly as specified in the plan — not a deviation
from it — just not yet executed.

## 4. Firefox headless has no working Web Audio clock on the GitHub-hosted Linux CI runner (T-022, T-025)
**Symptom:** on the `firefox` e2e project only, `player.playing` initially never became true (fixed —
`AudioContext.resume()` was hanging; see the fix commit), and after that fix, `currentTimeSec()`
never advances past 0 within 5s even though `playing` is true and scheduling succeeded.
**Cause:** this is a documented upstream limitation, not an app bug: headless Firefox in the
official Playwright Linux/Docker images has a broken Web Audio API (microsoft/playwright#18206,
open since 2022, Linux/docker-specific). `ctx.currentTime` simply does not advance because the
audio render thread isn't actually running. Chromium and WebKit e2e projects pass T-022 and T-025
with the identical app code and identical test, which is strong evidence this is engine/platform,
not application logic.
**What I did:** the `AudioContext.resume()` race (Player.play) is a real, worthwhile fix — it stops
Firefox from hanging the transport indefinitely — and is kept regardless. I did not attempt to work
around the deeper "clock doesn't tick" limitation (e.g. by faking `currentTimeSec()` from a
`setInterval` instead of reading `ctx.currentTime`, which would make the app lie about playback
position on every browser to paper over one browser's headless CI quirk) and did not skip or soften
T-022/T-025 for the firefox project, since that would be altering a frozen test's effective
coverage. Per DR-11, this stays open rather than being silently worked around: **T-022 and T-025 on
the `firefox` e2e project are expected to stay red in this CI environment** until either (a)
Playwright/Firefox fixes the upstream issue, or (b) someone decides to run Firefox e2e headed under
Xvfb instead of headless (an infrastructure change to `.github/workflows/ci.yml`, out of scope for
this pass), or (c) a human reviewing this explicitly accepts it as a known gap for real Safari/
Firefox users (who are not headless and are not affected).

## 5. `basic-pitch`'s named ESM exports, not its default export
`transcribe.ts` originally imported `pkg` as a CJS default export (works under ts-node/Vitest's
transform). Vite's production bundler rejected this (`@spotify/basic-pitch` has no default export).
Fixed to `import { BasicPitch, ... } from '@spotify/basic-pitch'`. Behaviourally identical; caught by
`npm run build`, not by the frozen tests (they run under Vitest, not the Vite app bundler). No test
was touched.

## 6. `playStartLatencyMs` in the frozen perf harness is always 0 (evidence caveat)
`tests/e2e/perf.spec.ts` (frozen) calls `window.__a2m.bench()` without ever clicking `play`, so
`Player.lastStartLatencyMs` is always `null` and `bench()`'s `?? 0` fallback reports `0` regardless
of real playback-start latency. Both the desktop and mobile PerfReport JSONs in `perf/results/`
therefore have a `playStartLatencyMs` of 0 that is not a real measurement. I did not touch the
frozen spec to fix this — noted in `perf/MOBILE.md` as a disclosed gap (Rule 9) for the plan owner
to decide whether to accept, or unfreeze/extend `perf.spec.ts` to actually exercise `play` before
calling `bench()`.


## 7. `prod-smoke` job could not fail (workflow substitution, addendum D-034)
**What:** `ci.yml`'s scheduled `prod-smoke` step ran `smoke.sh … || gh issue create …`, so a failed
smoke still left the job green — a check that cannot fail, forbidden by protocol Rule 14 (v3.5).
**Fix (addendum A-003, scoped amendment per 2E.4):** the step now creates the issue **and**
`exit 1`s, applied identically to `.github/workflows/ci.yml` and its template
`plan/workflows/ci.yml` (verified identical by diff). R-019's alert intent is preserved.
**Frozen files touched:** none (workflows are not in `tests/FROZEN_MANIFEST.sha256`).
**Consequence:** a failing scheduled smoke now opens an issue *and* shows red in the Actions list.

## 8. `jsdom` devDependency + `scripts/smoke-dom.mjs` added without a deviation entry (addendum A-004)
**What:** during implementation the ad-hoc jsdom DOM-smoke probe was attempted and abandoned
(§2) — but its dependency (`jsdom ^27.4.0`, the repo's only caret pin) and its script
(`scripts/smoke-dom.mjs`) stayed in the tree, and the substitution was never logged here.
**Why it matters:** Rule 14 (v3.5) treats every substitution as a deviation logged when made;
3.7.1-Q1a caught this by diffing `package.json` against D-002/ENVIRONMENT.md.
**Disposition:** dead code + unaudited devDependency; removal proposed in
`reviews/CODE_REVIEW.md` (A-006), carried as accepted-with-follow-up risk R-025 — not silently
deleted in this pass because removal is a scope decision for the maintainer.


## 9. CI `unit` job now builds the production bundle (workflow substitution, addendum D-036)
**What:** `npm run build` added to the `unit` job in `.github/workflows/ci.yml` (+ template
`plan/workflows/ci.yml`, diff-identical). **Why:** lesson L-20261101T041600Z — the basic-pitch
ESM-default-export breakage (§5) was only caught because the implementer happened to run the
production build; Vitest and `tsc` both pass on that error class. **Consequence:** PR CI takes a
bit longer; bundler-only regressions now fail PRs. Logged per Rule 14 (substitutions are
deviations). No frozen file touched.


## 10. G-004 executed as a two-store push with dedupe, not the plan's single-store copy (gate response `push-to-proposed`, 2026-11-01)
**What:** the plan (A-043, GATE-G-004.md "Request") assumed one target — `qualitycoding/knowledge`
— and a straight copy of all 9 lessons + 25 knowledge items. At execution the store was probed
first: `qualitycoding/knowledge` already holds a curated 2026-10-09 set from this same project,
its README/scripts define the split layout (lessons in companion repo `qualitycoding/Lessons`,
folders `<facet>-<value>` with colon→hyphen), and 18 of the 25 generated K-items restate facts
already curated there.
**What was actually done:** lessons (9) pushed to `qualitycoding/Lessons` @ `a01b608` — four
filed as `recurrence_of` links to existing lessons instead of new duplicates; knowledge pushed
to `qualitycoding/knowledge` @ `89da6c7` — 7 new items only, 18 generated items withheld as
duplicates of the curated set; three new subjects + two new tech tags added to the store
taxonomies in the same commits; `tech:tensorflow-js`/`tech:npm` remapped to the stores'
existing `tech:tfjs`/`tech:nodejs`.
**Why it matters:** Rule 12 (never edit away) is satisfied — the 25 generated items stay in this
branch's `knowledge/` as evidence — while the shared stores are not polluted with restatements
the earlier run already curated. The plan's single-target assumption is corrected for any
future run.
**Disposition:** recorded in GATE-G-004.md "Executed"; residual human decisions unchanged
(R-023; R-025 dead-code removal).


## 11. Frozen `tests/e2e/perf.spec.ts` amended by human approval (R-023 option (b), D-037, 2026-11-01)
**What:** the human approved the unfreeze-and-extend: `TEST_CHALLENGE.md` written (DR-10); the
frozen perf spec now clicks play, polls `state().player.startLatencyMs` until non-null, stops,
and only then benches — so `playStartLatencyMs` is measured, not the `?? 0` fallback. Desktop
gains `expect(r.playStartLatencyMs).toBeGreaterThan(0)` before the existing `< 100` SC-13 gate.
**Why it matters:** without this, every PerfReport ever recorded (desktop, mobile, real device)
carried `playStartLatencyMs: 0` and the SC-13 budget had no evidence (base-run DEVIATIONS §6;
lesson L-20261009T151801Z).
**Scope discipline:** no threshold changed; zoom measurement kept comparable (playback stopped
before zoom bench); `helpers.ts` and all other frozen files untouched; manifest re-frozen in the
same commit (`tests/FROZEN_MANIFEST.sha256` entry replaced, all 26 entries verify).
**Verification:** tsc clean, `npm run build` clean, unit 87/88 (sole failure = T-006 XSD
subtest, xmllint absent in this sandbox — pre-existing environment block, CI installs
libxml2-utils), accuracy 3/3. The e2e perf run itself is environment-blocked here (no browser
binaries; A-002 finding) — first real measurement happens on CI, where the amended test gates
the merge. If a runner's `AudioContext.resume()` hangs, the player's 500 ms race bounds the
measurement (~550 ms) and the gate fails honestly instead of recording 0.
**Disposition:** R-023 closed; SC-13 now evidence-backed on every subsequent CI perf run.
