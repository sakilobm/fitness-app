// ─── Weight screen constants ──────────────────────────────────────────────────

export const WEIGHT_MILESTONES_KG = [90, 85, 80, 75] as const;

export const TIME_OF_DAY_LABELS = {
  morning:   '🌅 Morning',
  afternoon: '☀️ Afternoon',
  night:     '🌙 Night',
} as const;

export const TIME_OF_DAY_EMOJIS = {
  morning:   '🌅',
  afternoon: '☀️',
  night:     '🌙',
} as const;

export const TIME_OF_DAY_SHORT = {
  morning:   '🌅 Morn',
  afternoon: '☀️ Aft',
  night:     '🌙 Ngt',
} as const;

export const TIME_OF_DAY_COLORS = {
  morning:   'lime' as const,
  afternoon: 'amber' as const,
  night:     '#6366F1' as const,
};

/**
 * Estimate weeks-to-goal based on average weekly loss/gain pace.
 * Values in kg; converted if needed at the display layer.
 */
export const WEEKLY_KG_PACE = 0.7;
export const WEEKLY_LBS_PACE = 1.5;
export const MONTHLY_KG_PACE = 3.0;

export const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

export type WeightPeriod = 'today' | 'week' | 'month' | '3m';

export const PERIOD_LABELS: Record<WeightPeriod, string> = {
  today: 'Today',
  week:  'Week',
  month: 'Month',
  '3m':  '3 Months',
};

export const PERIOD_SLICE: Record<WeightPeriod, number | null> = {
  today: null,   // handled specially
  week:  7,
  month: 30,
  '3m':  null,   // all data
};
