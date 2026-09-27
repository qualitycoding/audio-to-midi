# Human gates
## G-002 — Public release to GitHub Pages
- Trigger: end of S-016 (before the first `deploy.yml` run), and before every later deploy of a `v*` tag.
- Evidence bundle (`GATE-G-002.md`): CI run URL with all T-001..T-031 green; `perf/results/desktop-perf-*.json` and `mobile-perf-*.json`; `perf/MOBILE.md`; `npm run audit` output; screenshot of desktop + Pixel 7 run; `git rev-parse HEAD`; the exact deploy command; rollback command from OPERATIONS.md.
- Questions: (0) Confirm the planning PAT shown in the planning chat has been revoked (R-016). (1) Publish this commit to https://qualitycoding.github.io/audio-to-midi/? (2) Accept the recorded mobile figures?
- Allowed responses: `proceed` → S-017 deploy; `proceed-with-rescope: <text>` → implement rescope within frozen tests, rerun S-015, return to G-002; `stop` → halt, leave Pages disabled.
- Enforcement: `deploy.yml` uses `environment: github-pages` with the human as required reviewer (set in S-001).
## G-003 — Real-device mobile figures (A-013)
- Trigger: end of S-015.
- Evidence bundle (`GATE-G-003.md`): link to a preview build (`npm run build && npx vite preview --host` on LAN, or the CI artifact), instructions: open `…/?test=1&bench=1`, load `long240.wav`, press "Copy perf report", paste JSON.
- Questions: paste 1–3 PerfReport JSONs from real phones (any; at least one iOS or Android if available) or reply `none`.
- Allowed responses: `reports: <json…>` → implementer validates with `validatePerfReport`, commits to `perf/results/real-*.json`, updates `perf/MOBILE.md`; `none` → record "no real-device figures" in `perf/MOBILE.md`; `stop` → halt.
- G-001 is N/A (no `math`/`computational`).
