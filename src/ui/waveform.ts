import { buildPyramid, type Peaks } from '../core/peaks';
import type { Viewport } from '../core/viewport';
import { gridLines, type GridLine } from '../core/beatGrid';
import type { BeatGrid } from '../core/types';

export interface WaveformRenderer {
  canvas: HTMLCanvasElement;
  render(viewport: Viewport, grid: BeatGrid): void;
}

/** Picks the coarsest pyramid level whose bin covers <= 2 px of screen time, so we never average away visible detail. */
function pickLevel(pyramid: Peaks[], secPerPx: number, sampleRate: number): Peaks {
  const maxSamplesPerBin = Math.max(1, secPerPx * sampleRate * 2);
  let best = pyramid[0];
  for (const p of pyramid) { if (p.samplesPerBin <= maxSamplesPerBin) best = p; }
  return best;
}

export function createWaveformRenderer(canvas: HTMLCanvasElement, samples: Float32Array, sampleRate: number): WaveformRenderer {
  const pyramid = buildPyramid(samples, 16);
  const ctx = canvas.getContext('2d')!;

  function render(viewport: Viewport, grid: BeatGrid): void {
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth || viewport.widthPx;
    const cssH = canvas.clientHeight || 90;
    if (canvas.width !== Math.round(cssW * dpr) || canvas.height !== Math.round(cssH * dpr)) {
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
    }
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const mid = H / 2;

    const peaks = pickLevel(pyramid, viewport.secPerPx, sampleRate);
    const samplesPerPx = viewport.secPerPx * sampleRate;
    const binsPerPx = samplesPerPx / peaks.samplesPerBin;

    ctx.fillStyle = '#7fd1c1';
    for (let px = 0; px < W; px++) {
      const t = viewport.startSec + (px / dpr) * viewport.secPerPx;
      const sampleIdx = t * sampleRate;
      const binIdx = Math.floor(sampleIdx / peaks.samplesPerBin);
      let lo = Infinity, hi = -Infinity, any = false;
      const b0 = Math.max(0, Math.floor(binIdx));
      const b1 = Math.min(peaks.min.length, Math.ceil(binIdx + Math.max(1, binsPerPx)));
      for (let b = b0; b < b1; b++) { any = true; if (peaks.min[b] < lo) lo = peaks.min[b]; if (peaks.max[b] > hi) hi = peaks.max[b]; }
      if (!any) continue;
      const y0 = mid - hi * mid, y1 = mid - lo * mid;
      ctx.fillRect(px * dpr, Math.min(y0, y1), dpr, Math.max(1, Math.abs(y1 - y0)));
    }

    const visible: GridLine[] = gridLines(grid, viewport.startSec, viewport.startSec + viewport.widthPx * viewport.secPerPx);
    for (const g of visible) {
      const px = ((g.timeSec - viewport.startSec) / viewport.secPerPx) * dpr;
      ctx.strokeStyle = g.isBar ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.2)';
      ctx.lineWidth = g.isBar ? 2 : 1;
      ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, H); ctx.stroke();
    }
  }

  return { canvas, render };
}
