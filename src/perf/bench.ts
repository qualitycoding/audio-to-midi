import { validatePerfReport, type PerfReport } from './report';

export interface PerfLog {
  stemSeconds: number;
  decodeMs: number;
  analysisMs: number;
  backend: string;
}

export interface BenchDeps {
  log: () => PerfLog | null;
  zoomStep: (factor: number) => void;
  playStartLatencyMs: () => number | null;
}

declare const __APP_COMMIT__: string;

/**
 * Times the synchronous cost of one zoom step (viewport recompute + waveform/grid/note-lane
 * redraw) directly with performance.now(), rather than measuring the interval between
 * requestAnimationFrame callbacks. Headless Chromium (as used by the CI runners this bench also
 * runs under) has no real compositor and ticks rAF on a fixed simulated ~16.7ms cadence regardless
 * of actual work done, which would make every measurement read a near-constant ~16.7ms no matter
 * how cheap or expensive the render itself is — confirmed by two separate CI runs producing the
 * bit-for-bit identical value 16.69999999999709. Timing the call directly measures the thing
 * SC-13 actually cares about (how long the zoom operation's own work takes) and isn't coupled to
 * any particular browser's frame-pump behaviour.
 */
async function measureZoomFrames(zoomStep: (f: number) => void, steps = 60): Promise<number[]> {
  const durations: number[] = [];
  for (let i = 0; i < steps; i++) {
    const t0 = performance.now();
    zoomStep(i % 2 === 0 ? 1.1 : 1 / 1.1);
    durations.push(performance.now() - t0);
    // Yield to the event loop / paint between steps so this still resembles interactive use
    // rather than a tight synchronous loop.
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
  }
  return durations;
}

function percentile(sorted: number[], p: number): number {
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx];
}

export async function runBench(deviceLabel: string, deps: BenchDeps): Promise<PerfReport> {
  const l = deps.log();
  const frames = (await measureZoomFrames(deps.zoomStep)).sort((a, b) => a - b);
  const report: PerfReport = {
    schema: 'a2m-perf/1',
    appCommit: typeof __APP_COMMIT__ === 'string' ? __APP_COMMIT__ : 'unknown',
    userAgent: navigator.userAgent,
    device: deviceLabel,
    backend: l?.backend ?? 'unknown',
    hardwareConcurrency: navigator.hardwareConcurrency || 1,
    stemSeconds: l?.stemSeconds ?? 0,
    decodeMs: l?.decodeMs ?? 0,
    analysisMs: l?.analysisMs ?? 0,
    realtimeFactor: l && l.analysisMs > 0 ? l.stemSeconds / (l.analysisMs / 1000) : 0,
    zoomFrameMsMedian: percentile(frames, 50),
    zoomFrameMsP95: percentile(frames, 95),
    playStartLatencyMs: deps.playStartLatencyMs() ?? 0,
    timestampUtc: new Date().toISOString(),
  };
  return validatePerfReport(report);
}
