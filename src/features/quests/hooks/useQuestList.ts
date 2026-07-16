import { useMemo, useState, useCallback } from 'react';
import { useFitnessStore } from '@/store/fitnessStore';
import { useShallow } from 'zustand/react/shallow';
import { mlToOz, ozToMl } from '@/utils/units';
import { triggerHaptic } from '@/utils/haptics';
import { router } from 'expo-router';
import type { QuestItemType } from '../types';

export function useQuestList() {
  const [completedExpanded, setCompletedExpanded] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);

  // Zustand selector state consumption
  const {
    user,
    meals,
    waterLogs,
    stepsCount,
    activeMinutes,
    sleepLogs,
    addWaterLog,
    addSteps,
    addFoodToMeal,
    addSleepLog,
    addActiveMinutes,
    setUser,
  } = useFitnessStore(useShallow((s) => ({
    user:             s.user,
    meals:            s.meals,
    waterLogs:        s.waterLogs,
    stepsCount:       s.stepsCount,
    activeMinutes:    s.activeMinutes,
    sleepLogs:        s.sleepLogs,
    addWaterLog:      s.addWaterLog,
    addSteps:         s.addSteps,
    addFoodToMeal:    s.addFoodToMeal,
    addSleepLog:      s.addSleepLog,
    addActiveMinutes: s.addActiveMinutes,
    setUser:          s.setUser,
  })));

  const isOz = user.volumeUnit === 'oz';
  const todayISO = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Goal Inputs local states
  const [stepsInput, setStepsInput] = useState(10000);
  const [waterInput, setWaterInput] = useState(2500);
  const [calorieInput, setCalorieInput] = useState(2300);
  const [sleepInput, setSleepInput] = useState(8);
  const [workoutInput, setWorkoutInput] = useState(4);
  const [exerciseInput, setExerciseInput] = useState(30);
  const [goalsDurationInput, setGoalsDurationInput] = useState(0);

  const openGoalsModal = useCallback(() => {
    triggerHaptic('selection');
    setStepsInput(user.stepsGoal);
    setWaterInput(isOz ? Math.round(mlToOz(user.waterGoal)) : user.waterGoal);
    setCalorieInput(user.calorieGoal);
    setSleepInput(user.sleepGoal || 8);
    setWorkoutInput(user.workoutGoal);
    setExerciseInput(user.activeMinutesGoal || 30);
    setGoalsDurationInput(user.goalsDurationDays || 0);
    setShowGoalsModal(true);
  }, [user, isOz]);

  const handleSaveGoals = useCallback(() => {
    triggerHaptic('success');
    const hasDurationChanged = user.goalsDurationDays !== goalsDurationInput;
    setUser({
      stepsGoal: stepsInput,
      waterGoal: isOz ? Math.round(ozToMl(waterInput)) : waterInput,
      calorieGoal: calorieInput,
      sleepGoal: sleepInput,
      workoutGoal: workoutInput,
      activeMinutesGoal: exerciseInput,
      goalsDurationDays: goalsDurationInput,
      goalsStartDate: goalsDurationInput > 0
        ? (hasDurationChanged ? todayISO : (user.goalsStartDate || todayISO))
        : undefined,
    });
    setShowGoalsModal(false);
  }, [stepsInput, waterInput, calorieInput, sleepInput, workoutInput, exerciseInput, goalsDurationInput, isOz, setUser, user.goalsDurationDays, user.goalsStartDate, todayISO]);

  const closeGoalsModal = useCallback(() => {
    setShowGoalsModal(false);
  }, []);

  // Derived state values
  const totalWaterMl = useMemo(
    () => waterLogs.reduce((sum, w) => sum + w.ml, 0),
    [waterLogs]
  );

  const nutritionKcal = useMemo(() => {
    let kcal = 0;
    for (const m of meals) {
      for (const item of m.items) {
        kcal += item.kcal;
      }
    }
    return kcal;
  }, [meals]);

  const todaySleepMin = useMemo(() => {
    const todaySleep = sleepLogs.find(l => l.date === todayISO);
    return todaySleep ? todaySleep.totalMin : 0;
  }, [sleepLogs, todayISO]);

  // Handle operations wrapped in callback to maintain reference stability for children
  const handleQuickLogWater = useCallback((amount: number) => {
    triggerHaptic('selection');
    const ml = isOz ? ozToMl(amount) : amount;
    addWaterLog(ml);
  }, [isOz, addWaterLog]);

  const handleCompleteRemainingWater = useCallback(() => {
    triggerHaptic('success');
    const remaining = Math.max(0, user.waterGoal - totalWaterMl);
    if (remaining > 0) addWaterLog(remaining);
  }, [user.waterGoal, totalWaterMl, addWaterLog]);

  const handleQuickLogSteps = useCallback((amount: number) => {
    triggerHaptic('selection');
    addSteps(amount);
  }, [addSteps]);

  const handleCompleteRemainingSteps = useCallback(() => {
    triggerHaptic('success');
    const remaining = Math.max(0, user.stepsGoal - stepsCount);
    if (remaining > 0) addSteps(remaining);
  }, [user.stepsGoal, stepsCount, addSteps]);

  const handleQuickLogCalories = useCallback((amount: number) => {
    triggerHaptic('selection');
    addFoodToMeal('snacks', {
      name: 'Quick Log',
      grams: 100,
      kcal: amount,
      protein: 0,
      carbs: 0,
      fat: 0,
    });
  }, [addFoodToMeal]);

  const handleCompleteRemainingCalories = useCallback(() => {
    triggerHaptic('success');
    const remaining = Math.max(0, user.calorieGoal - nutritionKcal);
    if (remaining > 0) {
      addFoodToMeal('snacks', {
        name: 'Goal Completion Log',
        grams: 100,
        kcal: remaining,
        protein: 0,
        carbs: 0,
        fat: 0,
      });
    }
  }, [user.calorieGoal, nutritionKcal, addFoodToMeal]);

  const handleQuickLogSleep = useCallback((amount: number) => {
    triggerHaptic('selection');
    const deep = Math.round(amount * 0.2);
    const rem = Math.round(amount * 0.25);
    const light = Math.round(amount * 0.5);
    const awake = Math.round(amount * 0.05);
    addSleepLog({
      date: todayISO,
      bedtime: '23:00',
      wakeTime: '07:00',
      totalMin: amount,
      deepMin: deep,
      remMin: rem,
      lightMin: light,
      awakeMin: awake,
      wakeUps: 1,
      cycles: Math.round(amount / 90),
      score: Math.min(100, Math.max(60, 80 + Math.round((amount - 480) / 10))),
      notes: 'Logged from Daily Quests widget',
    });
  }, [todayISO, addSleepLog]);

  const handleCompleteRemainingSleep = useCallback(() => {
    triggerHaptic('success');
    const sleepTargetHours = user.sleepGoal || 8;
    const remaining = Math.max(0, (sleepTargetHours * 60) - todaySleepMin);
    if (remaining > 0) {
      addSleepLog({
        date: todayISO,
        bedtime: '23:00',
        wakeTime: '07:00',
        totalMin: remaining,
        deepMin: Math.round(remaining * 0.2),
        remMin: Math.round(remaining * 0.2),
        lightMin: Math.round(remaining * 0.5),
        awakeMin: Math.round(remaining * 0.1),
        wakeUps: 0,
        cycles: 3,
        score: 75,
        notes: 'Completed remaining sleep target',
      });
    }
  }, [user.sleepGoal, todaySleepMin, todayISO, addSleepLog]);

  const handleQuickLogWorkouts = useCallback((amount: number) => {
    triggerHaptic('selection');
    addActiveMinutes(amount);
  }, [addActiveMinutes]);

  const handleCompleteRemainingWorkouts = useCallback(() => {
    triggerHaptic('success');
    const activeTarget = 30;
    const remaining = Math.max(0, activeTarget - activeMinutes);
    if (remaining > 0) addActiveMinutes(remaining);
  }, [activeMinutes, addActiveMinutes]);

  // Quests configuration mapping (memoized)
  const quests = useMemo<QuestItemType[]>(() => {
    const list: QuestItemType[] = [];

    // 1. Water Intake
    const waterTarget = isOz ? Math.round(mlToOz(user.waterGoal)) : user.waterGoal;
    const waterProgress = isOz ? Math.round(mlToOz(totalWaterMl)) : totalWaterMl;
    list.push({
      id: 'water',
      title: 'Stay Hydrated',
      subtext: isOz ? `${waterProgress} / ${waterTarget} oz` : `${(waterProgress / 1000).toFixed(1)} / ${(waterTarget / 1000).toFixed(1)} L`,
      icon: 'water',
      iconLib: 'Ionicons',
      color: '#38BDF8',
      progress: waterProgress,
      target: waterTarget,
      unit: isOz ? 'oz' : 'ml',
      completed: totalWaterMl >= user.waterGoal,
      actions: isOz
        ? [{ label: '+8oz', amount: 8 }, { label: '+16oz', amount: 16 }, { label: '+24oz', amount: 24 }]
        : [{ label: '+250ml', amount: 250 }, { label: '+500ml', amount: 500 }, { label: '+1L', amount: 1000 }],
      onQuickLog: handleQuickLogWater,
      onCompleteRemaining: handleCompleteRemainingWater,
      onPress: () => {
        triggerHaptic('selection');
        router.push('/water');
      }
    });

    // 2. Steps Target
    list.push({
      id: 'steps',
      title: 'Active Walk Steps',
      subtext: `${stepsCount.toLocaleString()} / ${user.stepsGoal.toLocaleString()} steps`,
      icon: 'footsteps',
      iconLib: 'Ionicons',
      color: '#A3E635',
      progress: stepsCount,
      target: user.stepsGoal,
      unit: 'steps',
      completed: stepsCount >= user.stepsGoal,
      actions: [{ label: '+1k', amount: 1000 }, { label: '+2k', amount: 2000 }, { label: '+5k', amount: 5000 }],
      onQuickLog: handleQuickLogSteps,
      onCompleteRemaining: handleCompleteRemainingSteps,
      onPress: () => {
        triggerHaptic('selection');
        router.push('/steps');
      }
    });

    // 3. Calorie Goal
    list.push({
      id: 'calories',
      title: 'Calorie Intake target',
      subtext: `${nutritionKcal.toLocaleString()} / ${user.calorieGoal.toLocaleString()} kcal`,
      icon: 'food-apple',
      iconLib: 'MCI',
      color: '#FB923C',
      progress: nutritionKcal,
      target: user.calorieGoal,
      unit: 'kcal',
      completed: nutritionKcal >= user.calorieGoal,
      actions: [{ label: '+150kcal', amount: 150 }, { label: '+300kcal', amount: 300 }, { label: '+500kcal', amount: 500 }],
      onQuickLog: handleQuickLogCalories,
      onCompleteRemaining: handleCompleteRemainingCalories,
      onPress: () => {
        triggerHaptic('selection');
        router.push('/(tabs)/nutrition' as any);
      }
    });

    // 4. Sleep Target
    const sleepTargetHours = user.sleepGoal || 8;
    const sleepProgressHours = parseFloat((todaySleepMin / 60).toFixed(1));
    list.push({
      id: 'sleep',
      title: 'Night Sleep Rest',
      subtext: `${sleepProgressHours} / ${sleepTargetHours} hrs`,
      icon: 'moon',
      iconLib: 'Ionicons',
      color: '#818CF8',
      progress: todaySleepMin,
      target: sleepTargetHours * 60,
      unit: 'min',
      completed: todaySleepMin >= (sleepTargetHours * 60),
      actions: [
        { label: 'Log 6h', amount: 360 },
        { label: 'Log 7h', amount: 420 },
        { label: 'Log 8h', amount: 480 },
        { label: 'Log 9h', amount: 540 }
      ],
      onQuickLog: handleQuickLogSleep,
      onCompleteRemaining: handleCompleteRemainingSleep,
      onPress: () => {
        triggerHaptic('selection');
        router.push('/(tabs)/sleep' as any);
      }
    });

    // 5. Workout / Active Minutes
    const activeTarget = 30;
    list.push({
      id: 'workouts',
      title: 'Active Exercise',
      subtext: `${activeMinutes} / ${activeTarget} active min`,
      icon: 'dumbbell',
      iconLib: 'MCI',
      color: '#F43F5E',
      progress: activeMinutes,
      target: activeTarget,
      unit: 'min',
      completed: activeMinutes >= activeTarget,
      actions: [{ label: '+15 min', amount: 15 }, { label: '+30 min', amount: 30 }],
      onQuickLog: handleQuickLogWorkouts,
      onCompleteRemaining: handleCompleteRemainingWorkouts,
      onPress: () => {
        triggerHaptic('selection');
        router.push('/workouts');
      }
    });

    return list;
  }, [
    user.waterGoal,
    user.stepsGoal,
    user.calorieGoal,
    user.sleepGoal,
    totalWaterMl,
    stepsCount,
    nutritionKcal,
    todaySleepMin,
    activeMinutes,
    isOz,
    handleQuickLogWater,
    handleCompleteRemainingWater,
    handleQuickLogSteps,
    handleCompleteRemainingSteps,
    handleQuickLogCalories,
    handleCompleteRemainingCalories,
    handleQuickLogSleep,
    handleCompleteRemainingSleep,
    handleQuickLogWorkouts,
    handleCompleteRemainingWorkouts,
  ]);

  const activeQuests = useMemo(() => quests.filter(q => !q.completed), [quests]);
  const completedQuests = useMemo(() => quests.filter(q => q.completed), [quests]);

  const toggleCompletedSection = useCallback(() => {
    triggerHaptic('selection');
    setCompletedExpanded(prev => !prev);
  }, []);

  return {
    quests,
    activeQuests,
    completedQuests,
    completedExpanded,
    toggleCompletedSection,
    showGoalsModal,
    openGoalsModal,
    closeGoalsModal,
    handleSaveGoals,
    stepsInput,
    setStepsInput,
    waterInput,
    setWaterInput,
    calorieInput,
    setCalorieInput,
    sleepInput,
    setSleepInput,
    workoutInput,
    setWorkoutInput,
    exerciseInput,
    setExerciseInput,
    goalsDurationInput,
    setGoalsDurationInput,
    isOz,
  };
}
