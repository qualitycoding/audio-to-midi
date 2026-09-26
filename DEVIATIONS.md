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

## 4. `basic-pitch`'s named ESM exports, not its default export
`transcribe.ts` originally imported `pkg` as a CJS default export (works under ts-node/Vitest's
transform). Vite's production bundler rejected this (`@spotify/basic-pitch` has no default export).
Fixed to `import { BasicPitch, ... } from '@spotify/basic-pitch'`. Behaviourally identical; caught by
`npm run build`, not by the frozen tests (they run under Vitest, not the Vite app bundler). No test
was touched.
