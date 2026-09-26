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

async function measureZoomFrames(zoomStep: (f: number) => void, steps = 60): Promise<number[]> {
  const deltas: number[] = [];
  let last = performance.now();
  for (let i = 0; i < steps; i++) {
    zoomStep(i % 2 === 0 ? 1.1 : 1 / 1.1);
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    const now = performance.now();
    deltas.push(now - last);
    last = now;
  }
  return deltas;
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
