import { useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useTheme } from '@/constants/theme';
import { useFitnessStore } from '@/store/fitnessStore';
import { ReminderItem } from '@/types';
import { CATEGORIES, SUGGESTION_BLUEPRINTS, SmartSuggestion } from '@/constants/reminders';

export interface RemindersResult {
  reminders:   ReminderItem[];
  filtered:    ReminderItem[];
  activeCount: number;

  category:    string;
  setCategory: (category: string) => void;

  /** Theme-aware accent color per reminder category (used for filter pills, icons, suggestions). */
  categoryColors: Record<string, string>;
  /** Selectable swatches shown in the reminder color picker. */
  accentColorOptions: string[];
  smartSuggestions: SmartSuggestion[];

  toggleReminder: (id: string) => void;
  deleteReminder: (id: string) => void;
}

export function useReminders(): RemindersResult {
  const { colors } = useTheme();
  const { reminders, toggleReminder, deleteReminder } = useFitnessStore(useShallow((s) => ({
    reminders: s.reminders,
    toggleReminder: s.toggleReminder,
    deleteReminder: s.deleteReminder,
  })));
  const [category, setCategory] = useState<string>(CATEGORIES[0]);

  const categoryColors = useMemo<Record<string, string>>(() => ({
    All:          colors.lime,
    Water:        colors.chart.water,
    Meals:        colors.amber,
    'Weigh-in':   colors.lime,
    'Body Photo': colors.lime,
    Workout:      colors.lime,
    Supplements:  colors.chart.fibre,
    Sleep:        '#6366F1',
    Vitals:       '#EC4899',
    Cycle:        '#F87171',
    Steps:        '#10B981',
  }), [colors]);

  const accentColorOptions = useMemo(() => [
    colors.chart.water,
    colors.amber,
    colors.lime,
    colors.chart.fibre,
    '#6366F1', // Indigo (Sleep)
    '#A78BFA', // Purple
    '#EC4899', // Pink (Vitals)
    '#F87171', // Rose (Cycle)
    '#10B981', // Emerald (Steps)
  ], [colors]);

  // Only show suggestions for categories the user hasn't set up yet (max 5).
  const smartSuggestions = useMemo<SmartSuggestion[]>(() => {
    const usedCategories = new Set(reminders.map((r) => r.category));
    return SUGGESTION_BLUEPRINTS
      .filter((s) => !usedCategories.has(s.category))
      .slice(0, 5)
      .map((s) => ({ ...s, color: categoryColors[s.category] ?? colors.lime }));
  }, [reminders, categoryColors, colors.lime]);

  const filtered = useMemo(
    () => (category === 'All' ? reminders : reminders.filter((r) => r.category === category)),
    [reminders, category],
  );
  const activeCount = useMemo(() => reminders.filter((r) => r.enabled).length, [reminders]);

  return {
    reminders, filtered, activeCount,
    category, setCategory,
    categoryColors, accentColorOptions, smartSuggestions,
    toggleReminder, deleteReminder,
  };
}
