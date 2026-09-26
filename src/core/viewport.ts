import { NotImplementedError } from './errors';
/** Shared (linked) horizontal view for all stems. D-019 */
export interface Viewport { startSec: number; secPerPx: number; widthPx: number; durationSec: number; sampleRate: number; }
/** Zoom by `factor` (>1 zooms in) keeping `anchorSec` at the same pixel; clamps to [1 sample/px, whole track fits]. */
export function zoomAt(v: Viewport, factor: number, anchorSec: number): Viewport { throw new NotImplementedError('zoomAt'); }
export function clampViewport(v: Viewport): Viewport { throw new NotImplementedError('clampViewport'); }
export function secToPx(v: Viewport, sec: number): number { throw new NotImplementedError('secToPx'); }
