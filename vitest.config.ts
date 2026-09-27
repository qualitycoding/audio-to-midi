// FROZEN — DO NOT MODIFY (see tests/FROZEN_MANIFEST.sha256)
import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { projects: [
  { test: { name: 'unit', include: ['tests/unit/**/*.test.ts'], environment: 'node', testTimeout: 20000 } },
  { test: { name: 'accuracy', include: ['tests/accuracy/**/*.test.ts'], environment: 'node', testTimeout: 300000 } },
] } });
