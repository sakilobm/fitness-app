// ─── Dashboard constants ──────────────────────────────────────────────────────

/** Steps-to-kcal burn coefficient (rough MET-based estimate). */
export const STEPS_KCAL_COEFF = 0.045;

/** Active-minutes-to-kcal coefficient. */
export const ACTIVE_MIN_KCAL_COEFF = 7.5;

/** Fallback weight when no logs exist — pulled from user profile, not hardcoded. */
export const WEIGHT_FALLBACK_SOURCE = 'user.weight' as const;

export const GREETING_THRESHOLDS = { morning: 12, afternoon: 17 } as const;

export const GREETING_LABELS = {
  morning: 'Good morning',
  afternoon: 'Good afternoon',
  evening: 'Good evening',
} as const;

/** Timeline default "no-activity" entry. */
export const TIMELINE_EMPTY_ENTRY = {
  time: '08:00',
  label: 'Start your journey!',
  kcal: 0,
  lib: 'Ionicons' as const,
  icon: 'rocket-outline' as const,
  color_key: 'lime' as const,
};

/** Meal IDs that match store identifiers — single source of truth. */
export const MEAL_IDS = {
  breakfast: 'breakfast',
  lunch: 'lunch',
  dinner: 'dinner',
  snacks: 'snacks',
} as const;

/** Fixed display times for meal timeline entries. */
export const MEAL_TIMES = {
  breakfast: '07:30',
  lunch: '12:30',
  dinner: '19:30',
  snacks: '15:30',
} as const;

export const MIN_STEPS_FOR_WALK_ENTRY = 3_000;
export const WALK_ENTRY_KCAL_BURN = -150;
export const WALK_ENTRY_TIME = '09:15';

/** All configurable dashboard widgets, ordered by default. */
export const ALL_WIDGETS = [
  { id: 'steps', label: 'Steps Tracker' },
  { id: 'nutrition', label: 'Nutrition & Macros' },
  { id: 'water', label: 'Hydration Tracking' },
  { id: 'weight', label: 'Weight Analysis' },
  { id: 'workout_focus', label: 'Workout Focus' },
] as const;

export type WidgetId = typeof ALL_WIDGETS[number]['id'];
