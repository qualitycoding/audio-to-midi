#!/usr/bin/env bash
# FROZEN — DO NOT MODIFY (see tests/FROZEN_MANIFEST.sha256)
# T-032 — SC-16 post-deploy smoke. Usage: tests/deploy/smoke.sh https://qualitycoding.github.io/audio-to-midi/
set -euo pipefail; U="${1:?base url with trailing slash}"
curl -fsS "$U" | grep -q '<title>audio-to-midi</title>'
curl -fsS "$U" | grep -q "Content-Security-Policy"
curl -fsS -o /dev/null "${U}models/basic-pitch/model.json"
curl -fsS -o /dev/null "${U}tfjs-wasm/tfjs-backend-wasm-simd.wasm"
echo "smoke OK: $U"
