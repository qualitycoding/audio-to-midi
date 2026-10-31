# Operations (software.deploys = true)
Static site on GitHub Pages; no servers, no data retention (all processing client-side).
## Deploy (only after G-002 `proceed`)
`gh workflow run deploy.yml --ref main -f ref=<commit-or-tag>` → reviewer approves the `github-pages` environment → workflow builds, uploads, deploys, then runs `tests/deploy/smoke.sh https://qualitycoding.github.io/audio-to-midi/`.
## Monitoring
No telemetry by design (A-014). Monitoring = (1) the post-deploy smoke in `deploy.yml`; (2) scheduled weekly `ci.yml` run (cron `0 6 * * 1`) that runs `smoke.sh` against production and `npm run audit`; failures open a GitHub issue via `gh issue create` in the workflow (alerting channel = GitHub notifications to the repo owner).
## Rollback
1. Redeploy last good: `gh workflow run deploy.yml --ref main -f ref=<last-good-tag>`; verify with `tests/deploy/smoke.sh`.
2. Emergency takedown: `gh api -X DELETE repos/qualitycoding/audio-to-midi/pages` (disables Pages; re-enable in S-001 settings).
## Rollback drill (T-033)
Part of S-017, immediately after the first approved deploy: tag the deployed commit `v0.1.0-rc1`; tag the same commit `v0.1.0-rc2` and deploy it; roll back by deploying `v0.1.0-rc1`; run `smoke.sh` after each. Record run IDs in `OPERATIONS-LOG.md`.
## On-call / escalation
Single maintainer (repo owner). Implementer halts and writes `BLOCKED.md` on any failed deploy/smoke (DR-09).
## Maintenance
Monthly: `npm outdated`; dependency bumps go through PR with full CI. tfjs stays on 3.21.x until basic-pitch supports 4.x (R-007).
