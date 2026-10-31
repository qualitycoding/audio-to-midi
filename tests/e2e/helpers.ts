// FROZEN — DO NOT MODIFY (see tests/FROZEN_MANIFEST.sha256)
import { expect, type Page } from '@playwright/test';
export const AUDIO = 'tests/fixtures/audio/';
/** Test hook contract D-025: window.__a2m exists only when the URL has ?test=1. */
export interface HookState {
  backend: string; viewport: { startSec: number; secPerPx: number; widthPx: number };
  grid: { bpm: number; offsetSec: number; beatsPerBar: number; beatUnit: number }; gridLinesVisible: number;
  stems: { name: string; selected: boolean; kind: string; analysis: 'pending' | 'running' | 'done' | 'error'; notes: number; labels: string[] }[];
  player: { playing: boolean; activeStemIndices: number[]; currentTimeSec: number; startLatencyMs: number | null };
}
export const state = (p: Page) => p.evaluate(() => (window as any).__a2m.state() as HookState);
export async function load(p: Page, files: string[]) {
  await p.goto('./?test=1'); await p.getByTestId('file-input').setInputFiles(files.map((f) => AUDIO + f));
  await expect(p.getByTestId('stem')).toHaveCount(files.length);
}
export async function waitAnalysed(p: Page, timeout = 170_000) {
  await expect.poll(async () => (await state(p)).stems.every((s) => s.analysis === 'done' || s.kind === 'unpitched'), { timeout }).toBe(true);
}
export async function canvasInk(p: Page, index: number) {
  return p.getByTestId('stem').nth(index).getByTestId('waveform').evaluate((c: HTMLCanvasElement) => {
    const d = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data; let ink = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) ink++; return ink / (c.width * c.height); });
}
