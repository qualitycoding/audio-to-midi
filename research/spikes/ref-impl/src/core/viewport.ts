export interface Viewport { startSec: number; secPerPx: number; widthPx: number; durationSec: number; sampleRate: number; }
export function clampViewport(v: Viewport): Viewport { const spp = Math.min(Math.max(v.secPerPx, 1 / v.sampleRate), v.durationSec / v.widthPx);
  const vis = spp * v.widthPx; return { ...v, secPerPx: spp, startSec: Math.min(Math.max(0, v.startSec), Math.max(0, v.durationSec - vis)) }; }
export function secToPx(v: Viewport, s: number): number { return (s - v.startSec) / v.secPerPx; }
export function zoomAt(v: Viewport, f: number, a: number): Viewport { const px = secToPx(v, a); const c = clampViewport({ ...v, secPerPx: v.secPerPx / f });
  return clampViewport({ ...c, startSec: a - px * c.secPerPx }); }
