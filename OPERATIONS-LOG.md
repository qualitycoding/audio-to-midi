# Operations log

## Rollback drill (T-033, per OPERATIONS.md), 2026-09-27

All four deploys built and published commit `e5e93df` (the S-016 merge onto `main`); only the
tag/label changes between steps. Each step's smoke check (`tests/deploy/smoke.sh`) ran as part of
the `deploy` job and passed.

| Step | Tag | Run | Result |
|---|---|---|---|
| 1. Initial deploy | `v0.1.0-rc1` | [36316998944](https://github.com/qualitycoding/audio-to-midi/actions/runs/36316998944) | success, smoke OK |
| 2. Next deploy | `v0.1.0-rc2` | [36317177621](https://github.com/qualitycoding/audio-to-midi/actions/runs/36317177621) | success, smoke OK |
| 3. Rollback | `v0.1.0-rc1` (redeployed) | [36317256522](https://github.com/qualitycoding/audio-to-midi/actions/runs/36317256522) | success, smoke OK |
| 4. Release | `v0.1.0` | [36317333729](https://github.com/qualitycoding/audio-to-midi/actions/runs/36317333729) | success, smoke OK |

Drill conclusion: rollback (redeploying an earlier tag via `deploy.yml`'s `ref` input) works as
documented in `OPERATIONS.md` — no manual intervention needed beyond dispatching the workflow with
the earlier tag.

Live site: https://qualitycoding.github.io/audio-to-midi/ — currently serving tag `v0.1.0`
(commit `e5e93df`).
