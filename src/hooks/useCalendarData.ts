/**
 * @hook useCalendarData
 * @module Hooks/CalendarData
 * @description Compiles, tracks, and caches aggregate fitness metrics, daily streak flags, and calendar cells. Selector layer over Zustand store.
 * 
 * @param {number} viewYear - Enna Vāngum (Inputs): The active calendar view year.
 * @param {number} viewMonth - Enna Vāngum (Inputs): The active calendar view month (0-indexed).
 * @param {string} selDate - Enna Vāngum (Inputs): Selected ISO date string (YYYY-MM-DD) for metrics extraction.
 * @process Enna Pannum (Internal Logic):
 *          - Subscribes to BMI trackers, workout logs, water hydration logs, and diet store metrics.
 *          - Combines history arrays via optimized `useMemo` loops to build calendar cells status configurations.
 *          - Calculates month-over-month averages and delta indicators.
 * @returns {CalendarDataResult} Enna Return Pannum (Outputs): Memoized calendar cell structures, monthly averages, and daily details.
 */

import { useMemo, useEffect, useCallback } from 'react';
import {
  useFitnessStore,
  useBmiTracker,
  useWorkoutEngine,
  useHydrationTracker,
  useDietTracker,
} from '@/store/fitnessStore';
import { buildCalendarDays, todayISO } from '@/constants/calendar';

/**
 * Status representation of a calendar day's logged activities.
 * Used to render small progress dot indications in the calendar cells.
 */
export interface DayStatus {
  /** True if a body weight log was submitted on this date. */
  hasWeight:  boolean;
  /** Percentage of daily step count goal achieved (0–100). */
  stepsPct:   number;   // 0–100
  /** Percentage of daily water volume goal achieved (0–100). */
  waterPct:   number;   // 0–100
  /** Percentage of daily active calorie goal achieved (0–100). */
  mealsPct:   number;   // 0–100
  /** Dynamic sleep score recorded on this date (0–100), or null if unrecorded. */
  sleepScore: number | null;
}

/**
 * Aggregated summary statistics for a selected calendar month.
 */
export interface MonthStats {
  /** Total number of times weight logs were added during this month. */
  weightEntries: number;
  /** Number of days where step count achieved at least 60% of the target. */
  activeDays:    number;
  /** Average daily step count logged during this month. */
  avgSteps:      number;
  /** Net weight change (in kg) from the first log to the last log of this month. */
  trend:         number | null;  // kg change first→last of month
}

/**
 * Detailed metrics breakdown for a selected calendar date.
 */
export interface DayDetail {
  /** Human-readable date string label (e.g. "Monday, July 15"). */
  label:        string;
  /** True if this date represents the current active calendar day. */
  isToday:      boolean;
  /** Active weight log entry registered for this day (weight in kg and timeOfDay). */
  wLog?:        { weight: number; timeOfDay: string } | undefined;
  /** Weight difference compared to the closest previous recorded weight. */
  weightDelta:  number | null;
  /** Steps log entry registered for this day. */
  sLog?:        { steps: number; distanceKm: number; caloriesBurned: number } | undefined;
  /** Step goal completion percentage (0-100). */
  stepsPct:     number;
  /** Total water consumed in ml on this day. */
  waterMl:      number;
  /** Water goal completion percentage (0-100). */
  waterPct:     number;
  /** Total active food calories logged in kcal on this day. */
  caloriesKcal: number;
  /** Calorie goal completion percentage (0-100). */
  calPct:       number;
  /** Number of dynamic meals logged on this day. */
  mealsLogged:  number;
  /** Target water intake goal in ml. */
  wGoal:        number;
  /** Target calorie intake goal in kcal. */
  calGoal:      number;
  /** Target step count goal. */
  sGoal:        number;
  /** Preferred display unit for weight metrics ('kg' or 'lbs'). */
  weightUnit:   string;
}

interface CalendarDataResult {
  /** List of month days representing the month grid (including leading null spaces). */
  calDays:      (number | null)[];
  /** Callbacks to resolve a day's status dots list based on ISO date. */
  getDayStatus: (dateStr: string) => DayStatus;
  /** Monthly stats aggregations for the active calendar view month. */
  monthStats:   MonthStats;
  /** Detailed log information metrics breakdown for the selected calendar date. */
  dayDetail:    DayDetail | null;
}

const TOD_ORDER: Record<string, number> = { morning: 0, afternoon: 1, night: 2 };

/**
 * Custom hook to compile, sync, and memoize calendar overview stats, monthly trends,
 * and date details for the calendar tracker screens.
 * 
 * Automatically captures today's live tracker totals (water, steps, meals) and snapshots
 * them dynamically to the central persistence store daily logs context.
 * 
 * @param viewYear The calendar year currently in view (e.g. 2026).
 * @param viewMonth The 0-indexed calendar month currently in view (0 = January).
 * @param selDate Selected ISO date string (YYYY-MM-DD) to fetch details for.
 */
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
  const sleepLogs    = useFitnessStore(s => s.sleepLogs   ?? []);
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

    const sleepLog = sleepLogs.find(l => l.date === dateStr);

    return {
      hasWeight,
      stepsPct,
      waterPct:   Math.min(100, Math.round(waterMl      / (user.waterGoal   || 2500) * 100)),
      mealsPct:   Math.min(100, Math.round(caloriesKcal / (user.calorieGoal || 2000) * 100)),
      sleepScore: sleepLog?.score ?? null,
    };
  }, [weightLogs, stepHistory, dailyLogs, sleepLogs, user, todayWater, todayCal, todayMeals]);

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
