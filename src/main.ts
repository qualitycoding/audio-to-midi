import { validateSelection, validateDecoded, memoryBudgetBytes, fitsBudget, MAX_STEMS } from './io/validate';
import { decodeToMono } from './io/decode';
import { analyseStem } from './analysis/pipeline';
import { validateGrid, gridLines } from './core/beatGrid';
import { zoomAt, clampViewport } from './core/viewport';
import { TUNINGS, type TuningId } from './core/tunings';
import { freqToPitch } from './core/notes';
import { createWaveformRenderer, type WaveformRenderer } from './ui/waveform';
import { computeLabels, renderNoteLane, type LabelledEvent } from './ui/noteLane';
import { Player, type PlayerStem } from './audio/player';
import { exportMidi, exportAsciiTab, exportMusicXml } from './ui/export';
import { createInitialState, defaultTuning, defaultModeFor, type StemState } from './ui/state';
import { runBench, type PerfLog } from './perf/bench';
import type { StemKind, DetectionMode } from './core/types';

void validateDecoded; void MAX_STEMS; // exercised inside io/validate.ts and decode.ts

const BASE = import.meta.env.BASE_URL;
const params = new URLSearchParams(location.search);
const TEST_MODE = params.has('test');
const BENCH_MODE = params.has('bench');

const state = createInitialState();
const player = new Player();
const renderers = new Map<number, WaveformRenderer>();
let nextId = 0;
let lastPerfLog: PerfLog | null = null;

const $ = <T extends Element>(sel: string) => document.querySelector<T>(sel)!;
const fileInput = $<HTMLInputElement>('[data-testid="file-input"]');
const alertsEl = $<HTMLDivElement>('[data-testid="alerts"]');
const stemsEl = $<HTMLDivElement>('[data-testid="stems"]');
const playBtn = $<HTMLButtonElement>('[data-testid="play"]');
const stopBtn = $<HTMLButtonElement>('[data-testid="stop"]');
const zoomInBtn = $<HTMLButtonElement>('[data-testid="zoom-in"]');
const zoomOutBtn = $<HTMLButtonElement>('[data-testid="zoom-out"]');
const zoomFitBtn = $<HTMLButtonElement>('[data-testid="zoom-fit"]');
const a4Input = $<HTMLInputElement>('[data-testid="a4"]');
const bpmInput = $<HTMLInputElement>('[data-testid="bpm"]');
const offsetInput = $<HTMLInputElement>('[data-testid="grid-offset"]');
const beatsPerBarInput = $<HTMLInputElement>('[data-testid="beats-per-bar"]');
const beatUnitSelect = $<HTMLSelectElement>('[data-testid="beat-unit"]');

function showAlert(msg: string): void {
  const p = document.createElement('div'); p.textContent = msg; alertsEl.appendChild(p);
  setTimeout(() => p.remove(), 8000);
}

// ---- viewport -------------------------------------------------------------
function maxDurationSec(): number { return state.stems.reduce((m, s) => Math.max(m, s.durationSec), 0); }
function refitViewportBounds(): void {
  state.viewport.durationSec = maxDurationSec();
  state.viewport.sampleRate = state.stems[0]?.sampleRate ?? 44100;
  state.viewport = clampViewport(state.viewport);
}
function applyZoom(factor: number, anchorSec?: number): void {
  const a = anchorSec ?? state.viewport.startSec + (state.viewport.widthPx * state.viewport.secPerPx) / 2;
  state.viewport = zoomAt(state.viewport, factor, a);
  renderAll();
}
function zoomFit(): void {
  const dur = Math.max(0.001, maxDurationSec());
  state.viewport = clampViewport({ ...state.viewport, startSec: 0, secPerPx: dur / state.viewport.widthPx });
  renderAll();
}

// ---- rendering --------------------------------------------------------------
function renderAll(): void {
  for (const s of state.stems) {
    const r = renderers.get(s.id);
    if (r) r.render(state.viewport, state.grid);
    const lane = document.querySelector<HTMLElement>(`[data-stem-id="${s.id}"] .note-lane`);
    if (lane) renderNoteLane(lane, s.labelledEvents, state.viewport);
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function stemRowHtml(s: StemState): string {
  return `
    <div class="stem-header">
      <span class="stem-name">${escapeHtml(s.name)}</span>
      <label><input type="checkbox" data-testid="stem-select" ${s.selected ? 'checked' : ''} /> play</label>
      <label>gain <input type="range" data-testid="stem-gain" min="0" max="1.5" step="0.01" value="${s.gain}" /></label>
      <label>kind
        <select data-testid="stem-kind">
          <option value="guitar" ${s.kind === 'guitar' ? 'selected' : ''}>guitar</option>
          <option value="bass" ${s.kind === 'bass' ? 'selected' : ''}>bass</option>
          <option value="pitched" ${s.kind === 'pitched' ? 'selected' : ''}>pitched</option>
          <option value="unpitched" ${s.kind === 'unpitched' ? 'selected' : ''}>unpitched</option>
        </select>
      </label>
      <label>tuning
        <select data-testid="stem-tuning">
          <option value="guitar6" ${s.tuningId === 'guitar6' ? 'selected' : ''}>guitar6</option>
          <option value="guitar8" ${s.tuningId === 'guitar8' ? 'selected' : ''}>guitar8</option>
          <option value="bass4" ${s.tuningId === 'bass4' ? 'selected' : ''}>bass4</option>
          <option value="bass7" ${s.tuningId === 'bass7' ? 'selected' : ''}>bass7</option>
        </select>
      </label>
      <label>mode
        <select data-testid="stem-mode">
          <option value="mono" ${s.mode === 'mono' ? 'selected' : ''}>mono</option>
          <option value="poly" ${s.mode === 'poly' ? 'selected' : ''}>poly</option>
        </select>
      </label>
      <span class="readout" data-testid="readout"></span>
    </div>
    <canvas data-testid="waveform"></canvas>
    <div class="note-lane" data-testid="note-lane"></div>`;
}

function reflectSelects(wrap: HTMLElement, s: StemState): void {
  (wrap.querySelector('[data-testid="stem-tuning"]') as HTMLSelectElement).value = s.tuningId;
  (wrap.querySelector('[data-testid="stem-mode"]') as HTMLSelectElement).value = s.mode;
}

function addStemRow(s: StemState): void {
  const wrap = document.createElement('div');
  wrap.className = 'stem'; wrap.dataset.testid = 'stem'; wrap.dataset.stemId = String(s.id);
  wrap.innerHTML = stemRowHtml(s);
  stemsEl.appendChild(wrap);

  const canvas = wrap.querySelector<HTMLCanvasElement>('[data-testid="waveform"]')!;
  renderers.set(s.id, createWaveformRenderer(canvas, s.mono, s.sampleRate));

  wrap.querySelector<HTMLInputElement>('[data-testid="stem-select"]')!.addEventListener('change', (e) => {
    s.selected = (e.target as HTMLInputElement).checked;
  });
  wrap.querySelector<HTMLInputElement>('[data-testid="stem-gain"]')!.addEventListener('input', (e) => {
    s.gain = Number((e.target as HTMLInputElement).value);
  });
  wrap.querySelector<HTMLSelectElement>('[data-testid="stem-kind"]')!.addEventListener('change', (e) => {
    s.kind = (e.target as HTMLSelectElement).value as StemKind;
    const t = defaultTuning(s.kind); s.tuningId = t.id; s.tuning = t.tuning; s.mode = defaultModeFor(s.kind);
    reflectSelects(wrap, s);
    void triggerAnalysis(s);
  });
  wrap.querySelector<HTMLSelectElement>('[data-testid="stem-tuning"]')!.addEventListener('change', (e) => {
    const id = (e.target as HTMLSelectElement).value as TuningId;
    s.tuningId = id; s.tuning = TUNINGS[id];
    void triggerAnalysis(s);
  });
  wrap.querySelector<HTMLSelectElement>('[data-testid="stem-mode"]')!.addEventListener('change', (e) => {
    s.mode = (e.target as HTMLSelectElement).value as DetectionMode;
    void triggerAnalysis(s);
  });
  canvas.addEventListener('pointermove', (ev) => {
    const rect = canvas.getBoundingClientRect();
    const t = state.viewport.startSec + ((ev.clientX - rect.left) / rect.width) * (state.viewport.widthPx * state.viewport.secPerPx);
    const readout = wrap.querySelector<HTMLElement>('[data-testid="readout"]')!;
    const frame = s.pitchFrames.reduce<{ timeSec: number; hz: number } | null>((best, f) =>
      Math.abs(f.timeSec - t) < (best ? Math.abs(best.timeSec - t) : Infinity) ? f : best, null);
    if (frame && Math.abs(frame.timeSec - t) < 0.1) {
      const p = freqToPitch(frame.hz, state.a4Hz);
      readout.textContent = `${frame.hz.toFixed(1)} Hz  ${p.name}  ${p.cents >= 0 ? '+' : ''}${p.cents.toFixed(0)}c`;
    } else readout.textContent = '';
  });

  void triggerAnalysis(s);
}

async function triggerAnalysis(s: StemState & { decodeMs?: number }): Promise<void> {
  const token = ++s.analysisToken;
  if (s.kind === 'unpitched') { s.analysis = 'done'; s.notes = []; s.pitchFrames = []; s.labelledEvents = []; renderAll(); return; }
  s.analysis = 'running'; renderAll();
  const hasLowString = Math.min(...s.tuning) < 21;
  const t0 = performance.now();
  try {
    const result = await analyseStem(s.mono, s.sampleRate, s.mode, state.a4Hz, hasLowString, BASE, () => {});
    if (token !== s.analysisToken) return; // superseded by a later change
    s.notes = result.notes; s.pitchFrames = result.pitchFrames; s.labelledEvents = computeLabels(result.notes); s.analysis = 'done';
    state.backend = result.backend;
    lastPerfLog = { stemSeconds: s.durationSec, decodeMs: s.decodeMs ?? 0, analysisMs: performance.now() - t0, backend: result.backend };
  } catch (err) {
    if (token !== s.analysisToken) return;
    s.analysis = 'error';
    showAlert(`analysis failed for ${s.name}: ${(err as Error).message}`);
  }
  renderAll();
}

// ---- file loading -----------------------------------------------------------
fileInput.addEventListener('change', async () => {
  const files = Array.from(fileInput.files ?? []);
  const { accepted, rejected } = validateSelection(files, state.stems.length);
  for (const r of rejected) {
    const reason = { 'too-many': 'too many stems', 'bad-type': 'unsupported file type', 'too-large': 'file too large', empty: 'empty file' }[r.code];
    showAlert(`${r.name}: ${reason}`);
  }
  const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  let loadedBytes = state.stems.reduce((a, s) => a + s.mono.length * 4, 0);
  const budget = memoryBudgetBytes((navigator as unknown as { deviceMemory?: number }).deviceMemory);
  for (const f of accepted) {
    const t0 = performance.now();
    try {
      const buf = await (f as File).arrayBuffer();
      const decoded = await decodeToMono(ctx, buf);
      const newBytes = decoded.mono.length * 4;
      if (!fitsBudget(loadedBytes, newBytes, budget)) { showAlert(`${f.name}: not enough memory for this stem on this device`); continue; }
      loadedBytes += newBytes;
      const kind: StemKind = 'pitched';
      const t = defaultTuning(kind);
      const s: StemState & { decodeMs: number } = {
        id: nextId++, name: f.name, kind, tuningId: t.id, tuning: t.tuning, mode: defaultModeFor(kind),
        selected: true, gain: 1, sampleRate: decoded.sampleRate, mono: decoded.mono, durationSec: decoded.durationSec,
        analysis: 'pending', notes: [], pitchFrames: [], labelledEvents: [], analysisToken: 0,
        decodeMs: performance.now() - t0,
      };
      state.stems.push(s);
      addStemRow(s);
    } catch {
      showAlert(`${f.name}: corrupt or unsupported audio file`);
    }
  }
  refitViewportBounds();
  if (state.stems.length === 1) zoomFit(); else renderAll();
  fileInput.value = '';
});

// ---- transport --------------------------------------------------------------
function activeIndices(): number[] {
  return state.stems.map((s, i) => (s.selected ? i : -1)).filter((i) => i >= 0);
}
playBtn.addEventListener('click', async () => {
  const stems: PlayerStem[] = state.stems.map((s) => ({ mono: s.mono, sampleRate: s.sampleRate, gain: s.gain }));
  await player.play(stems, activeIndices(), player.currentTimeSec());
});
stopBtn.addEventListener('click', () => player.stop());
zoomInBtn.addEventListener('click', () => applyZoom(2));
zoomOutBtn.addEventListener('click', () => applyZoom(0.5));
zoomFitBtn.addEventListener('click', zoomFit);

// ---- grid controls -----------------------------------------------------------
function applyGridInput(): void {
  const candidate = {
    bpm: Number(bpmInput.value), offsetSec: Number(offsetInput.value),
    beatsPerBar: Number(beatsPerBarInput.value), beatUnit: Number(beatUnitSelect.value) as 2 | 4 | 8,
  };
  try {
    state.grid = validateGrid(candidate);
    bpmInput.removeAttribute('aria-invalid'); beatsPerBarInput.removeAttribute('aria-invalid');
  } catch {
    bpmInput.setAttribute('aria-invalid', 'true');
    bpmInput.value = String(state.grid.bpm); offsetInput.value = String(state.grid.offsetSec);
    beatsPerBarInput.value = String(state.grid.beatsPerBar); beatUnitSelect.value = String(state.grid.beatUnit);
  }
  renderAll();
}
for (const el of [bpmInput, offsetInput, beatsPerBarInput]) {
  el.addEventListener('change', applyGridInput);
  el.addEventListener('keydown', (e) => { if (e.key === 'Enter') applyGridInput(); });
}
beatUnitSelect.addEventListener('change', applyGridInput);
a4Input.addEventListener('change', () => { state.a4Hz = Number(a4Input.value); });
bpmInput.setAttribute('min', '20'); bpmInput.setAttribute('max', '400');

// ---- exports ------------------------------------------------------------------
$('[data-testid="export-midi"]').addEventListener('click', () => exportMidi(state.stems, state.grid));
$('[data-testid="export-tab-txt"]').addEventListener('click', () => exportAsciiTab(state.stems, state.grid));
$('[data-testid="export-musicxml"]').addEventListener('click', () => exportMusicXml(state.stems, state.grid));

renderAll();

// ---- test hook (D-025) ---------------------------------------------------------
if (TEST_MODE) {
  (window as unknown as { __a2m: unknown }).__a2m = {
    state: () => ({
      backend: state.backend,
      viewport: { startSec: state.viewport.startSec, secPerPx: state.viewport.secPerPx, widthPx: state.viewport.widthPx },
      grid: { bpm: state.grid.bpm, offsetSec: state.grid.offsetSec, beatsPerBar: state.grid.beatsPerBar, beatUnit: state.grid.beatUnit },
      gridLinesVisible: gridLines(state.grid, state.viewport.startSec, state.viewport.startSec + state.viewport.widthPx * state.viewport.secPerPx).length,
      stems: state.stems.map((s) => ({
        name: s.name, selected: s.selected, kind: s.kind, analysis: s.analysis,
        notes: s.notes.length, labels: s.labelledEvents.map((l) => l.label),
      })),
      player: {
        playing: player.playing,
        activeStemIndices: player.playing ? (activeIndices().length ? activeIndices() : state.stems.map((_, i) => i)) : [],
        currentTimeSec: player.currentTimeSec(), startLatencyMs: player.lastStartLatencyMs,
      },
    }),
    ...(BENCH_MODE ? {
      bench: (deviceLabel: string) => runBench(deviceLabel, {
        log: () => lastPerfLog,
        zoomStep: (f: number) => applyZoom(f),
        playStartLatencyMs: () => player.lastStartLatencyMs,
      }),
    } : {}),
  };
}
