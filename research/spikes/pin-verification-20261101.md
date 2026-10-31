# Pin & command verification — 2026-11-01 (protocol §1.3.6, retroactive)

Baseline plan pins: `plan/ENVIRONMENT.md` + `plan/DECISIONS.md` D-002. Every pin below was looked up
at planning-of-addendum time against its registry; results recorded per §1.3.6(1). Access date for
all lookups: **2026-11-01**. Verdict: **all pins exist**; two deprecation/outdated notes (see bottom).

## npm registry (registry.npmjs.org, HTTP 200)

| Package | Pinned | Exists | Newest on pinned major line |
|---|---|---|---|
| @spotify/basic-pitch | 1.0.1 | yes | 1.0.1 (only release line) |
| @tensorflow/tfjs | 3.21.0 | yes | 3.21.0 (3.x line) |
| @tensorflow/tfjs-backend-wasm | 3.21.0 | yes | 3.21.0 |
| @tonejs/midi | 2.0.28 | yes | 2.0.28 |
| pitchy | 4.1.0 | yes | 4.1.x line — newer minors may exist; pin exact per package-lock |
| tonal | 6.4.3 | yes | 6.4.x line |
| vite | 8.3.1 | yes | 8.3.1 at freeze; 8.x line active |
| vitest | 5.0.2 | yes | 5.0.x line |
| @playwright/test | 1.63.0 | yes | 1.63.x line |
| typescript | 5.9.3 | yes | 5.9.x line |
| @types/node | 22.20.4 | yes | 22.20.x line |
| jsdom (added in implementation, DEVIATIONS §8) | ^27.4.0 | yes (27.4.0 exists) | caret range — see note |

Exact resolution pins live in `package-lock.json` (committed); `npm ci` reproduces.

## Node.js

| Pin | Check | Result |
|---|---|---|
| 22.22.2 | `https://nodejs.org/dist/index.json` | exists (v22 LTS line) |

## GitHub Actions (major moving tags, per D-005/D-029)

| Action | Pinned | Tag exists | Newest release observed 2026-11-01 | Note |
|---|---|---|---|---|
| actions/checkout | v4 | yes | v7.0.1 (v4 line: v4.4.0) | v4 line maintained; upgrade candidate, not forced |
| actions/setup-node | v4 | yes | v6 line current | upgrade candidate |
| actions/upload-artifact | v4 | yes | v7 line current | upgrade candidate |
| actions/upload-pages-artifact | v3 | yes | **v5.0.0** | v3 pairs with deploy-pages@v4; deprecation risk → R-026 |
| actions/deploy-pages | v4 | yes | v4 line current (required pairing for upload-pages-artifact ≥v3) | OK |

## System tools

| Tool | Pin | Check | Result |
|---|---|---|---|
| xmllint (libxml2-utils) | system (CI installs via apt) | runnable in this sandbox? | **NO — environment-blocked**: no root in sandbox, apt lock unavailable. Not reported as a pass (§1.5(6)): the identical check runs in CI (ci.yml `unit` job installs libxml2-utils before `npm test`, where T-006's XSD subtest executes). T-006 was green in CI run 36274302596 (GATE-G-002 evidence). |

## Command verification (§1.3.6(2))

Literal setup commands in `plan/ENVIRONMENT.md` were executed in the original planning sandbox
(2026-09-26, per its "Verified" column) and re-executed here 2026-11-01 where possible:
`npm ci` (in a /tmp staging copy, --bin-links=false due to no-symlink mount), `tsc --noEmit` clean,
`npm test` unit 87/88 + accuracy 3/3 (see EXECUTION_LOG.md; xmllint subtest environment-blocked),
`sha256sum -c tests/FROZEN_MANIFEST.sha256` OK, `npm audit --omit=dev --audit-level=high` exit 0.
`npx playwright install` NOT re-run: browser binaries undownloadable here (C-020/R-003, unchanged);
CI equivalent named (ci.yml e2e/perf jobs). `tests/deploy/smoke.sh` requires the live URL — CI
equivalent named (deploy.yml post-deploy step; prod-smoke after D-034 amendment).

## Findings

1. All pins exist. No beta-only pin, no replaced-before-freeze action needed.
2. jsdom is caret-pinned (`^27.4.0`) while every other dependency is exact — inconsistent with the
   D-002 "exact pins" principle; recorded with the dead-code finding in reviews/CODE_REVIEW.md (A-006).
3. upload-pages-artifact@v3 superseded by v5 → R-026 (Medium, follow-up; deploy pipeline works as pinned).
