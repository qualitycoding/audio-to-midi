# Assumption & Premise Audit — 2026-11-01 (protocol §4.7, retroactive)

Conducted by the addendum run (`addendum-20261101T033000Z-audio-to-midi`, D-035 single-agent tier
substitution) against the **delivered artifact** (v0.1.0, commit `e5e93df`) rather than pre-freeze.
Method per 4.7(2): restate premise → name falsifying evidence → check where checkable. Verdicts:
`confirmed` / `falsified` / `unverifiable`.

Scope: every `A-###` in `plan/ASSUMPTIONS.md` (A-001..A-022); premises behind load-bearing `D-###`;
`single-source` claims (C-015, C-021) and the `inferred` claim (C-025); premises frozen tests rely on.

## A-### verdicts

| ID | Premise (1 sentence) | Evidence checked | Verdict |
|---|---|---|---|
| A-001 | Fine-grained PAT enabled the planning push and was revoked afterwards | G-002 Q0 asked the human to confirm revocation; answer not recorded in GATE-G-002.md; no token anywhere in repo (grep) | **unverifiable** → R-027 (Low; mitigation: no secret in repo, confirmed by scan + Appendix C secret check) |
| A-002 | Target repo is `qualitycoding/audio-to-midi`, branch `main` | Repo exists, default `main`, app live at the Pages URL | confirmed |
| A-003 | README + Apache-2.0 LICENSE committed at planning time | Both present at repo root | confirmed |
| A-004 | Apache-2.0 for code; deps Apache/MIT/BSD/ISC | `npm run audit` + license check at planning; audit re-run 2026-11-01 exit 0 | confirmed |
| A-005 | basic-pitch for note events; pitchy (MPM) for Hz readout + sub-A0 | T-013 (F1 0.984 mono / 0.896 poly in CI), T-012, deployed app | confirmed |
| A-006 | Note lane + chord labels + playhead Hz/note/cents readout | T-001/T-002/T-011; e2e T-020 green (chromium/webkit/mobile) | confirmed |
| A-007 | Max fret 27 for every instrument | T-003, fret-27 case in musicxml test | confirmed |
| A-008 | Instrument/tuning set incl. 8-string guitar, 7-string bass, retunable | T-003; sub-A0 path T-012/T-020 | confirmed |
| A-009 | 12-TET, A4 default 440, adjustable 400–480 | T-001; D-025 `a4` input contract | confirmed |
| A-010 | Playback selection/gain semantics; none ticked ⇒ play all | T-022 (SC-17) green on 3 of 4 engines; firefox headless exception documented | confirmed |
| A-011 | Linked horizontal zoom ×2 … 1 sample/px + fit | T-010; T-021 green | confirmed |
| A-012 | BPM grid drives exports (MIDI tempo + tab bar lines) | T-008, T-005, midiExport tests | confirmed |
| A-013 | Mobile best-effort, figures recorded (not gated) incl. real-device at G-003 | perf/MOBILE.md: emulated Pixel 7 + real Android figures committed; Rule 14 permits informational-only here | confirmed |
| A-014 | Threat model: hostile files/filenames; no uploads; strict CSP | T-014/T-025/T-026/T-027 green in CI; adversarial re-probe A-007 | confirmed |
| A-015 | Desktop budgets: 240 s stem < 60 s; zoom < 16 ms; play start < 100 ms, measured on ubuntu-latest Chromium | CI: 41.9 s analysis, 2 ms median zoom — confirmed. **Play-start dimension: unverified** (harness never clicks play) | **falsified in part** → R-023 (carried; DEVIATIONS §6 disclosed it; addendum escalates to human decision) |
| A-016 | Held-out accuracy: mono F1 ≥ 0.95, poly F1 ≥ 0.80 | T-013 green in CI (0.984 / 0.896); accuracy suite re-run 2026-11-01: 3/3 | confirmed |
| A-017 | Input envelope: WAV/MP3/OGG/FLAC, ≤8 stems, ≤10 min, ≤300 MB, start-aligned | T-014/T-017; adversarial re-probe A-007 | confirmed |
| A-018 | Current desktop Chrome/Firefox/Safari supported | chromium/webkit green in CI; real Firefox unaffected by the headless-only clock limitation (documented upstream, playwright#18206) | confirmed (with disclosed CI caveat, DEVIATIONS §4) |
| A-019 | Stack: TS + Vite, Canvas 2D, workers, Vitest, Playwright | Repo matches, except workers → see D-023 premise below | confirmed in part |
| A-020 | Gates: G-002 before publish; G-003 for real-device figures | GATE-G-002.md committed; G-003 response evidenced in perf/results + perf/MOBILE.md; the GATE-G-003.md record itself absent from received main → A-044/R-028 | confirmed (record gap noted) |
| A-021 | Out-of-scope list | README v0.1 matches; no stem-separation etc. shipped | confirmed |
| A-022 | README discloses AI-assisted planning | README "Development" section states it | confirmed |

## Premises behind decisions

| Decision | Premise | Verdict |
|---|---|---|
| D-002 pins | All pinned versions exist and are compatible | **confirmed** by A-002 lookup (2026-11-01), all exist; note R-026 (upload-pages-artifact v3 superseded, works as pinned) |
| D-023 "in a Web Worker" | Analysis can run in a worker and be verified | **falsified in implementation**: worker bundle unverifiable in sandbox → main-thread substitution, disclosed as DEVIATIONS §1 with a real UX consequence (UI stall during analysis). Mitigation proposed there (move to module worker before next release). Carried as R-029 (Medium). |
| D-026 bench | `bench()` measures real play-start latency | **falsified in practice for that field** (frozen spec never clicks play) → R-023 |
| D-005 workflow delivery | Planning PAT lacks `workflow` scope → templates installed by S-001 | confirmed (workflows installed; S-001 later executed with implementer credentials) |
| D-030 memory budget | deviceMemory heuristic prevents OOM | T-017 green; adversarial re-probe A-007 | confirmed |
| D-024 security posture | CSP meta + textContent + same-origin only | T-026/T-027 green; smoke.sh asserts CSP header present on the live site | confirmed |

## Claims (single-source / inferred per 4.7 scope)

| Claim | Verdict | Evidence |
|---|---|---|
| C-015 (single-source): GitHub Pages cannot set custom headers → no COOP/COEP → no SharedArrayBuffer/wasm threads | **confirmed** still true (Pages custom headers unsupported as of 2026-11-01); the app runs non-threaded wasm successfully in production | live site + smoke OK |
| C-021 (single-source): Playwright WebKit is patched WebKit, not Safari; no real-Safari substitute | **confirmed**; no real iOS figure collected (perf/MOBILE.md states it) → residual uncertainty carried as R-004 (pre-existing) | perf/MOBILE.md |
| C-025 (inferred): synthetic-fixture accuracy may overstate real-recording accuracy | **unverifiable** within this project (no real-recording ground truth) → carried as R-005 (pre-existing, README disclosure) | — |

## Premises frozen tests silently rely on

| Premise | Verdict |
|---|---|
| `xmllint` + the local MusicXML XSD import bundle make T-006's XSD check hermetic (C-022) | confirmed in CI (green run recorded in GATE-G-002); environment-blocked in the addendum sandbox, CI equivalent named (not assumed a pass) |
| `sha256sum` availability for the freeze manifest (T-034) | confirmed (re-run 2026-11-01: OK) |
| Deterministic fixture synthesis (D-027) makes T-013 reproducible | confirmed (accuracy suite re-run 2026-11-01 passes) |

## Result

- **confirmed:** 20 of 22 A-### (+ all decision/claim premises except as noted)
- **falsified:** A-015 (play-start dimension only), D-023 worker premise, D-026 play-latency field
  — all three already disclosed in DEVIATIONS.md; the addendum converts them into tracked risks
  (R-023, R-029) with human-decision items rather than silent acceptance.
- **unverifiable:** A-001 (PAT revocation — human-side), C-025 (needs real-recording ground truth)
  → R-027 / R-005 with mitigations.
- New risks raised here: R-023 (High), R-027 (Low), R-028 (Low — gate record not committed), R-029 (Medium).
- No load-bearing falsified item requires re-planning (2E.4 scope): the falsified premises were
  executed around during implementation and their consequences are disclosed and tracked.

## v3.9 addendum assumption audit (2026-11-02)

| Assumption | Basis | Verdict |
|---|---|---|
| Audited baseline `v3.6` is accurate | Addendum gap audit at rollout | Accepted (verified by final consistency check) |
| Source-tip drift is the rollout's own addendum commit | Commit message + parent chain | Confirmed (D-901) |
| No local build/mutation execution available | Sandbox probe (git transport blocked; API-only writes) | Confirmed; CI substitution recorded (D-905) |
