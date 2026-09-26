# Cold-read gate (3.6) — same-context substitute (D-031)
## Pass 1 (dry-run as implementer; semantic)
Items found → plan amendments:
1. Where the browser loads model/wasm from → D-004 runtime URLs.
2. `public/` generated assets not ignored → .gitignore.
3. `labels` content in HookState undefined → D-025.
4. A4 control had no test id → D-025 `a4`.
5. `appCommit` source undefined → D-026 `__APP_COMMIT__`.
6. Rollback drill rc2 ambiguous → OPERATIONS.md.
7. workflow_dispatch before merge impossible → draft-PR trigger (S-001/S-002/S-015/S-016).
8. Perf spec loaded the 240 s file twice and lost the kind setting → spec fixed before freeze; default kind specified.
## Pass 2 (mechanical, `python3 research/spikes/check_plan.py`)
Result: NO PROBLEMS (IDs defined, SC↔T coverage, paths exist or are step outputs, no N/A artifact required, all step template fields present).
## Pass 3 (semantic re-read after amendments)
Zero new items.
