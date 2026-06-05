import { useMemo, useEffect, useCallback } from 'react';
import {
  useFitnessStore,
  useBmiTracker,
  useWorkoutEngine,
  useHydrationTracker,
  useDietTracker,
} from '@/store/fitnessStore';
import { buildCalendarDays, todayISO } from '@/constants/calendar';

export interface DayStatus {
  hasWeight: boolean;
  stepsPct:  number;   // 0–100
  waterPct:  number;   // 0–100
  mealsPct:  number;   // 0–100
}

export interface MonthStats {
  weightEntries: number;
  activeDays:    number;
  avgSteps:      number;
  trend:         number | null;  // kg change first→last of month
}

export interface DayDetail {
  label:        string;
  isToday:      boolean;
  wLog?:        { weight: number; timeOfDay: string } | undefined;
  weightDelta:  number | null;
  sLog?:        { steps: number; distanceKm: number; caloriesBurned: number } | undefined;
  stepsPct:     number;
  waterMl:      number;
  waterPct:     number;
  caloriesKcal: number;
  calPct:       number;
  mealsLogged:  number;
  wGoal:        number;
  calGoal:      number;
  sGoal:        number;
  weightUnit:   string;
}

interface CalendarDataResult {
  calDays:      (number | null)[];
  getDayStatus: (dateStr: string) => DayStatus;
  monthStats:   MonthStats;
  dayDetail:    DayDetail | null;
}

const TOD_ORDER: Record<string, number> = { morning: 0, afternoon: 1, night: 2 };

export function useCalendarData(
  viewYear:  number,
  viewMonth: number,
  selDate:   string,
): CalendarDataResult {
  const { weightLogs }            = useBmiTracker();
  const { stepHistory }           = useWorkoutEngine();
  const { waterLogs }             = useHydrationTracker();
  const { meals }                 = useDietTracker();
  const dailyLogs    = useFitnessStore(s => s.dailyLogs   ?? []);
  const upsertDailyLog = useFitnessStore(s => s.upsertDailyLog);
  const user         = useFitnessStore(s => s.user);

  // ── Live today totals ─────────────────────────────────────────────────────
  const todayWater = useMemo(
    () => waterLogs.reduce((s, l) => s + l.ml, 0),
    [waterLogs],
  );
  const todayCal = useMemo(
    () => meals.reduce((s, m) => s + m.items.reduce((a, i) => a + i.kcal, 0), 0),
    [meals],
  );
  const todayMeals = useMemo(
    () => meals.filter(m => m.items.length > 0).length,
    [meals],
  );

  // ── Snapshot today whenever live totals change ────────────────────────────
  useEffect(() => {
    upsertDailyLog({
      date:         todayISO(),
      waterMl:      todayWater,
      caloriesKcal: todayCal,
      mealsLogged:  todayMeals,
    });
  }, [todayWater, todayCal, todayMeals]);

  // ── Calendar grid ─────────────────────────────────────────────────────────
  const calDays = useMemo(
    () => buildCalendarDays(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  // ── Per-day status (memoised deps; stable function ref via useCallback) ───
  const getDayStatus = useCallback((dateStr: string): DayStatus => {
    const isToday   = dateStr === todayISO();
    const hasWeight = weightLogs.some(l => l.date === dateStr);
    const stepLog   = stepHistory.find(l => l.date === dateStr);
    const stepsPct  = stepLog
      ? Math.min(100, Math.round(stepLog.steps / (user.stepsGoal || 10000) * 100))
      : 0;

    let waterMl = 0, caloriesKcal = 0, mealsLogged = 0;
    if (isToday) {
      waterMl = todayWater; caloriesKcal = todayCal; mealsLogged = todayMeals;
    } else {
      const log = dailyLogs.find(l => l.date === dateStr);
      if (log) {
        waterMl = log.waterMl;
        caloriesKcal = log.caloriesKcal;
        mealsLogged = log.mealsLogged;
      }
    }

    return {
      hasWeight,
      stepsPct,
      waterPct: Math.min(100, Math.round(waterMl      / (user.waterGoal   || 2500) * 100)),
      mealsPct: Math.min(100, Math.round(caloriesKcal / (user.calorieGoal || 2000) * 100)),
    };
  }, [weightLogs, stepHistory, dailyLogs, user, todayWater, todayCal, todayMeals]);

  // ── Month summary stats ───────────────────────────────────────────────────
  const monthStats = useMemo((): MonthStats => {
    const pfx      = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;
    const mWeights = weightLogs.filter(l => l.date.startsWith(pfx));
    const mSteps   = stepHistory.filter(l => l.date.startsWith(pfx));
    const goal     = user.stepsGoal || 10000;
    const activeDays = mSteps.filter(l => l.steps >= goal * 0.6).length;
    const avgSteps   = mSteps.length > 0
      ? Math.round(mSteps.reduce((s, l) => s + l.steps, 0) / mSteps.length)
      : 0;
    const trend = mWeights.length >= 2
      ? +(mWeights[mWeights.length - 1].weight - mWeights[0].weight).toFixed(1)
      : null;
    return { weightEntries: mWeights.length, activeDays, avgSteps, trend };
  }, [viewYear, viewMonth, weightLogs, stepHistory, user]);

  // ── Selected-day detail ───────────────────────────────────────────────────
  const dayDetail = useMemo((): DayDetail | null => {
    if (!selDate) return null;

    const isToday = selDate === todayISO();

    const wLog = [...weightLogs]
      .filter(l => l.date === selDate)
      .sort((a, b) => TOD_ORDER[a.timeOfDay] - TOD_ORDER[b.timeOfDay])[0];

    const prevW = [...weightLogs]
      .filter(l => l.date < selDate)
      .sort((a, b) => b.date.localeCompare(a.date))[0];

    const sLog = stepHistory.find(l => l.date === selDate);

    let waterMl = 0, caloriesKcal = 0, mealsLogged = 0;
    if (isToday) {
      waterMl = todayWater; caloriesKcal = todayCal; mealsLogged = todayMeals;
    } else {
      const log = dailyLogs.find(l => l.date === selDate);
      if (log) {
        waterMl = log.waterMl;
        caloriesKcal = log.caloriesKcal;
        mealsLogged = log.mealsLogged;
      }
    }

    const d      = new Date(selDate + 'T12:00:00');
    const label  = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const wGoal  = user.waterGoal   || 2500;
    const calGoal = user.calorieGoal || 2000;
    const sGoal  = user.stepsGoal   || 10000;

    return {
      label,
      isToday,
      wLog: wLog
        ? { weight: wLog.weight, timeOfDay: wLog.timeOfDay }
        : undefined,
      weightDelta: wLog && prevW ? +(wLog.weight - prevW.weight).toFixed(1) : null,
      sLog: sLog
        ? { steps: sLog.steps, distanceKm: sLog.distanceKm, caloriesBurned: sLog.caloriesBurned }
        : undefined,
      stepsPct: sLog ? Math.min(100, Math.round(sLog.steps / sGoal * 100)) : 0,
      waterMl,
      waterPct:     Math.min(100, Math.round(waterMl      / wGoal   * 100)),
      caloriesKcal,
      calPct:       Math.min(100, Math.round(caloriesKcal / calGoal * 100)),
      mealsLogged,
      wGoal, calGoal, sGoal,
      weightUnit: user.weightUnit || 'kg',
    };
  }, [selDate, weightLogs, stepHistory, dailyLogs, user, todayWater, todayCal, todayMeals]);

  return { calDays, getDayStatus, monthStats, dayDetail };
}
