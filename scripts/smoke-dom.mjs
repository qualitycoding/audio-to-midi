// Non-frozen ad hoc smoke check (not part of the Playwright/Vitest suites): exercises main.ts's DOM
// wiring under jsdom, since this sandbox cannot download real browser binaries for Playwright.
// This is NOT a substitute for T-020..T-030; it only catches gross wiring bugs before handoff.
import { JSDOM } from 'jsdom';

const html = await (await fetch('http://localhost:4173/audio-to-midi/')).text();
const dom = new JSDOM(html, {
  url: 'http://localhost:4173/audio-to-midi/?test=1',
  runScripts: 'dangerously',
  resources: 'usable',
  pretendToBeVisual: true,
});
const { window } = dom;

// jsdom has no Web Audio / Canvas 2D / fetch-of-local-files; stub the minimum main.ts touches at load time
// and on the interactions we drive below, so we're checking DOM wiring, not audio/graphics correctness.
window.HTMLCanvasElement.prototype.getContext = () => ({
  clearRect() {}, fillRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {},
  getImageData: (x, y, w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
});
class FakeAudioContext {
  constructor() { this.currentTime = 0; this.destination = {}; this.state = 'running'; }
  decodeAudioData(_data, resolve) { resolve({ duration: 1, numberOfChannels: 1, sampleRate: 44100, getChannelData: () => new Float32Array(44100).fill(0.01) }); }
  createBuffer(_c, len, sr) { const chans = [new Float32Array(len)]; return { copyToChannel: (d) => chans[0].set(d), length: len, sampleRate: sr }; }
  createBufferSource() { return { connect() { return this; }, start() {}, stop() {}, buffer: null }; }
  createGain() { return { connect() { return this; }, gain: { value: 1 } }; }
  resume() { return Promise.resolve(); }
}
window.AudioContext = FakeAudioContext;
window.OfflineAudioContext = class { constructor() {} createBuffer(c, len) { return { copyToChannel() {} }; } createBufferSource() { return { connect() { return this; }, start() {} }; } get destination() { return {}; } startRendering() { return Promise.resolve({ getChannelData: () => new Float32Array(22050) }); } };
window.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 0);
class FakeFile { constructor(name, bytes) { this.name = name; this._bytes = bytes; } async arrayBuffer() { return this._bytes.buffer; } }

await new Promise((r) => dom.window.document.addEventListener('DOMContentLoaded', r, { once: true }));
await new Promise((r) => setTimeout(r, 300)); // let the module script's top-level run complete

const doc = window.document;
const assert = (cond, msg) => { if (!cond) throw new Error('SMOKE FAIL: ' + msg); console.log('ok:', msg); };

assert(typeof window.__a2m?.state === 'function', 'test hook installed under ?test=1');
let s = window.__a2m.state();
assert(s.stems.length === 0, 'starts with no stems');
assert(s.grid.bpm === 120, 'default grid bpm 120');

// Simulate loading one file via the file input's change handler.
const fileInput = doc.querySelector('[data-testid="file-input"]');
Object.defineProperty(fileInput, 'files', { value: [new FakeFile('guitar8.wav', new Uint8Array(1000))], configurable: true });
fileInput.dispatchEvent(new window.Event('change'));
await new Promise((r) => setTimeout(r, 500));

s = window.__a2m.state();
assert(s.stems.length === 1, 'one stem row created after file load');
assert(s.stems[0].name === 'guitar8.wav', 'stem name reflects file name');
assert(doc.querySelectorAll('[data-testid="stem"]').length === 1, 'one .stem row in the DOM');
assert(doc.querySelector('[data-testid="waveform"]') !== null, 'waveform canvas present');

// bpm control: invalid value marks aria-invalid and does not change state.grid.bpm
const bpm = doc.querySelector('[data-testid="bpm"]');
bpm.value = '9999'; bpm.dispatchEvent(new window.Event('change'));
s = window.__a2m.state();
assert(s.grid.bpm === 120, 'invalid bpm rejected, previous value kept');
assert(bpm.getAttribute('aria-invalid') === 'true', 'invalid bpm marks aria-invalid');
bpm.value = '90'; bpm.dispatchEvent(new window.Event('change'));
s = window.__a2m.state();
assert(s.grid.bpm === 90, 'valid bpm applied');
assert(bpm.getAttribute('aria-invalid') === null, 'aria-invalid cleared once valid');

// zoom
const before = window.__a2m.state().viewport.secPerPx;
doc.querySelector('[data-testid="zoom-in"]').dispatchEvent(new window.Event('click'));
const after = window.__a2m.state().viewport.secPerPx;
assert(Math.abs(after - before / 2) < 1e-9, 'zoom-in halves secPerPx');

// kind change to unpitched -> analysis done, 0 notes, no crash
doc.querySelector('[data-testid="stem-kind"]').value = 'unpitched';
doc.querySelector('[data-testid="stem-kind"]').dispatchEvent(new window.Event('change'));
await new Promise((r) => setTimeout(r, 50));
s = window.__a2m.state();
assert(s.stems[0].kind === 'unpitched' && s.stems[0].notes === 0 && s.stems[0].analysis === 'done', 'unpitched stem skips analysis');

console.log('\nSMOKE OK — all checks passed');
