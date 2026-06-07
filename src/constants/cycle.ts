import { CyclePhase, CycleSymptom, CycleMood, FlowLevel } from '@/types';

// ─── Phase Palette ────────────────────────────────────────────────────────────

export const PHASE_META: Record<CyclePhase, {
  label:       string;
  emoji:       string;
  color:       string;
  glow:        string;
  description: string;
  tip:         string;
}> = {
  menstrual: {
    label:       'Menstrual Phase',
    emoji:       '🌑',
    color:       '#F87171',
    glow:        'rgba(248,113,113,0.35)',
    description: 'Your body is shedding the uterine lining. Rest, stay hydrated, and be gentle with yourself.',
    tip:         'Iron-rich foods like spinach and lentils can help replenish what you lose.',
  },
  follicular: {
    label:       'Follicular Phase',
    emoji:       '🌒',
    color:       '#FB923C',
    glow:        'rgba(251,146,60,0.35)',
    description: 'Estrogen is rising, energy returning. Great time for new goals and creative work.',
    tip:         'Take advantage of high energy — try something new or plan challenging workouts.',
  },
  ovulation: {
    label:       'Ovulation Phase',
    emoji:       '🌕',
    color:       '#A78BFA',
    glow:        'rgba(167,139,250,0.40)',
    description: 'Peak fertility window. You may feel most confident and social right now.',
    tip:         'Your body temperature rises slightly. This is your highest energy point in the cycle.',
  },
  luteal: {
    label:       'Luteal Phase',
    emoji:       '🌗',
    color:       '#FBBF24',
    glow:        'rgba(251,191,36,0.35)',
    description: 'Progesterone rises then falls. You may notice PMS symptoms in the second half.',
    tip:         'Magnesium-rich foods like dark chocolate and nuts can ease PMS symptoms.',
  },
};

// ─── Flow Level ───────────────────────────────────────────────────────────────

export const FLOW_META: Record<FlowLevel, { label: string; color: string; drops: number }> = {
  spotting: { label: 'Spotting',  color: '#FDA4AF', drops: 1 },
  light:    { label: 'Light',     color: '#F87171', drops: 2 },
  medium:   { label: 'Medium',    color: '#EF4444', drops: 3 },
  heavy:    { label: 'Heavy',     color: '#B91C1C', drops: 4 },
};

export const FLOW_LEVELS: FlowLevel[] = ['spotting', 'light', 'medium', 'heavy'];

// ─── Moods ───────────────────────────────────────────────────────────────────

export const MOOD_META: Record<CycleMood, { label: string; emoji: string; color: string }> = {
  great: { label: 'Great',  emoji: '😄', color: '#34D399' },
  good:  { label: 'Good',   emoji: '🙂', color: '#60A5FA' },
  ok:    { label: 'Okay',   emoji: '😐', color: '#A78BFA' },
  low:   { label: 'Low',    emoji: '😔', color: '#FBBF24' },
  bad:   { label: 'Bad',    emoji: '😢', color: '#F87171' },
};

export const MOODS: CycleMood[] = ['great', 'good', 'ok', 'low', 'bad'];

// ─── Symptoms ─────────────────────────────────────────────────────────────────

export const SYMPTOM_META: Record<CycleSymptom, { label: string; icon: string }> = {
  cramps:             { label: 'Cramps',             icon: 'flash' },
  headache:           { label: 'Headache',           icon: 'medkit' },
  bloating:           { label: 'Bloating',           icon: 'body' },
  mood_swings:        { label: 'Mood Swings',        icon: 'happy' },
  fatigue:            { label: 'Fatigue',            icon: 'battery-half' },
  breast_tenderness:  { label: 'Breast Tenderness',  icon: 'heart' },
  acne:               { label: 'Acne',               icon: 'sparkles' },
  nausea:             { label: 'Nausea',             icon: 'sad' },
  back_pain:          { label: 'Back Pain',          icon: 'walk' },
  insomnia:           { label: 'Insomnia',           icon: 'moon' },
  irritability:       { label: 'Irritability',       icon: 'thunderstorm' },
  energy_high:        { label: 'High Energy',        icon: 'sunny' },
};

export const SYMPTOMS: CycleSymptom[] = Object.keys(SYMPTOM_META) as CycleSymptom[];

// ─── Cycle Math ───────────────────────────────────────────────────────────────

/** Days since lastPeriodStart, 1-indexed. Returns null if no start date set. */
export function getDayOfCycle(lastPeriodStart: string | null, today = getTodayStr()): number | null {
  if (!lastPeriodStart) return null;
  const start = new Date(lastPeriodStart);
  const now   = new Date(today);
  const diff  = Math.floor((now.getTime() - start.getTime()) / 86_400_000);
  return diff + 1;
}

export function getCurrentPhase(
  dayOfCycle: number,
  periodLength: number,
  cycleLength: number,
): CyclePhase {
  if (dayOfCycle <= periodLength) return 'menstrual';
  const ovulationDay = cycleLength - 14;
  if (dayOfCycle >= ovulationDay - 1 && dayOfCycle <= ovulationDay + 1) return 'ovulation';
  if (dayOfCycle < ovulationDay - 1) return 'follicular';
  return 'luteal';
}

export function getNextPeriodDate(lastPeriodStart: string, cycleLength: number): string {
  const d = new Date(lastPeriodStart);
  d.setDate(d.getDate() + cycleLength);
  return dateToStr(d);
}

export function getOvulationDate(lastPeriodStart: string, cycleLength: number): string {
  const d = new Date(lastPeriodStart);
  d.setDate(d.getDate() + (cycleLength - 14));
  return dateToStr(d);
}

export function getFertileWindow(ovulationDate: string): { start: string; end: string } {
  const ov  = new Date(ovulationDate);
  const start = new Date(ov); start.setDate(ov.getDate() - 5);
  const end   = new Date(ov); end.setDate(ov.getDate() + 1);
  return { start: dateToStr(start), end: dateToStr(end) };
}

/** Returns how many days until targetDate from today. Negative = in the past. */
export function daysUntil(targetDate: string, today = getTodayStr()): number {
  const t = new Date(targetDate);
  const n = new Date(today);
  return Math.round((t.getTime() - n.getTime()) / 86_400_000);
}

export function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function dateToStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Enumerate all dates in a month YYYY-MM */
export function getDatesInMonth(year: number, month: number): string[] {
  const days: string[] = [];
  const d = new Date(year, month, 1);
  while (d.getMonth() === month) {
    days.push(dateToStr(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

/** Which phase a given date falls in relative to a cycle anchor. */
export function getPhaseForDate(
  date: string,
  lastPeriodStart: string,
  periodLength: number,
  cycleLength: number,
): CyclePhase | null {
  const dayOfCycle = getDayOfCycle(lastPeriodStart, date);
  if (!dayOfCycle || dayOfCycle < 1) return null;
  const normalised = ((dayOfCycle - 1) % cycleLength) + 1;
  return getCurrentPhase(normalised, periodLength, cycleLength);
}
