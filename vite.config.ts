import { defineConfig } from 'vite';
import { execSync } from 'node:child_process';
// D-029: GitHub Pages project site served under /audio-to-midi/.
const commit = process.env.GITHUB_SHA?.slice(0, 7) ?? (() => { try { return execSync('git rev-parse --short HEAD').toString().trim(); } catch { return 'unknown'; } })();
export default defineConfig({
  base: '/audio-to-midi/',
  define: { __APP_COMMIT__: JSON.stringify(commit) },
  build: { target: 'es2022', sourcemap: true },
  worker: { format: 'es' },
});
