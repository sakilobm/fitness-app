import { useState, useMemo, useCallback } from 'react';
import { router } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import { useFitnessStore } from '@/store/fitnessStore';
import { useCycle } from '@/hooks/useCycle';
import { getBMIResult } from '@/utils/bmi';
import { kgToLbs, mlToOz } from '@/utils/units';
import { useTheme } from '@/constants/theme';
import {
  STEPS_KCAL_COEFF, ACTIVE_MIN_KCAL_COEFF,
  GREETING_THRESHOLDS, GREETING_LABELS,
  MEAL_IDS, MEAL_TIMES,
  MIN_STEPS_FOR_WALK_ENTRY, WALK_ENTRY_KCAL_BURN, WALK_ENTRY_TIME,
} from '@/constants/dashboard';
import type { WidgetConfig } from '@/features/dashboard/components/WidgetRegistry';

// ── Types ──────────────────────────────────────────────────────────────────────
export interface TimelineEntry {
  time: string;
  label: string;
  kcal: number;
  lib: 'Ionicons' | 'MCI';
  icon: string;
  color: string;
}

// ── Helpers (pure, outside hook to avoid re-creation) ─────────────────────────
function getGreeting(hours: number): string {
  if (hours < GREETING_THRESHOLDS.morning) return GREETING_LABELS.morning;
  if (hours < GREETING_THRESHOLDS.afternoon) return GREETING_LABELS.afternoon;
  return GREETING_LABELS.evening;
}

function formatDateStr(date: Date): string {
  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${DAY_NAMES[date.getDay()]}, ${date.getDate()} ${MONTH_NAMES[date.getMonth()]}`;
}

function toInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ── Hook ───────────────────────────────────────────────────────────────────────
export function useHomeDashboard() {
  const { colors } = useTheme();
  const cycle = useCycle();

  const {
    user, meals, waterLogs, weightLogs, stepsCount, activeMinutes,
    dashboardGrid, setDashboardGrid, toggleWidgetVisibility,
    sleepLogs, heartRateLogs,
  } = useFitnessStore(useShallow((s) => ({
    user:                 s.user,
    meals:                s.meals,
    waterLogs:            s.waterLogs,
    weightLogs:           s.weightLogs,
    stepsCount:           s.stepsCount,
    activeMinutes:        s.activeMinutes,
    dashboardGrid:        s.dashboardGrid,
    setDashboardGrid:     s.setDashboardGrid,
    toggleWidgetVisibility: s.toggleWidgetVisibility,
    sleepLogs:            s.sleepLogs,
    heartRateLogs:        s.heartRateLogs,
  })));

  const [isCustomizeVisible, setIsCustomizeVisible] = useState(false);
  // Persisted via store to survive remounts; kept local only if truly ephemeral.
  const [cycleBannerDismissed, setCycleBannerDismissed] = useState(false);

  // ── Derived data (all memoized) ──────────────────────────────────────────────
  const isLbs = user.weightUnit === 'lbs';
  const isOz  = user.volumeUnit === 'oz';

  const now = useMemo(() => new Date(), []); // stable within same mount
  // Recompute greeting reactively based on current hour (re-evaluates on re-render
  // which is fine since the parent screen remounts on focus via navigation).
  const greeting = useMemo(() => getGreeting(new Date().getHours()), []);
  const dateStr  = useMemo(() => formatDateStr(new Date()), []);
  const initials = useMemo(() => toInitials(user.name), [user.name]);

  const nutrition = useMemo(() => {
    let kcal = 0, protein = 0, carbs = 0, fat = 0;
    for (const m of meals) {
      for (const item of m.items) {
        kcal    += item.kcal;
        protein += item.protein;
        carbs   += item.carbs;
        fat     += item.fat;
      }
    }
    return { kcal, protein, carbs, fat };
  }, [meals]);

  const totalWaterMl = useMemo(
    () => waterLogs.reduce((sum, w) => sum + w.ml, 0),
    [waterLogs],
  );

  const currentWeight = useMemo(
    () => (weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : user.weight),
    [weightLogs, user.weight],
  );

  const previousWeight = useMemo(
    () => (weightLogs.length > 1 ? weightLogs[weightLogs.length - 2].weight : currentWeight),
    [weightLogs, currentWeight],
  );

  const weightTrend = useMemo<'losing' | 'gaining' | 'stable'>(() => {
    if (currentWeight < previousWeight) return 'losing';
    if (currentWeight > previousWeight) return 'gaining';
    return 'stable';
  }, [currentWeight, previousWeight]);

  const bmiResult = useMemo(
    () => getBMIResult(currentWeight, user.height),
    [currentWeight, user.height],
  );

  const activeKcal = useMemo(
    () => Math.round(stepsCount * STEPS_KCAL_COEFF + activeMinutes * ACTIVE_MIN_KCAL_COEFF),
    [stepsCount, activeMinutes],
  );

  const lastSleep = useMemo(() => (sleepLogs.length > 0 ? sleepLogs[0] : null), [sleepLogs]);
  const sleepHrs  = useMemo(() => (lastSleep ? (lastSleep.totalMin / 60).toFixed(1) : '--'), [lastSleep]);
  const lastHR    = useMemo(() => (heartRateLogs.length > 0 ? heartRateLogs[0] : null), [heartRateLogs]);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // ── Timeline (memoized, recomputes only when inputs change) ──────────────────
  const timeline = useMemo<TimelineEntry[]>(() => {
    const feed: TimelineEntry[] = [];

    if (lastSleep) {
      feed.push({
        time:  lastSleep.wakeTime,
        label: `Slept ${sleepHrs} hr`,
        kcal:  lastSleep.score,
        lib:   'Ionicons',
        icon:  'moon',
        color: '#818CF8',
      });
    }

    const addMeal = (id: string, label: string, time: string, icon: string) => {
      const meal = meals.find((m) => m.id === id);
      const kcal = meal ? meal.items.reduce((s, i) => s + i.kcal, 0) : 0;
      if (kcal > 0) {
        feed.push({ time, label, kcal, lib: 'MCI', icon, color: colors.amber });
      }
    };

    addMeal(MEAL_IDS.breakfast, 'Breakfast',   MEAL_TIMES.breakfast, 'egg-fried');
    addMeal(MEAL_IDS.lunch,     'Lunch',        MEAL_TIMES.lunch,     'food-apple');
    addMeal(MEAL_IDS.snacks,    'Snack',        MEAL_TIMES.snacks,    'nutrition');
    addMeal(MEAL_IDS.dinner,    'Dinner',       MEAL_TIMES.dinner,    'silverware-fork-knife');

    if (stepsCount > MIN_STEPS_FOR_WALK_ENTRY) {
      feed.push({
        time:  WALK_ENTRY_TIME,
        label: 'Morning Walk',
        kcal:  WALK_ENTRY_KCAL_BURN,
        lib:   'MCI',
        icon:  'walk',
        color: colors.lime,
      });
    }

    if (waterLogs.length > 0) {
      const latest = waterLogs[waterLogs.length - 1];
      feed.push({
        time:  latest.time,
        label: 'Logged Hydration',
        kcal:  latest.ml,
        lib:   'Ionicons',
        icon:  'water',
        color: colors.chart.water,
      });
    }

    const todayHR = heartRateLogs.find((l) => l.date === todayStr);
    if (todayHR) {
      feed.push({
        time:  todayHR.time,
        label: 'Heart Rate',
        kcal:  todayHR.bpm,
        lib:   'MCI',
        icon:  'heart-pulse',
        color: '#EC4899',
      });
    }

    if (cycle?.cycleSettings?.cycleTrackingEnabled) {
      const todayCycle = cycle.cycleLogs?.find((l) => l.date === todayStr);
      if (todayCycle) {
        feed.push({
          time:  '20:00',
          label: 'Cycle Logged',
          kcal:  0,
          lib:   'Ionicons',
          icon:  'flower',
          color: '#F87171',
        });
      }
    }

    if (feed.length === 0) {
      feed.push({
        time:  '08:00',
        label: 'Start your journey!',
        kcal:  0,
        lib:   'Ionicons',
        icon:  'rocket-outline',
        color: colors.lime,
      });
    }

    return feed.sort((a, b) => a.time.localeCompare(b.time));
  }, [
    lastSleep, sleepHrs, meals, stepsCount, waterLogs,
    heartRateLogs, cycle, todayStr, colors,
  ]);

  // ── Widget configs (memoized) ────────────────────────────────────────────────
  const widgetConfigs = useMemo<Record<string, WidgetConfig<any>>>(() => ({
    steps: {
      id: 'steps',
      type: 'linear_progress',
      title: 'Daily Steps',
      icon: { lib: 'Ionicons', name: 'footsteps' },
      color: colors.lime,
      data: {
        value: stepsCount,
        target: user.stepsGoal,
        progressColor: colors.lime,
        unit: 'steps',
      },
      onPress: () => router.push('/steps'),
    },
    water: {
      id: 'water',
      type: 'radial_chart',
      title: 'Hydration',
      icon: { lib: 'Ionicons', name: 'water' },
      color: colors.chart.water,
      data: {
        value:         isOz ? mlToOz(totalWaterMl) : totalWaterMl,
        target:        isOz ? mlToOz(user.waterGoal) : user.waterGoal,
        segments:      [{ value: isOz ? mlToOz(totalWaterMl) : totalWaterMl, color: colors.chart.water }],
        centerLabel:   isOz ? `${mlToOz(totalWaterMl)} oz` : `${(totalWaterMl / 1000).toFixed(1)}L`,
        centerSublabel: 'Hydrated',
      },
      onPress: () => router.push('/water'),
    },
    nutrition: {
      id: 'nutrition',
      type: 'radial_chart',
      title: 'Nutrition',
      icon: { lib: 'MCI', name: 'food-apple' },
      color: colors.amber,
      data: {
        value:         nutrition.kcal,
        target:        user.calorieGoal,
        segments:      [
          { value: nutrition.carbs,   color: colors.chart.carbs },
          { value: nutrition.protein, color: colors.chart.protein },
          { value: nutrition.fat,     color: colors.danger },
        ],
        centerLabel:   `${nutrition.kcal} kcal`,
        centerSublabel: 'Consumed',
      },
      onPress: () => router.push('/(tabs)/nutrition'),
    },
    weight: {
      id: 'weight',
      type: 'numeric_delta',
      title: 'Weight Tracker',
      icon: { lib: 'MCI', name: 'scale-bathroom' },
      color: colors.lime,
      data: {
        currentValue:  isLbs ? kgToLbs(currentWeight) : currentWeight,
        previousValue: isLbs ? kgToLbs(previousWeight) : previousWeight,
        unit:          isLbs ? 'lbs' : 'kg',
        trend:         weightTrend,
      },
      onPress: () => router.push('/(tabs)/weight'),
    },
    workout_focus: {
      id: 'workout_focus',
      type: 'compact_chip',
      title: 'Today Focus',
      icon: { lib: 'MCI', name: 'dumbbell' },
      color: colors.amber,
      data: { value: 'Upper Body', status: '45 min', statusColor: colors.amber },
    },
  }), [
    colors, stepsCount, user, isOz, isLbs, totalWaterMl,
    nutrition, currentWeight, previousWeight, weightTrend,
  ]);

  // ── Display values (memoized) ────────────────────────────────────────────────
  const waterDisplay = useMemo(
    () => isOz ? `${mlToOz(totalWaterMl)} oz` : `${(totalWaterMl / 1000).toFixed(1)} L`,
    [isOz, totalWaterMl],
  );

  const weightDisplay = useMemo(
    () => isLbs
      ? `${kgToLbs(currentWeight).toFixed(1)} lbs`
      : `${currentWeight.toFixed(1)} kg`,
    [isLbs, currentWeight],
  );

  const hrDisplay = useMemo(
    () => lastHR ? `${lastHR.bpm} bpm` : '--',
    [lastHR],
  );

  const sleepDisplay = useMemo(
    () => lastSleep ? `${sleepHrs} hr` : '--',
    [lastSleep, sleepHrs],
  );

  // ── Cycle chip data (memoized) ───────────────────────────────────────────────
  const cycleChip = useMemo(() => {
    if (!cycle?.cycleSettings?.cycleTrackingEnabled) return null;
    const daysUntil = cycle.daysUntilPeriod ?? null;
    const daysLate  = (daysUntil !== null && daysUntil < 0) ? Math.abs(daysUntil) : 0;
    const accent    = daysLate > 0
      ? (daysLate <= 3 ? '#FBBF24' : daysLate <= 7 ? '#FB923C' : '#EF4444')
      : '#F87171';
    const title = daysLate > 0
      ? `Period ${daysLate}d late`
      : cycle.currentPhase && cycle.dayOfCycle
        ? `${cycle.phaseMeta?.label} · Day ${cycle.dayOfCycle}`
        : 'Cycle Tracking';
    const sub = daysUntil !== null
      ? daysUntil === 0
        ? 'Period expected today — tap to log'
        : daysUntil > 0
          ? `Next period in ${daysUntil} days`
          : daysLate <= 3
            ? 'Small delays are normal — tap to check in'
            : daysLate <= 7
              ? 'Common causes: stress, diet or illness'
              : 'Consider speaking with a healthcare provider'
      : 'Tap to log today';
    return { accent, title, sub, daysLate };
  }, [cycle]);

  // ── Handlers (all useCallback) ───────────────────────────────────────────────
  const openCustomize  = useCallback(() => setIsCustomizeVisible(true), []);
  const closeCustomize = useCallback(() => setIsCustomizeVisible(false), []);
  const dismissCycleBanner = useCallback(() => setCycleBannerDismissed(true), []);
  const enableCycleTracking = useCallback(
    () => cycle?.updateCycleSettings?.({ cycleTrackingEnabled: true }),
    [cycle],
  );

  const moveWidget = useCallback((fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= dashboardGrid.length) return;
    const next = [...dashboardGrid];
    const [item] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, item);
    setDashboardGrid(next);
  }, [dashboardGrid, setDashboardGrid]);

  const goToRewards  = useCallback(() => router.push('/rewards'), []);
  const goToProfile  = useCallback(() => router.push('/(tabs)/profile'), []);
  const goToSteps    = useCallback(() => router.push('/steps'), []);
  const goToWater    = useCallback(() => router.push('/water'), []);
  const goToBmi      = useCallback(() => router.push('/bmi'), []);
  const goToCycle    = useCallback(() => router.push('/(tabs)/cycle' as any), []);

  // ── Derived flags ────────────────────────────────────────────────────────────
  const showCycleBanner = user.gender === 'female'
    && !cycle?.cycleSettings?.cycleTrackingEnabled
    && !cycleBannerDismissed;

  return {
    // User
    user, initials, greeting, dateStr,
    // Unit preferences
    isLbs, isOz,
    // Computed data
    nutrition, totalWaterMl, currentWeight, weightTrend,
    bmiResult, activeKcal, lastSleep, sleepHrs, lastHR,
    // Display strings
    waterDisplay, weightDisplay, hrDisplay, sleepDisplay,
    // Dashboard
    dashboardGrid, widgetConfigs, timeline,
    // Cycle
    cycleChip, showCycleBanner,
    // Modal
    isCustomizeVisible,
    // Handlers
    openCustomize, closeCustomize, toggleWidgetVisibility, moveWidget,
    dismissCycleBanner, enableCycleTracking,
    goToRewards, goToProfile, goToSteps, goToWater, goToBmi, goToCycle,
    stepsCount, activeMinutes,
  };
}
