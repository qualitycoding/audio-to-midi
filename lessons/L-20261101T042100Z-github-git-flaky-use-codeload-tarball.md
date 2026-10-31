---
id: L-20261101T042100Z-github-git-flaky-use-codeload-tarball
title: When git transport to github.com fails twice, fall back to the codeload tarball
status: active
supersedes: []
recurrence_of: null
occurrences: 1
severity: Low
tags: [tech:github, tech:git, phase:research, kind:environment]
recorded_by: implementer
run: addendum-20261101T033000Z-audio-to-midi
recorded_at: 2026-11-01T04:21:00Z
---
## Trigger
A sandboxed agent clones or ls-remotes github.com and the TLS connection dies mid-handshake or
under GnuTLS recv errors, while codeload.github.com and the web API stay reachable.
## What went wrong
Two git clone attempts burned ~4 minutes before the tarball fallback succeeded. Read-only review
work does not need git transport at all.
## Correction
Used `https://codeload.github.com/<owner>/<repo>/tar.gz/HEAD` for the import; recorded push as
unavailable (A-042) and planned the bundle fallback.
## Prevention rule
On the second git-transport failure to github.com, switch to the codeload tarball for reads and
record push as environment-blocked with a bundle fallback — do not keep retrying git.
## Detection check
Session notes name the working channel; no more than two git-transport attempts appear in the log.
## Evidence
EXECUTION_LOG.md; A-042.
