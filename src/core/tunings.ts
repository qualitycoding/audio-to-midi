import type { Tuning } from './types';
/** D-013 — STUB. Step S-003 fills the values frozen in tests/unit/tunings.test.ts (T-003). */
export const MAX_FRET: number = 0;
export const TUNINGS: { guitar6: Tuning; guitar8: Tuning; bass4: Tuning; bass7: Tuning } = { guitar6: [], guitar8: [], bass4: [], bass7: [] };
export type TuningId = keyof typeof TUNINGS;
