import { NotImplementedError } from '../core/errors';
/** D-026 performance report schema written by the ?bench=1 harness and by Playwright perf projects. */
export interface PerfReport {
  schema: 'a2m-perf/1'; appCommit: string; userAgent: string; device: string; backend: string;
  hardwareConcurrency: number; stemSeconds: number;
  decodeMs: number; analysisMs: number; realtimeFactor: number;
  zoomFrameMsMedian: number; zoomFrameMsP95: number; playStartLatencyMs: number; timestampUtc: string;
}
export function validatePerfReport(x: unknown): PerfReport { throw new NotImplementedError('validatePerfReport'); }
