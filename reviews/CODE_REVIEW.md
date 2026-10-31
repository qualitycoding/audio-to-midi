# Code review — S-REVIEW (retroactive, protocol §3.8)

**Reviewer:** addendum run `addendum-20261101T033000Z-audio-to-midi` (single-agent tier substitution, D-035; the reviewer authored none of the code under review — it postdates it).
**Scope:** full delivered source `src/**` (1016 LOC), `scripts/**`, `.github/workflows/*`, `package.json`; frozen tests read-only (never weakened; no proposal here weakens one).
**Date:** 2026-11-01. Severity per Global Rule 4.

## Verdict
No Critical, no High findings. 2 Medium (both risk-accepted with proposed fixes and follow-up
entries), 5 Low, 3 informational. Security posture clean.

## Findings

### Medium
- **CR-1 — Duplicate stem names export the wrong notes.** `src/ui/export.ts`: `frettedStems()`
  maps stems to `{name, tuning}` and both `exportAsciiTab` and `exportMusicXml` then resolve the
  source stem with `stems.find((s) => s.name === p.name)!.notes`. Loading two files with the same
  name (allowed — `validateSelection` does not dedupe) makes **both** exported parts use the first
  matching stem's notes. Trace: `export.ts:36-48`. Proposed fix (not applied — export behaviour
  change deferred to maintainer): carry the `StemState` through `frettedStems` instead of
  re-finding by name. → **R-030** (Medium, accepted-with-follow-up).
- **CR-2 — The sub-A0 octave-ghost suppression rule has no committed test.** `src/analysis/pipeline.ts`
  `mergeLow()` drops a basic-pitch note 1–2 octaves above a sub-A0 note within 100 ms. Its only
  verification was `tests/unit/zz_diag3.test.ts` **during** implementation, which was never
  committed (absent from `tests/unit/`). The behaviour ships without regression protection beyond
  the general T-012 sub-A0 case, which does not exercise the ghost branch. Proposed: Phase-2
  machinery (unfreeze-free: a *new* test file, red-verify, re-freeze) adding a ghost-note fixture.
  → **R-031** (Medium, test-coverage).

### Low
- **CR-3 — Dead code / abandoned probe.** `scripts/smoke-dom.mjs` (the jsdom smoke DEVIATIONS §2
  calls "attempted and abandoned") remains in the tree, and `jsdom ^27.4.0` remains the only
  caret-pinned, no-CI-consumer devDependency. Logged as DEVIATIONS §8; removal follow-up → **R-025**.
- **CR-4 — `validateGrid` accepts `beatUnit ∉ {2,4,8}`.** `src/core/beatGrid.ts` validates only
  bpm and beatsPerBar (matching D-014's documented RangeErrors); an off-contract beatUnit flows
  through `gridLines` without crashing (4/3 spacing). UI-constrained (select offers 2/4/8);
  console-only. Confirmed by adversarial probe B-1. Fix is a spec-level decision (extend D-014).
- **CR-5 — NaN viewport before any stem loads.** `zoomAt` on a zero-duration viewport yields
  `secPerPx=0, startSec=NaN` (probe B-2). Self-heals on first stem load (`refitViewportBounds` +
  `zoomFit`); only reachable by clicking zoom with an empty app; no user data involved.
- **CR-6 — Vestigial state.** `AppState.player` (`src/ui/state.ts`) is initialised but never
  updated or read; the real player state lives in the `Player` class. Dead weight, harmless.

### Informational
- **CR-7** — tfjs 3.21.0 is old by design (basic-pitch's peer range, D-002); age risk tracked as
  R-007 since planning. `actions/checkout`, `setup-node`, `upload-artifact` major tags are behind
  current majors (v6/v6/v7 observed 2026-11-01); `upload-pages-artifact@v3` superseded by v5 → **R-026**.
- **CR-8** — A file literally named `.wav` passes the extension allow-list (ext extraction returns
  the whole name). Must still decode as audio to do anything; no action.
- **CR-9** — `Player.play`'s `lastStartLatencyMs` measures scheduling delay (await until first
  sample is *due*), not audible start; compounded by the frozen-harness gap → **R-023**.

## Checks that came back clean
- **Security (D-024):** every user-controlled string reaches the DOM via `textContent` or
  `escapeHtml` (name in `stemRowHtml`); alerts use `textContent`; no `eval`/inline script; CSP meta
  present and asserted on the live site by `tests/deploy/smoke.sh`; no network calls except
  same-origin assets; `?test=1` hook is read-only and off by default; the one empty `catch`
  (`player.ts` `stop()`) is idempotence with a justifying comment, not a swallowed verification.
- **Secrets:** none in source, workflows, or scripts (also enforced by the Appendix C secret scan in A-011).
- **Dependencies:** `npm audit --omit=dev --audit-level=high` exit 0 (re-run 2026-11-01).
- **Anti-patterns:** no hidden mutation of frozen interfaces; module boundaries match D-010;
  duplicated complex logic not observed; naming consistent.

## Fixes applied in this pass
None to `src/**` (both Medium findings are risk-accepted with proposed fixes; the one code-affecting
change in this addendum is the CI workflow amendment D-034, recorded separately in DEVIATIONS §7).
