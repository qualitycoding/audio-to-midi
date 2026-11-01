# Prior knowledge — R0 record (protocol §R0, written retroactively by the addendum)

**Planning date of the base plan:** 2026-09-26. **Knowledge store:** `qualitycoding/knowledge`
(protocol default per A-043). **Store status at planning time:** the store **did not exist** — the
lessons/knowledge machinery (protocol v3.2) was first published 2026-10-04, eight days after this
plan froze. **R0 therefore loaded nothing**, and no lessons existed to apply.

This file exists so future runs can distinguish "no lessons were loaded" from "lessons were
ignored" (lesson L-20261101T042300Z), and so the prevention-rule checklist below is compiled per
R0(3) for the phases this plan went through.

## Prevention-rule checklist that R0 *would* have applied (had entries existed)

Compiled from the lessons recorded *by this project* (lessons/L-*.md) — future audio/web runs
should read these in severity order per R0:

- [x] L-…041800Z (High) — every reported perf metric must have an exercising action in the harness.
- [x] L-…041500Z (Medium) — verify browser-only bundles (workers/wasm) in a real browser before freezing.
- [x] L-…041600Z (Medium) — CI must build the production bundle on every PR.
- [x] L-…041700Z (Medium) — engine-specific headless CI limitations: document, never fake around.
- [x] L-…041900Z (Medium) — log every substitution in the commit that makes it.
- [x] L-…042000Z (Medium) — commit GATE records with the response.
- [x] L-…042200Z (Medium) — durable mount ≠ build surface (symlinks/exec bits).
- [x] L-…042100Z (Low) — github.com git transport flaky: codeload tarball fallback.
- [x] L-…042300Z (Low) — probe the knowledge store at intake; never adopt defaults silently.

## Knowledge items reused in R0
None (store postdated the plan). The 25 K-items now in `knowledge/` were generated from this
project's claims.json by the addendum (A-010) and are the seed of what future R0 passes for
`domain:audio` / `tech:tensorflow-js` / `tech:playwright` tasks will load.

## Store access check (0.3.7, addendum run)
`qualitycoding/knowledge` could not be read from the addendum sandbox (github.com transport
blocked; A-042). Recorded in `.checkpoints/state.json` `knowledge_store.readable = false` — per
0.3.7 this is a note, not a blocker. The push gate for these items is **G-004** (GATE-G-004.md);
the bundle fallback carries them if the gate is not answered from this environment.

## R0 prior-knowledge load — v3.9 addendum (2026-11-02)

Loaded from the knowledge store topics relevant to this amendment: planning
protocol v3.9 change record, mutation-in-CI pricing practice, split
lesson/knowledge store semantics, ephemeral-environment durable-mount
discipline. No repository product knowledge is altered by this amendment.
