import { useMemo, useState, useCallback } from 'react';
import { useProfileSettings, useBmiTracker } from '@/store/fitnessStore';
import { kgToLbs } from '@/utils/units';
import { WEIGHT_MILESTONES_KG, MONTHLY_KG_PACE, WEEKLY_KG_PACE, WEEKLY_LBS_PACE, PERIOD_SLICE } from '@/constants/weight';
import type { WeightPeriod } from '@/constants/weight';

export interface WeightStats {
  // Raw
  currentWeight: number;
  goalWeight: number;
  startWeight: number;
  currentBmi: number;

  // Period
  period: WeightPeriod;
  setPeriod: (p: WeightPeriod) => void;

  // Chart data (display unit)
  chartData: number[];
  todayData: number[];
  todayStatus: boolean[];

  // Display (already converted to user unit)
  isLbs: boolean;
  displayCurrent: number;
  displayGoal: number;
  displayStart: number;
  displayLost: number;
  displayRemaining: number;
  displayWeeklyChange: number;
  weeklyChangeText: string;

  // Progress
  goalProgressPct: number;
  weeksEstimate: number;

  // Milestones
  milestones: { kg: number; display: number; unlocked: boolean }[];
}

export function useWeightStats(): WeightStats {
  const { user } = useProfileSettings();
  const { weightLogs } = useBmiTracker();

  const [period, setPeriod] = useState<WeightPeriod>('week');

  const isLbs = user.weightUnit === 'lbs';

  // Use user's profile weight as start anchor when no logs exist
  const currentWeight = useMemo(
    () => (weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : user.weight),
    [weightLogs, user.weight],
  );

  // startWeight = first ever log, or current weight if no history
  const startWeight = useMemo(
    () => (weightLogs.length > 0 ? weightLogs[0].weight : user.weight),
    [weightLogs, user.weight],
  );

  // goalWeight from user profile — live, not hardcoded
  const goalWeight = useMemo(() => {
    if (user.goal === 'Gain Muscle') return Math.min(startWeight + 10, startWeight * 1.12);
    if (user.goal === 'Stay Fit') return startWeight;
    return Math.max(startWeight - 15, 50); // lose weight — clamp at 50 kg minimum
  }, [user.goal, startWeight]);

  // Daily values: last entry per unique date
  const dailyWeightValues = useMemo(
    () => Object.values(
      weightLogs.reduce<Record<string, number>>((acc, log) => {
        acc[log.date] = log.weight;
        return acc;
      }, {}),
    ),
    [weightLogs],
  );

  // Today intraday
  const todayDateStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const todayLogs = useMemo(
    () => weightLogs.filter((l) => l.date === todayDateStr),
    [weightLogs, todayDateStr],
  );

  const { todayData, todayStatus } = useMemo(() => {
    const morning   = todayLogs.find((l) => l.timeOfDay === 'morning')?.weight;
    const afternoon = todayLogs.find((l) => l.timeOfDay === 'afternoon')?.weight;
    const night     = todayLogs.find((l) => l.timeOfDay === 'night')?.weight;
    const base      = morning ?? currentWeight;
    return {
      todayData:   [morning ?? base, afternoon ?? morning ?? base, night ?? afternoon ?? morning ?? base],
      todayStatus: [morning !== undefined, afternoon !== undefined, night !== undefined],
    };
  }, [todayLogs, currentWeight]);

  // Chart data for selected period
  const rawChartData = useMemo(() => {
    if (period === 'today') return todayData;
    const slice = PERIOD_SLICE[period];
    return slice !== null ? dailyWeightValues.slice(-slice) : dailyWeightValues;
  }, [period, todayData, dailyWeightValues]);

  const chartData = useMemo(
    () => (isLbs ? rawChartData.map(kgToLbs) : rawChartData),
    [isLbs, rawChartData],
  );

  // Display conversions
  const displayCurrent = useMemo(() => isLbs ? kgToLbs(currentWeight) : currentWeight, [isLbs, currentWeight]);
  const displayGoal    = useMemo(() => isLbs ? kgToLbs(goalWeight) : goalWeight, [isLbs, goalWeight]);
  const displayStart   = useMemo(() => isLbs ? kgToLbs(startWeight) : startWeight, [isLbs, startWeight]);
  const displayLost    = useMemo(
    () => parseFloat((displayStart - displayCurrent).toFixed(1)),
    [displayStart, displayCurrent],
  );
  const displayRemaining = useMemo(
    () => parseFloat(Math.max(displayCurrent - displayGoal, 0).toFixed(1)),
    [displayCurrent, displayGoal],
  );

  const displayWeeklyChange = useMemo(() => {
    const lastWeek = dailyWeightValues[Math.max(0, dailyWeightValues.length - 8)] ?? startWeight;
    const dispLast = isLbs ? kgToLbs(lastWeek) : lastWeek;
    return parseFloat((displayCurrent - dispLast).toFixed(1));
  }, [dailyWeightValues, startWeight, isLbs, displayCurrent]);

  const weeklyChangeText = useMemo(() => {
    if (displayWeeklyChange < 0) return `${displayWeeklyChange} this week`;
    if (displayWeeklyChange > 0) return `+${displayWeeklyChange} this week`;
    return 'stable this week';
  }, [displayWeeklyChange]);

  // Goal progress
  const goalProgressPct = useMemo(() => {
    const totalDelta = Math.abs(startWeight - goalWeight);
    if (totalDelta === 0) return 100;
    const currentDelta = Math.abs(startWeight - currentWeight);
    return Math.min(Math.max(Math.round((currentDelta / totalDelta) * 100), 0), 100);
  }, [startWeight, goalWeight, currentWeight]);

  const weeksEstimate = useMemo(
    () => Math.max(1, Math.round(displayRemaining / (isLbs ? WEEKLY_LBS_PACE : WEEKLY_KG_PACE))),
    [displayRemaining, isLbs],
  );

  // BMI
  const heightM = user.height / 100;
  const currentBmi = useMemo(
    () => parseFloat((currentWeight / (heightM * heightM)).toFixed(1)),
    [currentWeight, heightM],
  );

  // Milestones
  const milestones = useMemo(
    () => WEIGHT_MILESTONES_KG.map((kg) => ({
      kg,
      display: isLbs ? Math.round(kg * 2.20462) : kg,
      unlocked: currentWeight <= kg,
    })),
    [isLbs, currentWeight],
  );

  return {
    currentWeight, goalWeight, startWeight, currentBmi,
    period, setPeriod,
    chartData, todayData, todayStatus,
    isLbs,
    displayCurrent, displayGoal, displayStart, displayLost,
    displayRemaining, displayWeeklyChange, weeklyChangeText,
    goalProgressPct, weeksEstimate,
    milestones,
  };
}
