// S-008 (D-004): copy basic-pitch model and tfjs-wasm binaries into public/ so they're served same-origin.
import { cpSync, mkdirSync, existsSync, readdirSync, copyFileSync } from 'node:fs';
mkdirSync('public/models/basic-pitch', { recursive: true });
if (!existsSync('node_modules/@spotify/basic-pitch/model')) { console.error('missing basic-pitch model'); process.exit(1); }
cpSync('node_modules/@spotify/basic-pitch/model', 'public/models/basic-pitch', { recursive: true });
mkdirSync('public/tfjs-wasm', { recursive: true });
const wasmDir = 'node_modules/@tensorflow/tfjs-backend-wasm/dist';
for (const f of readdirSync(wasmDir)) if (f.endsWith('.wasm')) copyFileSync(`${wasmDir}/${f}`, `public/tfjs-wasm/${f}`);
console.log('assets copied');
