---
id: L-20261101T042200Z-portal-mount-no-symlinks-or-exec-bits
title: The /mnt/agents portal mount forbids symlinks and exec bits — stage node/git work in /tmp
status: active
supersedes: []
recurrence_of: null
occurrences: 2
severity: Medium
tags: [tech:git, tech:npm, kind:environment, phase:implementation]
recorded_by: implementer
run: addendum-20261101T033000Z-audio-to-midi
recorded_at: 2026-11-01T04:22:00Z
---
## Trigger
Running `npm ci` or git index operations with the repo on the durable fuse portal mount
(`/mnt/agents`).
## What went wrong
Two distinct failures: (1) `npm ci` fails — `node_modules/.bin` symlinks return ENOTSUP on the
mount; (2) intermittent `git add -A` failures writing `.git/index.lock` ("operation not supported"
class errors under load).
## Correction
Dependency installs and test runs execute in a `/tmp` staging copy (`npm ci --bin-links=false`);
deliverables are written back to the mount; git adds use a retry loop; scripts run via an
interpreter, never exec bits.
## Prevention rule
Treat only the mount as durable, never as a build surface: stage builds in /tmp, copy artifacts
back, retry lock-file operations, chmod after every copy from the mount.
## Detection check
Build/test commands reference /tmp paths in the session log; deliverable diffs live on the mount.
## Evidence
EXECUTION_LOG.md; A-001 environment probe (class: ephemeral).
