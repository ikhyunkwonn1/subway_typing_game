import L from './lines/L.json';
import one from './lines/one.json';
import W from './lines/W.json';
import type { LineData, LineId } from './types';

export const LINES: Record<LineId, LineData> = {
  'L': L as LineData,
  '1': one as LineData,
  'W': W as LineData,
} as const;

export const LINE_IDS: LineId[] = ['L', '1', 'W'] as const;
