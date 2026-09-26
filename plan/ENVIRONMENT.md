# Environment (verified in the planning sandbox 2026-09-26 unless marked CI-only)
| Tool | Version | Verified |
|---|---|---|
| Node.js | 22.22.2 (engines `>=22.12.0 <23`) | yes |
| npm | 10.9.7 | yes |
| git | 2.43.0 | yes |
| xmllint (libxml2-utils) | system | yes (`apt-get install -y libxml2-utils` on CI) |
| Packages | see package.json (exact pins) + package-lock.json | `npm ci` yes |
| Playwright browsers | bundled with @playwright/test 1.63.0 | **CI-only** (C-020) |

## Setup (literal)
```bash
git clone https://github.com/qualitycoding/audio-to-midi.git && cd audio-to-midi
git checkout gen-20260926T113449Z-audio-to-midi
npm ci
npm run verify:freeze          # sha256sum -c tests/FROZEN_MANIFEST.sha256
npm test                       # unit (red until implemented)
npm run test:accuracy          # accuracy (red until implemented)
npm run fixtures               # E2E audio fixtures
npx playwright install --with-deps chromium firefox webkit   # CI / dev machine only
npm run test:e2e
```
Verified here: `npm ci`, `npx tsc --noEmit`, `npm run build`, `npm test` (red, clean), `npm run fixtures`, `npm run verify:freeze`.
