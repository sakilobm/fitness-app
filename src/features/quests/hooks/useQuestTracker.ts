/**
 * @hook useQuestTracker
 * @module Features/Quests/Hooks
 * @description Decoupled calculations and performance engine for daily challenges and user-created custom quests. Selector layer over Zustand store.
 * 
 * @param {None} - (Inputs): Consumes user level, goals, step counters, logs, sleep metrics, and custom quest configurations from the Zustand fitness store via granular select functions.
 * @process (Internal Logic):
 *          - Granular selectors wrapped in `useShallow` to prevent unnecessary component thrashing.
 *          - Performance: Memoizes selected date metrics, monthly summaries, quest completion rates, and quest lists via `useMemo`.
 *          - Restricts haptic feedback calls and sharing actions using React `useCallback` references.
 * @returns {UseQuestTrackerResult} (Outputs): Memoized state metrics, navigation handlers, custom quest CRUD setters, and sharing utilities.
 */

import { useState, useMemo, useCallback } from 'react';
import { useFitnessStore } from '@/store/fitnessStore';
import { useShallow } from 'zustand/react/shallow';
import { triggerHaptic } from '@/utils/haptics';
import { buildCalendarDays, MONTH_NAMES } from '../utils/questDateUtils';
import { Share, Alert } from 'react-native';

export function useQuestTracker() {
  // Select state fields from Zustand store using select functions
  const store = useFitnessStore(useShallow((s) => ({
    user: s.user,
    setUser: s.setUser,
    stepsCount: s.stepsCount,
    stepHistory: s.stepHistory,
    waterLogs: s.waterLogs,
    dailyLogs: s.dailyLogs,
    sleepLogs: s.sleepLogs,
    workoutLogs: s.workoutLogs,
    activeMinutes: s.activeMinutes,
    meals: s.meals,
    customQuests: s.customQuests,
    customQuestLogs: s.customQuestLogs,
    addCustomQuest: s.addCustomQuest,
    updateCustomQuest: s.updateCustomQuest,
    deleteCustomQuest: s.deleteCustomQuest,
    logCustomQuestProgress: s.logCustomQuestProgress,
  })));

  const {
    user,
    setUser,
    stepsCount,
    stepHistory,
    waterLogs,
    dailyLogs,
    sleepLogs,
    workoutLogs,
    activeMinutes,
    meals,
    customQuests,
    customQuestLogs,
    addCustomQuest,
    updateCustomQuest,
    deleteCustomQuest,
    logCustomQuestProgress,
  } = store;

  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => {
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${today.getFullYear()}-${month}-${day}`;
  }, [today]);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const handlePrevMonth = useCallback(() => {
    triggerHaptic('selection');
    setViewMonth((prev) => {
      if (prev === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    triggerHaptic('selection');
    setViewMonth((prev) => {
      if (prev === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  }, []);

  // Helper date metrics resolvers
  const getStepsForDate = useCallback((d: string) => {
    if (d === todayStr) return stepsCount;
    return stepHistory.find((h) => h.date === d)?.steps || 0;
  }, [stepsCount, stepHistory, todayStr]);

  const getWaterForDate = useCallback((d: string) => {
    if (d === todayStr) return waterLogs.reduce((s, l) => s + l.ml, 0);
    return dailyLogs.find((h) => h.date === d)?.waterMl || 0;
  }, [waterLogs, dailyLogs, todayStr]);

  const getCaloriesForDate = useCallback((d: string) => {
    if (d === todayStr) return meals.reduce((s, m) => s + m.items.reduce((a, i) => a + i.kcal, 0), 0);
    return dailyLogs.find((h) => h.date === d)?.caloriesKcal || 0;
  }, [meals, dailyLogs, todayStr]);

  const getSleepForDate = useCallback((d: string) => {
    const logs = sleepLogs.filter((l) => l.date === d);
    return logs.reduce((s, l) => s + l.totalMin, 0);
  }, [sleepLogs]);

  const getActiveMinForDate = useCallback((d: string) => {
    if (d === todayStr) return activeMinutes;
    const workouts = workoutLogs.filter((w) => w.date === d);
    return workouts.reduce((s, w) => s + w.durationMin, 0);
  }, [activeMinutes, workoutLogs, todayStr]);

  const isOzUnit = useCallback((usr: typeof user) => {
    return usr.volumeUnit === 'oz';
  }, []);

  // Main quest calculator per date
  const getQuestStatus = useCallback((d: string) => {
    const steps = getStepsForDate(d);
    const stepsGoal = user.stepsGoal || 10000;
    const water = getWaterForDate(d);
    const waterGoal = user.waterGoal || 2500;
    const calories = getCaloriesForDate(d);
    const calorieGoal = user.calorieGoal || 2000;
    const sleep = getSleepForDate(d);
    const sleepGoal = (user.sleepGoal || 8) * 60; // in minutes
    const active = getActiveMinForDate(d);
    const activeGoal = user.activeMinutesGoal || 30; // standard daily active minutes standard goal

    const list = [
      { id: 'steps', name: 'Steps Challenge', icon: 'footsteps', color: '#6366F1', progress: steps, target: stepsGoal, unit: 'steps', completed: steps >= stepsGoal },
      { id: 'water', name: 'Hydration Target', icon: 'water', color: '#38BDF8', progress: water, target: waterGoal, unit: isOzUnit(user) ? 'oz' : 'ml', completed: water >= waterGoal },
      { id: 'calories', name: 'Calorie Intake', icon: 'nutrition', color: '#FB923C', progress: calories, target: calorieGoal, unit: 'kcal', completed: calories >= calorieGoal },
      { id: 'sleep', name: 'Rest & Recovery', icon: 'moon', color: '#818CF8', progress: sleep, target: sleepGoal, unit: 'min', completed: sleep >= sleepGoal },
      { id: 'workouts', name: 'Active Exercise', icon: 'barbell', color: '#F43F5E', progress: active, target: activeGoal, unit: 'min', completed: active >= activeGoal }
    ];

    const completed = list.filter((q) => q.completed).length;
    return { quests: list, completedCount: completed, totalCount: list.length };
  }, [
    user,
    getStepsForDate,
    getWaterForDate,
    getCaloriesForDate,
    getSleepForDate,
    getActiveMinForDate,
    isOzUnit
  ]);

  // Monthly calendar days builder
  const calDays = useMemo(() => {
    return buildCalendarDays(viewYear, viewMonth);
  }, [viewYear, viewMonth]);

  // Selected Date Quest Info
  const selectedDayInfo = useMemo(() => {
    return getQuestStatus(selectedDate);
  }, [selectedDate, getQuestStatus]);

  // Monthly stats calculations
  const monthStats = useMemo(() => {
    const loggedDays = calDays.filter((d): d is string => d !== null);

    let totalCompleted = 0;
    let perfectDays = 0;
    let daysWithQuests = 0;

    // Track quest-level stats
    const questCompletionStats = { steps: 0, water: 0, calories: 0, sleep: 0, workouts: 0 };

    loggedDays.forEach((date) => {
      const status = getQuestStatus(date);
      if (status.completedCount > 0) {
        daysWithQuests++;
        totalCompleted += status.completedCount;
      }
      if (status.completedCount === 5) {
        perfectDays++;
      }
      status.quests.forEach((q) => {
        if (q.completed) {
          if (q.id === 'steps') questCompletionStats.steps++;
          if (q.id === 'water') questCompletionStats.water++;
          if (q.id === 'calories') questCompletionStats.calories++;
          if (q.id === 'sleep') questCompletionStats.sleep++;
          if (q.id === 'workouts') questCompletionStats.workouts++;
        }
      });
    });

    const totalPossibleQuests = loggedDays.length * 5;
    const rate = totalPossibleQuests > 0 ? Math.round((totalCompleted / totalPossibleQuests) * 100) : 0;

    return {
      completionRate: rate,
      perfectDays,
      daysWithQuests,
      questBreakdown: questCompletionStats,
      totalDays: loggedDays.length
    };
  }, [calDays, getQuestStatus]);

  // Sharing Summary
  const handleShareSummary = useCallback(async () => {
    triggerHaptic('success');
    const msg = `🏆 My Daily Quests Progress Summary for ${MONTH_NAMES[viewMonth]} ${viewYear}:\n\n` +
      `🔥 Overall Quest Completion Rate: ${monthStats.completionRate}%\n` +
      `⭐ Perfect 5/5 Days: ${monthStats.perfectDays} days\n` +
      `💪 Level ${user.level} — Consistency beats intensity!\n\n` +
      `Track your fitness targets daily with Vividly! 🚀`;

    try {
      await Share.share({ message: msg });
    } catch {
      Alert.alert('Sharing failed', 'Unable to initiate sharing interface.');
    }
  }, [viewMonth, viewYear, monthStats, user.level]);

  const getCustomQuestsForDate = useCallback((d: string) => {
    return customQuests.filter((q) => {
      if (d < q.startDate) return false;
      if (q.durationDays <= 0) return true; // Ongoing / permanent

      const start = new Date(q.startDate + 'T00:00:00');
      const current = new Date(d + 'T00:00:00');
      const diffTime = current.getTime() - start.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays < q.durationDays;
    }).map((q) => {
      const log = customQuestLogs.find((l) => l.questId === q.id && l.date === d);
      const progress = log ? log.progress : 0;
      const completed = progress >= q.target;
      return {
        ...q,
        progress,
        completed
      };
    });
  }, [customQuests, customQuestLogs]);

  return {
    user,
    viewYear,
    viewMonth,
    selectedDate,
    setSelectedDate,
    handlePrevMonth,
    handleNextMonth,
    calDays,
    selectedDayInfo,
    monthStats,
    handleShareSummary,
    getQuestStatus,
    customQuests,
    customQuestLogs,
    getCustomQuestsForDate,
    addCustomQuest,
    updateCustomQuest,
    deleteCustomQuest,
    logCustomQuestProgress,
    setUser,
  };
}
