# Pre-mortem round 1 (reviewer: same agent, see D-031 — no fresh-context subagents available)
## Incident report — 6 months after release
"audio-to-midi went viral on a guitar forum. Mobile users loading full albums as stems saw the tab crash (out of memory). A contributor's PR 'fixed' a failing T-028 by switching to a lighter model. Firefox users reported silent playback. Someone found the repo's admin token in an old chat export."
## Findings by lens
| Risk | Lens | Severity | Mitigation added |
|---|---|---|---|
| R-010 decoded stems exhaust memory on phones | scale/performance | High | D-030 budget + T-017 (unfreeze→add→red-verify→refreeze done) |
| R-016 planning PAT exposed in chat transcript | security | Critical | G-002 question 0 requires revocation confirmation; A-001; no token in repo (verified `git grep`) |
| R-003 E2E tests never executed in planning sandbox; may be invalid | implementer misinterpretation / technical | High | S-002 red baseline with failure classification; DR-10 |
| R-006 CI runner lacks GPU; analysis slower than estimate | performance | Medium | wasm measured 7.7× RT (≈31 s est.); DR-05 |
| R-007 tfjs 3.x ageing | supply chain | Medium | exact pins, weekly audit, DR-08 |
| R-013 iOS/WebKit AudioContext autoplay | operational | Medium | S-011 resume in click handler; T-022 on mobile-webkit |
| R-014 FLAC/OGG decode gaps on Safari | technical | Medium | DR-07 alert + README |
| R-018 workflow_dispatch unavailable until workflow on default branch | operational | High | S-001/S-002/S-015 switched to draft-PR `pull_request` trigger |
Round result: 1 Critical, 3 High → mitigated; re-ran cold-read (see premortem/round-2.md header).
