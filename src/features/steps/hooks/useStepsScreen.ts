import { useState, useCallback, useMemo } from 'react';
import { useFitnessStore } from '@/store/fitnessStore';
import { useShallow } from 'zustand/react/shallow';
import { stepsToCalories, stepsToDistanceKm } from '@/utils/steps';
import { generateSuggestions, getBMIResult } from '@/utils/bmi';
import { calculateStepsStreak, calculateBestDay, calculateAverageSteps } from '../utils/stepsMath';
import { triggerHaptic } from '@/utils/haptics';

export function useStepsScreen() {
  const store = useFitnessStore(useShallow((s) => ({
    stepsCount: s.stepsCount,
    activeMinutes: s.activeMinutes,
    stepHistory: s.stepHistory,
    updateStepsGoal: s.updateStepsGoal,
    addManualSteps: s.addManualSteps,
    user: s.user,
    waterLogs: s.waterLogs,
    weightLogs: s.weightLogs,
  })));

  const {
    stepsCount,
    activeMinutes,
    stepHistory,
    updateStepsGoal,
    addManualSteps,
    user,
    waterLogs,
    weightLogs,
  } = store;

  // Local state management for toggling and inputs
  const [goalView, setGoalView] = useState<'daily' | 'weekly'>('daily');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [goalInput, setGoalInput] = useState(user.stepsGoal.toString());

  const goal = user.stepsGoal;
  const progress = useMemo(() => Math.min(stepsCount / goal, 1), [stepsCount, goal]);
  const caloriesBurned = useMemo(() => stepsToCalories(stepsCount, user.weight), [stepsCount, user.weight]);
  const distanceKm = useMemo(() => stepsToDistanceKm(stepsCount, user.height), [stepsCount, user.height]);

  const weekData = useMemo(() => stepHistory.slice(-7), [stepHistory]);

  const streakCount = useMemo(() => calculateStepsStreak(stepHistory, goal), [stepHistory, goal]);
  const bestDay = useMemo(() => calculateBestDay(stepHistory), [stepHistory]);
  const avgSteps = useMemo(() => calculateAverageSteps(stepHistory), [stepHistory]);
  const weeklyTotal = useMemo(() => weekData.reduce((s, d) => s + d.steps, 0), [weekData]);

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

  // Suggestions list
  const stepSuggestions = useMemo(() => {
    const waterTotal = waterLogs.reduce((s, l) => s + l.ml, 0);
    const bmiResult = getBMIResult(user.weight, user.height);
    return generateSuggestions({
      bmiResult,
      stepsPct: progress,
      weightTrend,
      waterPct: waterTotal / user.waterGoal,
    }).filter((s) => s.category === 'exercise').slice(0, 2);
  }, [user.weight, user.height, progress, weightTrend, waterLogs, user.waterGoal]);

  const handleAddSteps = useCallback(() => {
    const val = parseInt(manualInput, 10);
    if (!isNaN(val) && val > 0) {
      triggerHaptic('success');
      addManualSteps(val);
      setManualInput('');
      setShowAddModal(false);
    }
  }, [manualInput, addManualSteps]);

  const handleQuickAdd = useCallback((amount: number) => {
    triggerHaptic('success');
    addManualSteps(amount);
    setShowAddModal(false);
    setManualInput('');
  }, [addManualSteps]);

  const handleSaveGoal = useCallback(() => {
    const val = parseInt(goalInput, 10);
    if (!isNaN(val) && val >= 1000) {
      triggerHaptic('success');
      updateStepsGoal(val);
      setShowGoalModal(false);
    }
  }, [goalInput, updateStepsGoal]);

  const handleOpenAddModal = useCallback(() => {
    triggerHaptic('selection');
    setManualInput('');
    setShowAddModal(true);
  }, []);

  const handleCloseAddModal = useCallback(() => {
    setShowAddModal(false);
  }, []);

  const handleOpenGoalModal = useCallback(() => {
    triggerHaptic('selection');
    setGoalInput(user.stepsGoal.toString());
    setShowGoalModal(true);
  }, [user.stepsGoal]);

  const handleCloseGoalModal = useCallback(() => {
    setShowGoalModal(false);
  }, []);

  return {
    stepsCount,
    activeMinutes,
    stepHistory,
    user,
    goal,
    progress,
    caloriesBurned,
    distanceKm,
    weekData,
    streakCount,
    bestDay,
    avgSteps,
    weeklyTotal,
    stepSuggestions,
    goalView,
    setGoalView,
    showAddModal,
    handleOpenAddModal,
    handleCloseAddModal,
    showGoalModal,
    handleOpenGoalModal,
    handleCloseGoalModal,
    manualInput,
    setManualInput,
    goalInput,
    setGoalInput,
    handleAddSteps,
    handleQuickAdd,
    handleSaveGoal,
  };
}
