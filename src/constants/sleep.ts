import { SleepLog } from '@/types';

// ── Visual tokens ─────────────────────────────────────────────────────────────
export const SLEEP_STAGE_COLORS = {
  deep:  '#6366F1',
  rem:   '#A78BFA',
  light: '#38BDF8',
  awake: '#FB923C',
} as const;

export const SLEEP_GOAL_HOURS  = 8;
export const SLEEP_CYCLE_MIN   = 90;

// ── Derived colors ────────────────────────────────────────────────────────────
export function sleepScoreColor(score: number, lime: string): string {
  if (score >= 90) return lime;
  if (score >= 75) return '#38BDF8';
  if (score >= 60) return '#FBBF24';
  if (score >= 40) return '#FB923C';
  return '#F87171';
}

export function sleepScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Poor';
  return 'Very Poor';
}

// ── Duration helpers ──────────────────────────────────────────────────────────
export function computeTotalMin(bedtime: string, wakeTime: string): number {
  const [bh, bm] = bedtime.split(':').map(Number);
  const [wh, wm] = wakeTime.split(':').map(Number);
  const diff = (wh * 60 + wm) - (bh * 60 + bm);
  return diff > 0 ? diff : diff + 24 * 60;
}

export function formatDuration(totalMin: number): string {
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatTime12(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const period = h < 12 ? 'AM' : 'PM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
}

// ── Stage auto-estimation ─────────────────────────────────────────────────────
export function estimateStages(totalMin: number, wakeUps: number) {
  const awakeMin  = Math.max(0, wakeUps * 5 + Math.round(totalMin * 0.02));
  const effective = totalMin - awakeMin;
  const deepMin   = Math.round(effective * 0.20);
  const remMin    = Math.round(effective * 0.22);
  const lightMin  = effective - deepMin - remMin;
  const cycles    = parseFloat((totalMin / SLEEP_CYCLE_MIN).toFixed(1));
  return { deepMin, remMin, lightMin, awakeMin, cycles };
}

// ── Score computation ─────────────────────────────────────────────────────────
export function computeSleepScore({
  totalMin, deepMin, remMin, awakeMin, wakeUps,
}: Pick<SleepLog, 'totalMin' | 'deepMin' | 'remMin' | 'awakeMin' | 'wakeUps'>): number {
  const hrs = totalMin / 60;

  // Duration score 0–35: optimal 7–9 h
  let durScore = 35;
  if (hrs < 4)      durScore = Math.round(hrs / 4 * 15);
  else if (hrs < 6) durScore = Math.round(15 + (hrs - 4) / 2 * 15);
  else if (hrs < 7) durScore = Math.round(30 + (hrs - 6) * 5);
  else if (hrs > 10) durScore = Math.max(0, Math.round(35 - (hrs - 10) * 8));

  // Deep score 0–25: optimal ~20 %
  const deepPct  = totalMin > 0 ? deepMin / totalMin : 0;
  const deepScore = Math.round(Math.min(1, deepPct / 0.20) * 25);

  // REM score 0–20: optimal ~22 %
  const remPct   = totalMin > 0 ? remMin / totalMin : 0;
  const remScore  = Math.round(Math.min(1, remPct / 0.22) * 20);

  // Wake penalty 0–20: −4 per wakeup
  const wakeScore = Math.max(0, 20 - wakeUps * 4);

  return Math.min(100, durScore + deepScore + remScore + wakeScore);
}

// ── Hypnogram segment generator ───────────────────────────────────────────────
export interface HypnoSegment {
  type:     keyof typeof SLEEP_STAGE_COLORS;
  widthPct: number;
}

export function generateHypnoSegments(log: SleepLog): HypnoSegment[] {
  const numCycles = Math.max(1, Math.round(log.cycles));
  const segments: HypnoSegment[] = [];

  for (let c = 0; c < numCycles; c++) {
    const isFirstHalf = c < numCycles / 2;
    const pct = 100 / numCycles;

    const deepW  = isFirstHalf ? pct * 0.28 : pct * 0.08;
    const remW   = isFirstHalf ? pct * 0.12 : pct * 0.32;
    const wakeW  = c < numCycles - 1 ? pct * 0.05 : 0;
    const lightW = pct - deepW - remW - wakeW;

    segments.push({ type: 'light', widthPct: lightW * 0.45 });
    segments.push({ type: 'deep',  widthPct: deepW });
    segments.push({ type: 'light', widthPct: lightW * 0.55 });
    segments.push({ type: 'rem',   widthPct: remW });
    if (wakeW > 0) segments.push({ type: 'awake', widthPct: wakeW });
  }

  return segments;
}

// ── Timeline label helper ─────────────────────────────────────────────────────
export function hypnoTimeLabels(bedtime: string, totalMin: number, count = 4): string[] {
  const [bh, bm] = bedtime.split(':').map(Number);
  return Array.from({ length: count + 1 }, (_, i) => {
    const offsetMin = Math.round(i * totalMin / count);
    const total     = (bh * 60 + bm + offsetMin) % (24 * 60);
    const h = Math.floor(total / 60);
    const m = total % 60;
    const period = h < 12 ? 'AM' : 'PM';
    const disp   = h % 12 === 0 ? 12 : h % 12;
    return m === 0 ? `${disp}${period}` : `${disp}:${String(m).padStart(2,'0')}`;
  });
}
