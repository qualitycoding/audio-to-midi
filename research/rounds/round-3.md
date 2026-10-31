# Round 3 — Adversarial (R5) + empirical follow-up
Attempted disproofs:
- "tfjs 3.21 works everywhere": wasm backend **fails** on the model (C-009) → patch found and verified for parity and speed; cpu too slow (C-024).
- "Playwright can verify mobile in the sandbox": **false** — browser download blocked (C-020) → R-003; E2E red-verification moved to S-002 in CI.
- "WebKit emulation = iOS Safari": false (C-021) → G-003 real-device capture.
- "Presets generalise": only shown on synthetic timbres → C-025 inferred → R-005 (user-adjustable mode per stem mitigates).
- Deprecations/licences: tfjs 3.x is one major behind (4.22.0 latest) — accepted due to basic-pitch peer range; audit clean (C-013) → R-007.
Reference-implementation check: throwaway implementations (`research/spikes/ref-impl/`) pass all 83 unit tests and 3 accuracy tests, proving the frozen tests are satisfiable.
Saturation: this round produced no new load-bearing claims beyond C-024/C-025 and no unresolved contradictions → research stops (3 rounds).
