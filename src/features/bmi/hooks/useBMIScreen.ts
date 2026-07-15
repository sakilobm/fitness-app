import { useMemo, useState, useCallback } from 'react';
import { useFitnessStore } from '@/store/fitnessStore';
import { useShallow } from 'zustand/react/shallow';
import { getBMIResult, generateSuggestions } from '@/utils/bmi';
import { getIdealWeightRange, getWeightToNormal, computeBMITrendStats } from '../utils/bmiCalculator';

export function useBMIScreen() {
  // Pull fields from store using select function with useShallow
  const store = useFitnessStore(useShallow((s) => ({
    user: s.user,
    weightLogs: s.weightLogs,
    stepsCount: s.stepsCount,
    waterLogs: s.waterLogs,
    setUser: s.setUser,
  })));

  const { user, weightLogs, stepsCount, waterLogs, setUser } = store;

  // Local state inputs for calculator and tracker
  const [showCalcModal, setShowCalcModal] = useState(false);
  const [calcWeight, setCalcWeight] = useState(user.weight.toString());
  const [calcHeight, setCalcHeight] = useState(user.height.toString());

  const currentBMI = useMemo(() => {
    return user.weight / ((user.height / 100) * (user.height / 100));
  }, [user.weight, user.height]);

  const bmiLogs = useMemo(() => {
    const dateMap = new Map<string, number>();
    weightLogs.forEach((log) => dateMap.set(log.date, log.weight));

    const logs: Array<{ date: string; bmi: number; weight: number }> = [];
    dateMap.forEach((wVal, dateStr) => {
      logs.push({
        date: dateStr,
        weight: wVal,
        bmi: wVal / ((user.height / 100) * (user.height / 100)),
      });
    });

    return logs.sort((a, b) => a.date.localeCompare(b.date));
  }, [weightLogs, user.height]);

  const weightTrend = useMemo<'losing' | 'gaining' | 'stable'>(() => {
    if (weightLogs.length < 7) return 'stable';
    const recent = weightLogs.slice(-14);
    const mid = Math.floor(recent.length / 2);
    const avgFirst = recent.slice(0, mid).reduce((sum, l) => sum + l.weight, 0) / (mid || 1);
    const avgSecond = recent.slice(mid).reduce((sum, l) => sum + l.weight, 0) / ((recent.length - mid) || 1);
    const diff = avgSecond - avgFirst;
    if (diff < -0.3) return 'losing';
    if (diff > 0.3) return 'gaining';
    return 'stable';
  }, [weightLogs]);

  // Derived state values computed under strict memoization
  const bmiResult = useMemo(() => getBMIResult(user.weight, user.height), [user.weight, user.height]);
  const idealRange = useMemo(() => getIdealWeightRange(user.height), [user.height]);
  const weightAction = useMemo(() => getWeightToNormal(user.weight, user.height), [user.weight, user.height]);

  const bmiChartData = useMemo(() => {
    return bmiLogs.slice(-14).map((l) => ({ date: l.date, bmi: l.bmi }));
  }, [bmiLogs]);

  const bmiStats = useMemo(() => computeBMITrendStats(bmiLogs as any), [bmiLogs]);

  const waterTotal = useMemo(() => waterLogs.reduce((s, l) => s + l.ml, 0), [waterLogs]);

  const suggestions = useMemo(() => {
    return generateSuggestions({
      bmiResult,
      stepsPct: stepsCount / user.stepsGoal,
      weightTrend,
      waterPct: waterTotal / user.waterGoal,
    });
  }, [bmiResult, stepsCount, user.stepsGoal, weightTrend, waterTotal, user.waterGoal]);

  // Calculator modal values
  const calcBMI = useMemo(() => {
    const w = parseFloat(calcWeight);
    const h = parseFloat(calcHeight);
    if (w > 0 && h > 0) return getBMIResult(w, h);
    return null;
  }, [calcWeight, calcHeight]);

  const handleOpenCalc = useCallback(() => {
    setCalcWeight(user.weight.toString());
    setCalcHeight(user.height.toString());
    setShowCalcModal(true);
  }, [user.weight, user.height]);

  const handleCloseCalc = useCallback(() => {
    setShowCalcModal(false);
  }, []);

  return {
    user,
    currentBMI,
    bmiResult,
    idealRange,
    weightAction,
    bmiChartData,
    bmiStats,
    bmiLogs,
    suggestions,
    showCalcModal,
    handleOpenCalc,
    handleCloseCalc,
    calcWeight,
    setCalcWeight,
    calcHeight,
    setCalcHeight,
    calcBMI,
  };
}
