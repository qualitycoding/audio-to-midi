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

## State of this record
This sandbox cannot reach github.com and holds no credential (A-042), so the push itself cannot
execute here. Per protocol §3.7.2(3)/§5.3 fallback, the lessons and knowledge travel in
`audio-to-midi-addendum-20261101T033000Z-audio-to-midi.bundle` (A-011), which contains every
commit of this run; a maintainer answering this gate can push from any clone. **The gate is
therefore recorded as awaiting human response, not answered.**
