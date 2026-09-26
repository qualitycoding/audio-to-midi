import { defineConfig } from 'vite';
// D-029: GitHub Pages project site served under /audio-to-midi/
export default defineConfig({ base: '/audio-to-midi/', build: { target: 'es2022', sourcemap: true }, worker: { format: 'es' } });
