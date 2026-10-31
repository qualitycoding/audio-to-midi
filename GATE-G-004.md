# G-004 — Lessons & knowledge push (protocol G-003 semantic; numbered G-004 here per D-033)

**Trigger:** end of the addendum implementation (S-KNOW retroactive, protocol §3.7.2).
**Proposed target:** `qualitycoding/knowledge` (protocol default, A-043; the default-name
correction of 2026-10-27 is respected — not `agent-knowledge`).

## Request
Push this run's lessons and knowledge items to the knowledge store, in the Appendix C layout
(`lessons/<primary-tag>/L-*.md`, `knowledge/<subject>/K-*.md`, regenerated `INDEX.md` files,
`TAXONOMY.md` extended with any new tags).

## Items awaiting push
**Lessons (9)** — `lessons/`:
| ID | Title | Severity | Primary tags |
|---|---|---|---|
| L-20261101T041500Z | Verify worker bundle before freezing architecture | Medium | tech:web-workers |
| L-20261101T041600Z | Vitest/tsc pass on bundler-only errors | Medium | tech:vite |
| L-20261101T041700Z | Headless Firefox Web Audio clock | Medium | tech:playwright |
| L-20261101T041800Z | Perf harness must exercise what it reports | High | tech:playwright |
| L-20261101T041900Z | Log every substitution in the commit it happens | Medium | tech:npm |
| L-20261101T042000Z | Commit gate records with the response | Medium | tech:github |
| L-20261101T042100Z | git transport flaky → codeload tarball | Low | tech:github |
| L-20261101T042200Z | Portal mount: no symlinks/exec bits | Medium | tech:git |
| L-20261101T042300Z | Probe knowledge store, don't adopt defaults | Low | phase:intake |

**Knowledge items (25)** — `knowledge/`, mechanically generated from `research/claims.json`
(derived_from C-001..C-025), each carrying at least one `subject:` tag; full list in the directory
and in `.checkpoints/state.json` `knowledge_added`.

## Allowed responses
`push-to-proposed` → copy into `qualitycoding/knowledge` per Appendix C, regenerate indexes,
push. · `push-to: <target>` → same to the named store. · `do-not-push` → items stay on this
branch only.

## Human response
`push-to-proposed` — supplied by the human with a one-time fine-grained PAT at 2026-11-01
("and push"). Executed same session.

## Executed 2026-11-01T05:05Z
- **Pushed the addendum branch** `addendum-20261101T033000Z-protocol-v3.6` to
  `qualitycoding/audio-to-midi` (local `master` HEAD `0aef1f9`, 9 commits); `main` (deployed
  v0.1.0) untouched. Verified by `git ls-remote` against local HEAD. Earlier GnuTLS/TLS
  flakiness to github.com did not recur on the authenticated push (L-20261101T042100Z two-strike
  rule noted).
- **Store discovery at push time (amendment, DEVIATIONS §10):** the store layout was probed
  before copying. `qualitycoding/knowledge@main` already holds a curated 2026-10-09 set from
  this same project (`run: chat-20260926-audio-to-midi`), and its README and scripts show the
  current layout: **lessons live in the companion repository `qualitycoding/Lessons`**
  (`lessons/<facet>-<value>/`, colon→hyphen, `general/` if no tech:/domain: tag), not in
  `qualitycoding/knowledge`. The plan's single-target assumption (A-043) is amended accordingly.
- **Lessons → `qualitycoding/Lessons` (commit `a01b608`, 264 indexed):** 9 lessons filed under
  domain-audio (2), tech-vite, tech-playwright, tech-nodejs, tech-github (2), tech-git,
  general. Four filed as recurrences of 2026-10-09 lessons with `recurrence_of` set
  (L-…41600Z→L-20261009T150101Z, L-…41700Z→L-20261009T150501Z, L-…41800Z→L-20261009T151801Z,
  L-…42300Z→L-20261022T120000Z, occurrences 3) rather than duplicated. Two new tags added to
  the store taxonomy in the same commit: `tech:web-workers`, `tech:firefox`.
- **Knowledge → `qualitycoding/knowledge` (commit `89da6c7`, 398 indexed):** deduplicated
  against the existing curated set — **7 of the 25 generated items pushed**, 18 dropped as
  already-curated duplicates (same facts, e.g. pitch range/thresholds/package, MPM tracking,
  MusicXML numbering/tab/XSD, Pages COOP/COEP, Safari decode, tonal/tonejs, tfjs wasm/webgl
  bugs, playwright CDP/WebKit, synthetic-fixture bias, vite-vitest peers). The 7: evaluateModel
  API, model files, Node-Buffer limitation, npm-audit clean pins, Playwright mobile device
  descriptors, TF.js cpu-backend realtime factor (existing perf item covers the patched-wasm
  backend only), 12-TET formula. Three new subjects added to `TAXONOMY.md` in the same commit;
  `tech:tensorflow-js` remapped to the store's `tech:tfjs`.
- **Verification:** `check_knowledge_schema.py` exit 0 (all entries valid, secret scan clean)
  and `build_index.py` re-run in both stores before committing; both pushes confirmed by
  `ls-remote` (`a01b608…`, `89da6c7…`).
- **Residual:** the 18 dropped items remain in this branch's `knowledge/` as generated evidence
  (Rule 12: not edited away); they were not pushed because the store already carries the same
  facts. R-023 (play-start latency) remains the open human decision.
