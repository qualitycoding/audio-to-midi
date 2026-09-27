import type { Tuning } from './types';
export const MAX_FRET: number = 27;
export const TUNINGS: { guitar6: Tuning; guitar8: Tuning; bass4: Tuning; bass7: Tuning } = {
  guitar6: [40, 45, 50, 55, 59, 64], guitar8: [30, 35, 40, 45, 50, 55, 59, 64], bass4: [28, 33, 38, 43], bass7: [18, 23, 28, 33, 38, 43, 48] };
export type TuningId = keyof typeof TUNINGS;
