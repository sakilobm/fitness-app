import { IconDef } from '@/types';

export const ALL_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export const DAY_MAP: Record<string, string> = {
  M: 'Mon', T: 'Tue', W: 'Wed', F: 'Fri', S: 'Sat',
};

export const CATEGORIES = ['All', 'Water', 'Meals', 'Weigh-in', 'Body Photo', 'Workout', 'Supplements'];

export const FREQUENCIES = ['Daily', 'Weekdays', 'Weekends', 'Custom'] as const;
export type ReminderFrequency = typeof FREQUENCIES[number];

export interface SmartSuggestionBlueprint {
  category: string;
  title: string;
  time: string;
  frequency: string;
  text: string;
}

export const SUGGESTION_BLUEPRINTS: SmartSuggestionBlueprint[] = [
  { category: 'Water',     title: 'Late Afternoon Hydration', time: '16:30', frequency: 'Daily',    text: 'You usually forget water after 4 PM' },
  { category: 'Weigh-in',  title: 'Weekend Weigh-in check',   time: '08:00', frequency: 'Weekends', text: 'Weigh-in consistency drops on weekends' },
  { category: 'Meals',     title: 'Log Lunch Tracker',        time: '13:00', frequency: 'Weekdays', text: 'Lunch log is often skipped on Tuesdays' },
];

export interface SmartSuggestion extends SmartSuggestionBlueprint {
  color: string;
}

/** Resolves a category (and optional reminder title for time-of-day nuance) to an icon. */
export function getCategoryIcon(category: string, titleStr?: string): IconDef {
  const t = (titleStr || '').toLowerCase();
  if (category === 'Water') {
    return { lib: 'Ionicons', name: t.includes('afternoon') || t.includes('evening') ? 'water-outline' : 'water' };
  }
  if (category === 'Meals') {
    return { lib: 'Ionicons', name: t.includes('dinner') || t.includes('night') ? 'restaurant-outline' : 'restaurant' };
  }
  if (category === 'Weigh-in') {
    return { lib: 'MCI', name: 'scale-bathroom' };
  }
  if (category === 'Body Photo') {
    return { lib: 'Ionicons', name: 'camera' };
  }
  if (category === 'Workout') {
    return { lib: 'MCI', name: 'dumbbell' };
  }
  return { lib: 'MCI', name: 'pill' };
}

/** Maps a repeat-frequency preset to its concrete set of active day-letters. */
export function daysForFrequency(frequency: string): string[] {
  if (frequency === 'Weekdays') return ['M', 'T', 'W', 'T', 'F'];
  if (frequency === 'Weekends') return ['S', 'S'];
  return ALL_DAYS;
}

export interface FormTime {
  hour: string;
  minute: string;
  ampm: 'AM' | 'PM';
}

/** Parses a stored 24-hour "HH:MM" string into 12-hour form-field values. */
export function parseTimeString(time: string): FormTime {
  const [hStr, mStr] = time.split(':');
  let hour = parseInt(hStr, 10);
  const ampm: 'AM' | 'PM' = hour >= 12 ? 'PM' : 'AM';
  if (hour > 12) hour -= 12;
  if (hour === 0) hour = 12;
  return { hour: hour.toString().padStart(2, '0'), minute: mStr, ampm };
}

/** Converts 12-hour form-field values back into a stored 24-hour "HH:MM" string. */
export function formTimeTo24h(hour: string, minute: string, ampm: 'AM' | 'PM'): string {
  let h = parseInt(hour, 10);
  if (ampm === 'PM' && h < 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return `${h.toString().padStart(2, '0')}:${minute.padStart(2, '0')}`;
}
