# Mutation testing — S-MUTATE opt-out record (protocol §3.8)

**Decision:** `S-MUTATE` is omitted for this plan; opt-out recorded as **D-032** (also mirrored in
`plan/DECISIONS.md`), as the protocol permits ("If the plan omits S-MUTATE, plan/DECISIONS.md
records why as a D-###").

**Considered:** StrykerJS (current major for TS/Vitest) against the unit layer (`src/core/**`,
`src/io/validate.ts`), mutation-score target would have been set at freeze time.

**Why the opt-out satisfies §3.8's bar:**
1. The suite's main correctness gate is **not** the unit layer — it is the frozen accuracy matrix
   (T-013: real basic-pitch inference, F1 ≥ 0.95/0.80) plus the e2e matrix (T-020..T-030) on three
   engines. Mutation scores on pure functions (note math, grid lines, tab rendering) measure the
   least load-bearing layer.
2. The correctness-critical boundaries that mutation testing would meaningfully probe —
   `mergeLow`'s ghost suppression, the backend fallback chain — live in browser/TF.js territory
   where mutation tooling cannot run in this project's environments (no browser binaries in the
   sandbox; CI cost of a full Stryker run on tfjs is disproportionate to v0.1).
3. The two coverage gaps mutation testing would have flagged (CR-2/R-031 ghost rule; CR-1/R-030
   duplicate-name export) were found by the adversarial + code reviews and are tracked with
   concrete Phase-2 test proposals.

**Revisit when:** the unit layer becomes the correctness gate for a refactor (e.g. the proposed
module-worker move, R-029), or CI budget grows. At that point pre-decide tool (StrykerJS pinned),
scope (`src/core/**` + `src/io/validate.ts`), and score target (≥ 80 % on that scope), and run it
through the normal Phase-2 machinery.
