export interface PerfReport { schema: 'a2m-perf/1'; appCommit: string; userAgent: string; device: string; backend: string; hardwareConcurrency: number; stemSeconds: number;
  decodeMs: number; analysisMs: number; realtimeFactor: number; zoomFrameMsMedian: number; zoomFrameMsP95: number; playStartLatencyMs: number; timestampUtc: string; }
const S = ['appCommit','userAgent','device','backend','timestampUtc'], N = ['hardwareConcurrency','stemSeconds','decodeMs','analysisMs','realtimeFactor','zoomFrameMsMedian','zoomFrameMsP95','playStartLatencyMs'];
export function validatePerfReport(x: any): PerfReport { if (!x || x.schema !== 'a2m-perf/1') throw new Error('invalid perf report: schema');
  for (const k of S) if (typeof x[k] !== 'string' || !x[k]) throw new Error('invalid perf report: ' + k);
  for (const k of N) if (typeof x[k] !== 'number' || !(x[k] >= 0)) throw new Error('invalid perf report: ' + k); return x; }
