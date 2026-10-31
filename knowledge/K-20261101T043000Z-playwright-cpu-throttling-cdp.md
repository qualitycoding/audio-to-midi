---
id: K-20261101T043000Z-playwright-cpu-throttling-cdp
statement: "CPU throttling in Playwright is available only through a Chromium CDP session (Emulation.setCPUThrottlingRate, rate = slowdown factor)."
status: current
supersedes: []
tags: [domain:audio, tech:playwright, subject:playwright-cpu-throttling-cdp, phase:research]
applies_to_version: "@playwright/test 1.63.0"
source: { url: "https://chromedevtools.github.io/devtools-protocol/tot/Emulation/", doi: "", title: "CDP Emulation domain", locator: "setCPUThrottlingRate", accessed: "2026-09-26", tier: 1 }
confidence: corroborated
derived_from: [C-019]
discovered_by: planner
run: 20260926T113449Z-audio-to-midi
recorded_at: 2026-11-01T04:30:00Z
---
Claim register entry C-019 from the base plan's research (load-bearing: True).
Full source list and verification notes: research/claims.json and research/SOURCES.md.
Contradicted by: []. Informs: D-026, T-029.
