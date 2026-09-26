import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { projects: [
  { test: { name: 'unit', include: ['tests/unit/**/*.test.ts'], environment: 'node', testTimeout: 20000 } },
  { test: { name: 'accuracy', include: ['tests/accuracy/**/*.test.ts'], environment: 'node', testTimeout: 300000 } },
] } });
