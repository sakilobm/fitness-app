import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import {
  FoodItem, Meal, LogEntry, ReminderItem, UserProfile, WeightLog, StepLog, BMILog,
  DailyLog, SleepLog,
  HeartRateLog, BloodPressureLog, BloodGlucoseLog, OxygenLog,
  Badge, XPGainEvent,
  CycleLog, CycleSettings,
} from '../types';
import { computeSleepScore, estimateStages } from '../constants/sleep';
import { calculateBMI, classifyBMI } from '../utils/bmi';
import { stepsToCalories, stepsToDistanceKm, getDateStr } from '../utils/steps';
import { zustandMMKVStorage, mmkvSaveLog, mmkvDeleteLog, mmkvHydrateLogs } from '../utils/mmkvStorage';
import {
  XP_TABLE, applyXPGain, createInitialBadges, computeRewardStats, checkBadge,
} from '../constants/rewards';

interface FitnessState {
  // User Profile
  user: UserProfile;
  setUser: (user: Partial<UserProfile>) => void;
  updateUserGoal: (goal: string) => void;
  updateUserMotto: (motto: string) => void;

  // Weight Tracking
  weightLogs: WeightLog[];
  addWeightLog: (weight: number, timeOfDay: 'morning' | 'afternoon' | 'night', dateOffset?: 'today' | 'yesterday') => void;
  deleteWeightLog: (id: string) => void;

  // Nutrition/Food Tracking
  meals: Meal[];
  setMeals: (updater: Meal[] | ((meals: Meal[]) => Meal[])) => void;
  addFoodToMeal: (mealId: string, item: FoodItem) => void;
  deleteFoodFromMeal: (mealId: string, itemIndex: number) => void;

  // Water Hydration
  waterLogs: LogEntry[];
  addWaterLog: (ml: number) => void;
  deleteWaterLog: (id: string) => void;
  setWaterGoal: (goal: number) => void;

  // Reminders
  reminders: ReminderItem[];
  addReminder: (reminder: Omit<ReminderItem, 'id'>) => void;
  updateReminder: (id: string, reminder: Partial<ReminderItem>) => void;
  deleteReminder: (id: string) => void;
  toggleReminder: (id: string) => void;

  // Steps / Activity
  stepsCount: number;
  activeMinutes: number;
  stepHistory: StepLog[];
  addSteps: (steps: number) => void;
  addManualSteps: (steps: number) => void;
  updateStepsGoal: (goal: number) => void;

  // Dashboard Grid Layout Preferences
  dashboardGrid: string[];
  setDashboardGrid: (grid: string[]) => void;
  toggleWidgetVisibility: (id: string) => void;

  // App Theme Preference
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;

  // Calendar daily snapshots
  dailyLogs: DailyLog[];
  upsertDailyLog: (log: DailyLog) => void;

  // Sleep tracking
  sleepLogs: SleepLog[];
  addSleepLog: (log: Omit<SleepLog, 'id'>) => void;
  deleteSleepLog: (id: string) => void;
  updateSleepLog: (id: string, updates: Partial<Omit<SleepLog, 'id'>>) => void;

  // Vitals
  heartRateLogs:     HeartRateLog[];
  addHeartRate:      (log: Omit<HeartRateLog, 'id'>) => void;
  deleteHeartRate:   (id: string) => void;

  bloodPressureLogs:  BloodPressureLog[];
  addBloodPressure:   (log: Omit<BloodPressureLog, 'id'>) => void;
  deleteBloodPressure:(id: string) => void;

  bloodGlucoseLogs:  BloodGlucoseLog[];
  addBloodGlucose:   (log: Omit<BloodGlucoseLog, 'id'>) => void;
  deleteBloodGlucose:(id: string) => void;

  oxygenLogs:        OxygenLog[];
  addOxygen:         (log: Omit<OxygenLog, 'id'>) => void;
  deleteOxygen:      (id: string) => void;

  // Rewards — XP, Levels & Badges
  badges:    Badge[];
  xpHistory: XPGainEvent[];
  addXP:     (amount: number, reason: string, icon: Badge['icon']) => { leveledUp: boolean; newLevel: number };

  // Cycle Tracking
  cycleLogs:    CycleLog[];
  cycleSettings: CycleSettings;
  addCycleLog:      (log: Omit<CycleLog, 'id'>) => void;
  updateCycleLog:   (id: string, patch: Partial<CycleLog>) => void;
  deleteCycleLog:   (id: string) => void;
  updateCycleSettings: (patch: Partial<CycleSettings>) => void;
  checkAndUnlockBadges: () => Badge[];
  /** Same as checkAndUnlockBadges but with NO XP awards and NO celebration return —
   * called once on startup to silently mark badges already earned by pre-existing data,
   * preventing retroactive celebrations when the user takes their first new action. */
  silentPrimeBadges: () => void;

  // Hydration state
  hydrateStore: () => Promise<void>;
  
  // Backend Sync
  initializeFromSupabase: () => Promise<void>;
}

// Initial Values matching AppContext
const initialUserProfile: UserProfile = {
  name: 'Sakil',
  age: 24,
  height: 178,
  weight: 78.4,
  goal: 'Strength Training',
  motto: 'Consistency beats intensity!',
  calorieGoal: 2300,
  waterGoal: 2500,
  stepsGoal: 10000,
  workoutGoal: 4,
  level: 8,
  xp: 850,
  streak: 14,
  profilePic: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150&auto=format&fit=crop&q=80',
  weightUnit: 'kg',
  volumeUnit: 'ml',
  notificationsEnabled: true,
  hapticsEnabled: true,
  privateProfileEnabled: false,
  appLockEnabled: false,
  setupCompleted: false,
};

const initialMeals: Meal[] = [
  {
    id: 'breakfast', label: 'Breakfast', icon: '🌅', expanded: true,
    items: [
      { name: 'Oats with banana', grams: 300, kcal: 340, protein: 12, carbs: 58, fat: 6 },
      { name: 'Greek yoghurt', grams: 150, kcal: 140, protein: 14, carbs: 8, fat: 4 },
    ],
  },
  {
    id: 'lunch', label: 'Lunch', icon: '☀️', expanded: false,
    items: [
      { name: 'Chicken rice bowl', grams: 450, kcal: 520, protein: 38, carbs: 62, fat: 10 },
      { name: 'Side salad', grams: 120, kcal: 45, protein: 2, carbs: 8, fat: 1 },
    ],
  },
  {
    id: 'dinner', label: 'Dinner', icon: '🌙', expanded: false,
    items: [
      { name: 'Salmon & veggies', grams: 380, kcal: 420, protein: 36, carbs: 20, fat: 18 },
    ],
  },
  {
    id: 'snacks', label: 'Snacks', icon: '🍎', expanded: false,
    items: [
      { name: 'Protein bar', grams: 60, kcal: 200, protein: 20, carbs: 24, fat: 6 },
    ],
  },
];

const getPastDateStr = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

const initialWeightValues = [
  84.8, 84.5, 84.6, 84.1, 83.9, 83.5, 83.2, 82.9, 82.5, 82.8,
  82.1, 81.9, 81.5, 81.2, 80.9, 81.1, 80.5, 80.1, 79.8, 79.5,
  79.2, 78.9, 79.1, 78.6, 78.4, 78.1, 78.3, 78.0, 77.8, 78.4
];

const generateInitialWeightLogs = (): WeightLog[] => {
  const logs: WeightLog[] = [];
  for (let i = 29; i >= 2; i--) {
    logs.push({
      id: `w_past_${i}`,
      weight: initialWeightValues[29 - i] || 78.4,
      date: getPastDateStr(i),
      timeOfDay: 'morning',
    });
  }
  logs.push({ id: 'w_yest_m', weight: 77.8, date: getPastDateStr(1), timeOfDay: 'morning' });
  logs.push({ id: 'w_yest_n', weight: 78.1, date: getPastDateStr(1), timeOfDay: 'night' });
  logs.push({ id: 'w_tod_m', weight: 78.4, date: getPastDateStr(0), timeOfDay: 'morning' });
  logs.push({ id: 'w_tod_a', weight: 78.9, date: getPastDateStr(0), timeOfDay: 'afternoon' });
  logs.push({ id: 'w_tod_n', weight: 78.6, date: getPastDateStr(0), timeOfDay: 'night' });
  return logs;
};

const initialReminders: ReminderItem[] = [
  {
    id: 'r1', category: 'Water',
    icon: { lib: 'Ionicons', name: 'water' },
    title: 'Drink Water',
    time: '08:00', days: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    frequency: 'Daily', enabled: true, accentColor: '#3B82F6', // Colors.chart.water
  },
  {
    id: 'r2', category: 'Water',
    icon: { lib: 'Ionicons', name: 'water-outline' },
    title: 'Afternoon Hydration',
    time: '15:00', days: ['M', 'T', 'W', 'T', 'F'],
    frequency: 'Weekdays', enabled: true, accentColor: '#3B82F6', // Colors.chart.water
  },
  {
    id: 'r3', category: 'Meals',
    icon: { lib: 'Ionicons', name: 'restaurant' },
    title: 'Log Breakfast',
    time: '07:30', days: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    frequency: 'Daily', enabled: true, accentColor: '#F59E0B', // Colors.amber
  },
  {
    id: 'r4', category: 'Meals',
    icon: { lib: 'Ionicons', name: 'restaurant-outline' },
    title: 'Log Dinner',
    time: '19:00', days: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    frequency: 'Daily', enabled: false, accentColor: '#F59E0B', // Colors.amber
  },
  {
    id: 'r5', category: 'Weigh-in',
    icon: { lib: 'MCI', name: 'scale-bathroom' },
    title: 'Morning Weigh-in',
    time: '07:00', days: ['M', 'W', 'F'],
    frequency: '3×/week', enabled: true, accentColor: '#2E7D5E', // Colors.lime
  },
  {
    id: 'r6', category: 'Body Photo',
    icon: { lib: 'Ionicons', name: 'camera' },
    title: 'Progress Photo',
    time: '08:00', days: ['M'],
    frequency: 'Weekly', enabled: true, accentColor: '#2E7D5E', // Colors.lime
  },
  {
    id: 'r7', category: 'Workout',
    icon: { lib: 'MCI', name: 'dumbbell' },
    title: 'Strength Training',
    time: '18:00', days: ['M', 'W', 'F'],
    frequency: '3×/week', enabled: true, accentColor: '#2E7D5E', // Colors.lime
  },
  {
    id: 'r8', category: 'Supplements',
    icon: { lib: 'MCI', name: 'pill' },
    title: 'Take Vitamins',
    time: '08:30', days: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    frequency: 'Daily', enabled: false, accentColor: '#0EA5E9', // Colors.chart.fibre
  },
];

const generateInitialStepHistory = (): StepLog[] => {
  const stepValues = [8400, 5200, 10300, 9100, 7800, 6240, 0];
  const history: StepLog[] = [];
  for (let i = 6; i >= 0; i--) {
    const steps = stepValues[6 - i];
    history.push({
      date: getDateStr(i),
      steps,
      caloriesBurned: Math.round(steps * 0.04 * (78.4 / 70)),
      distanceKm: parseFloat(((steps * (178 / 100) * 0.415) / 1000).toFixed(1)),
    });
  }
  return history;
};

const generateInitialSleepLogs = (): SleepLog[] => {
  // [daysAgo, bedH, bedM, wakeH, wakeM, wakeUps]
  const seed: [number, number, number, number, number, number][] = [
    [13, 23, 0,  6, 30, 1], [12, 23, 30, 7,  0, 0],
    [11,  0, 15, 6,  0, 2], [10, 23,  0, 7, 30, 0],
    [ 9, 23, 45, 6, 15, 1], [ 8, 22, 30, 6,  0, 0],
    [ 7,  0, 30, 7, 30, 1], [ 6, 23, 15, 6, 45, 0],
    [ 5, 23,  0, 5, 30, 3], [ 4, 22, 45, 7,  0, 0],
    [ 3,  0,  0, 6, 30, 2], [ 2, 23, 30, 7, 15, 1],
    [ 1, 23,  0, 6, 30, 1],
  ];
  return seed.map(([daysAgo, bh, bm, wh, wm, wakeUps]) => {
    const bedtime  = `${String(bh).padStart(2,'0')}:${String(bm).padStart(2,'0')}`;
    const wakeTime = `${String(wh).padStart(2,'0')}:${String(wm).padStart(2,'0')}`;
    const diff = (wh * 60 + wm) - (bh * 60 + bm);
    const totalMin = diff > 0 ? diff : diff + 24 * 60;
    const { deepMin, remMin, lightMin, awakeMin, cycles } = estimateStages(totalMin, wakeUps);
    const score = computeSleepScore({ totalMin, deepMin, remMin, awakeMin, wakeUps });
    const d = new Date(); d.setDate(d.getDate() - (daysAgo - 1));
    return {
      id: `sleep_seed_${daysAgo}`,
      date: d.toISOString().split('T')[0],
      bedtime, wakeTime, totalMin,
      deepMin, remMin, lightMin, awakeMin,
      wakeUps, cycles, score,
    };
  });
};

const getPastTimeStr = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - 30);
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
};

const generateInitialHRLogs = (): HeartRateLog[] => {
  const seeds: [number, number][] = [
    [13,68],[12,71],[11,65],[10,72],[9,69],[8,67],[7,73],[6,70],[5,66],[4,74],[3,68],[2,71],[1,69]
  ];
  return seeds.map(([daysAgo, bpm]) => ({
    id: `hr_seed_${daysAgo}`, date: getPastDateStr(daysAgo), time: '07:30',
    bpm, context: 'resting' as const,
  }));
};

const generateInitialBPLogs = (): BloodPressureLog[] => {
  const seeds: [number, number, number][] = [
    [13,118,76],[12,122,79],[11,119,77],[10,125,81],[9,120,78],
    [8,117,75],[7,123,80],[6,121,79],[5,119,77],[4,126,82],[3,118,76],[2,122,79],[1,120,78]
  ];
  return seeds.map(([daysAgo, sys, dia]) => ({
    id: `bp_seed_${daysAgo}`, date: getPastDateStr(daysAgo), time: '07:45',
    systolic: sys, diastolic: dia, pulse: 68, position: 'sitting' as const, arm: 'left' as const,
  }));
};

const generateInitialGlucoseLogs = (): BloodGlucoseLog[] => {
  const seeds: [number, number][] = [
    [13,92],[12,95],[11,89],[10,98],[9,91],[8,94],[7,96],[6,88],[5,97],[4,93],[3,90],[2,95],[1,92]
  ];
  return seeds.map(([daysAgo, value]) => ({
    id: `glc_seed_${daysAgo}`, date: getPastDateStr(daysAgo), time: '06:30',
    value, unit: 'mg/dL' as const, context: 'fasting' as const,
  }));
};

const generateInitialOxygenLogs = (): OxygenLog[] => {
  const seeds: [number, number][] = [
    [13,98],[12,99],[11,97],[10,98],[9,99],[8,97],[7,98],[6,99],[5,98],[4,97],[3,98],[2,99],[1,97]
  ];
  return seeds.map(([daysAgo, spo2]) => ({
    id: `o2_seed_${daysAgo}`, date: getPastDateStr(daysAgo), time: '08:00',
    spo2, pulse: 69,
  }));
};

// Available dashboard grid items by default
const defaultDashboardGrid = ['activity', 'nutrition', 'water', 'weight', 'workout_focus'];

export const useFitnessStore = create<FitnessState>()(persist((set, get) => ({
  user: initialUserProfile,
  weightLogs: generateInitialWeightLogs(),
  meals: initialMeals,
  waterLogs: [
    { id: '1', time: '07:15', ml: 250 },
    { id: '2', time: '09:30', ml: 500 },
    { id: '3', time: '11:00', ml: 250 },
    { id: '4', time: '13:45', ml: 200 },
  ],
  reminders: initialReminders,
  stepsCount: 6240,
  activeMinutes: 48,
  stepHistory: generateInitialStepHistory(),
  dashboardGrid: defaultDashboardGrid,
  isDarkMode: true,
  dailyLogs: [],
  sleepLogs: generateInitialSleepLogs(),
  heartRateLogs:    generateInitialHRLogs(),
  bloodPressureLogs: generateInitialBPLogs(),
  bloodGlucoseLogs:  generateInitialGlucoseLogs(),
  oxygenLogs:        generateInitialOxygenLogs(),

  badges:    createInitialBadges(),
  xpHistory: [],

  cycleLogs: [],
  cycleSettings: { cycleLength: 28, periodLength: 5, lastPeriodStart: null },

  addCycleLog: (log) => {
    const entry: CycleLog = { ...log, id: `cycle_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` };
    set((s) => ({ cycleLogs: [entry, ...s.cycleLogs].sort((a, b) => b.date.localeCompare(a.date)) }));
  },
  updateCycleLog: (id, patch) => {
    set((s) => ({ cycleLogs: s.cycleLogs.map((l) => (l.id === id ? { ...l, ...patch } : l)) }));
  },
  deleteCycleLog: (id) => {
    set((s) => ({ cycleLogs: s.cycleLogs.filter((l) => l.id !== id) }));
  },
  updateCycleSettings: (patch) => {
    set((s) => ({ cycleSettings: { ...s.cycleSettings, ...patch } }));
  },

  addXP: (amount, reason, icon) => {
    const state = get();
    const result = applyXPGain(state.user.xp, state.user.level, amount);

    const now = new Date();
    const event: XPGainEvent = {
      id:     `xp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      date:   getPastDateStr(0),
      time:   now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      amount,
      reason,
      icon,
    };

    set((s) => ({
      user:      { ...s.user, xp: result.xp, level: result.level },
      xpHistory: [event, ...s.xpHistory].slice(0, 40),
    }));

    return { leveledUp: result.leveledUp, newLevel: result.level };
  },

  checkAndUnlockBadges: () => {
    const state = get();
    const stats = computeRewardStats(state);
    const nowIso = new Date().toISOString();
    const newlyUnlocked: Badge[] = [];
    let changed = false;

    const updatedBadges = state.badges.map((badge) => {
      if (badge.unlocked) return badge;
      const result = checkBadge(badge.id, stats);
      if (!result) return badge;

      if (result.met) {
        const unlocked: Badge = { ...badge, unlocked: true, unlockedAt: nowIso, progress: 1 };
        newlyUnlocked.push(unlocked);
        changed = true;
        return unlocked;
      }
      if (result.progress !== badge.progress) {
        changed = true;
        return { ...badge, progress: result.progress };
      }
      return badge;
    });

    if (changed) {
      set({ badges: updatedBadges });
    }

    newlyUnlocked.forEach((badge) => {
      get().addXP(badge.xpReward, `Unlocked "${badge.label}"`, badge.icon);
    });

    return newlyUnlocked;
  },

  silentPrimeBadges: () => {
    const state = get();
    const stats = computeRewardStats(state);
    const nowIso = new Date().toISOString();
    let changed = false;

    const updatedBadges = state.badges.map((badge) => {
      if (badge.unlocked) return badge;
      const result = checkBadge(badge.id, stats);
      if (!result) return badge;
      if (result.met) {
        changed = true;
        return { ...badge, unlocked: true, unlockedAt: nowIso, progress: 1 };
      }
      if (result.progress !== badge.progress) {
        changed = true;
        return { ...badge, progress: result.progress };
      }
      return badge;
    });

    if (changed) set({ badges: updatedBadges });
  },

  setUser: (updatedUser) => {
    set((state) => ({ user: { ...state.user, ...updatedUser } }));
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        // Map camelCase to snake_case for DB
        const dbUpdate: any = { ...updatedUser };
        if ('calorieGoal' in dbUpdate) { dbUpdate.calorie_goal = dbUpdate.calorieGoal; delete dbUpdate.calorieGoal; }
        if ('waterGoal' in dbUpdate) { dbUpdate.water_goal = dbUpdate.waterGoal; delete dbUpdate.waterGoal; }
        if ('stepsGoal' in dbUpdate) { dbUpdate.steps_goal = dbUpdate.stepsGoal; delete dbUpdate.stepsGoal; }
        if ('workoutGoal' in dbUpdate) { dbUpdate.workout_goal = dbUpdate.workoutGoal; delete dbUpdate.workoutGoal; }
        if ('profilePic' in dbUpdate) { dbUpdate.profile_pic = dbUpdate.profilePic; delete dbUpdate.profilePic; }
        if ('weightUnit' in dbUpdate) { dbUpdate.weight_unit = dbUpdate.weightUnit; delete dbUpdate.weightUnit; }
        if ('volumeUnit' in dbUpdate) { dbUpdate.volume_unit = dbUpdate.volumeUnit; delete dbUpdate.volumeUnit; }
        if ('notificationsEnabled' in dbUpdate) { dbUpdate.notifications_enabled = dbUpdate.notificationsEnabled; delete dbUpdate.notificationsEnabled; }
        if ('hapticsEnabled' in dbUpdate) { dbUpdate.haptics_enabled = dbUpdate.hapticsEnabled; delete dbUpdate.hapticsEnabled; }
        delete dbUpdate.privateProfileEnabled;
        delete dbUpdate.appLockEnabled;
        delete dbUpdate.setupCompleted;
        
        supabase.from('profiles').update(dbUpdate).eq('id', data.user.id).then();
      }
    });
  },
  
  updateUserGoal: (goal) => {
    set((state) => ({ user: { ...state.user, goal } }));
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) supabase.from('profiles').update({ goal }).eq('id', data.user.id).then();
    });
  },
  
  updateUserMotto: (motto) => {
    set((state) => ({ user: { ...state.user, motto } }));
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) supabase.from('profiles').update({ motto }).eq('id', data.user.id).then();
    });
  },

  addWeightLog: (weight, timeOfDay, dateOffset) => {
    const targetDate = getPastDateStr(dateOffset === 'yesterday' ? 1 : 0);
    const newLogId = 'w_log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const logEntry: WeightLog = { id: newLogId, weight, date: targetDate, timeOfDay };

    set((state) => {
      const newLogs = [...state.weightLogs];
      const existingIdx = newLogs.findIndex((log) => log.date === targetDate && log.timeOfDay === timeOfDay);
      if (existingIdx !== -1) {
        newLogs[existingIdx] = { ...newLogs[existingIdx], weight };
      } else {
        newLogs.push(logEntry);
      }
      
      const timeOrder: Record<string, number> = { morning: 0, afternoon: 1, night: 2 };
      const sortedLogs = newLogs.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return timeOrder[a.timeOfDay] - timeOrder[b.timeOfDay];
      });

      // Keep user profile in sync
      const latestWeight = sortedLogs[sortedLogs.length - 1]?.weight || state.user.weight;
      return {
        weightLogs: sortedLogs,
        user: { ...state.user, weight: latestWeight }
      };
    });

    mmkvSaveLog('weight', targetDate, logEntry);

    get().addXP(XP_TABLE.weightLog, 'Logged your weight', { lib: 'MCI', name: 'scale-bathroom' });
    get().checkAndUnlockBadges();

    // Supabase sync
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        supabase.from('weight_logs').insert({
          id: newLogId,
          user_id: data.user.id,
          weight,
          date: targetDate,
          time_of_day: timeOfDay
        }).then();
      }
    });
  },

  deleteWeightLog: (id) => {
    const deletedLog = get().weightLogs.find((log) => log.id === id);

    set((state) => {
      const remainingLogs = state.weightLogs.filter((log) => log.id !== id);
      const sortedLogs = remainingLogs.length > 0 ? remainingLogs : state.weightLogs;
      const latestWeight = sortedLogs[sortedLogs.length - 1]?.weight || state.user.weight;
      return {
        weightLogs: sortedLogs,
        user: { ...state.user, weight: latestWeight },
      };
    });

    if (deletedLog) {
      mmkvDeleteLog('weight', deletedLog.date, id);
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) {
          supabase.from('weight_logs').delete().eq('id', id).eq('user_id', data.user.id).then();
        }
      });
    }
  },

  setMeals: (updater) => set((state) => ({
    meals: typeof updater === 'function' ? updater(state.meals) : updater
  })),

  addFoodToMeal: (mealId, item) => {
    set((state) => {
      const updatedMeals = state.meals.map((meal) => {
        if (meal.id === mealId) {
          return { ...meal, items: [...meal.items, item] };
        }
        return meal;
      });
      return { meals: updatedMeals };
    });

    mmkvSaveLog('nutrition', getPastDateStr(0), { id: `${mealId}_${Date.now()}`, mealId, item });

    get().addXP(XP_TABLE.mealLog, 'Logged a meal', { lib: 'MCI', name: 'food-apple' });
    get().checkAndUnlockBadges();
  },

  deleteFoodFromMeal: (mealId, itemIndex) => {
    set((state) => {
      const updatedMeals = state.meals.map((meal) => {
        if (meal.id === mealId) {
          const newItems = [...meal.items];
          newItems.splice(itemIndex, 1);
          return { ...meal, items: newItems };
        }
        return meal;
      });
      return { meals: updatedMeals };
    });
  },

  addWaterLog: (ml) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const logEntry: LogEntry = {
      id: Date.now().toString(),
      time: timeStr,
      ml,
    };
    
    set((state) => ({
      waterLogs: [...state.waterLogs, logEntry],
    }));

    mmkvSaveLog('water', getPastDateStr(0), logEntry);

    get().addXP(XP_TABLE.waterLog, 'Logged water intake', { lib: 'Ionicons', name: 'water' });
    get().checkAndUnlockBadges();

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        supabase.from('water_logs').insert({
          id: logEntry.id,
          user_id: data.user.id,
          time: logEntry.time,
          ml: logEntry.ml
        }).then();
      }
    });
  },

  deleteWaterLog: (id) => {
    set((state) => ({
      waterLogs: state.waterLogs.filter((item) => item.id !== id),
    }));
    mmkvDeleteLog('water', getPastDateStr(0), id);
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        supabase.from('water_logs').delete().eq('id', id).eq('user_id', data.user.id).then();
      }
    });
  },

  setWaterGoal: (goal) => {
    set((state) => ({ user: { ...state.user, waterGoal: goal } }));
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) supabase.from('profiles').update({ water_goal: goal }).eq('id', data.user.id).then();
    });
  },

  addReminder: (reminder) => {
    const newReminder: ReminderItem = {
      ...reminder,
      id: 'rem_' + Date.now().toString(),
    };
    set((state) => ({ reminders: [...state.reminders, newReminder] }));
  },

  updateReminder: (id, partialReminder) => {
    set((state) => ({
      reminders: state.reminders.map((item) => (item.id === id ? { ...item, ...partialReminder } : item)),
    }));
  },

  deleteReminder: (id) => {
    set((state) => ({ reminders: state.reminders.filter((item) => item.id !== id) }));
  },

  toggleReminder: (id) => {
    set((state) => ({
      reminders: state.reminders.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item)),
    }));
  },

  addSteps: (steps) => {
    const prevSteps = get().stepsCount;
    const stepsGoal = get().user.stepsGoal;

    set((state) => {
      const nextSteps = state.stepsCount + steps;
      const nextActiveMinutes = state.activeMinutes + Math.round(steps / 130);
      
      // Update step history for today
      const todayStr = getPastDateStr(0);
      const updatedHistory = [...state.stepHistory];
      const todayIdx = updatedHistory.findIndex((s) => s.date === todayStr);
      
      const newLog: StepLog = {
        date: todayStr,
        steps: nextSteps,
        caloriesBurned: Math.round(nextSteps * 0.04 * (state.user.weight / 70)),
        distanceKm: parseFloat(((nextSteps * (state.user.height / 100) * 0.415) / 1000).toFixed(1)),
      };

      if (todayIdx >= 0) {
        updatedHistory[todayIdx] = newLog;
      } else {
        updatedHistory.push(newLog);
      }

      return {
        stepsCount: nextSteps,
        activeMinutes: nextActiveMinutes,
        stepHistory: updatedHistory.slice(-30),
      };
    });

    mmkvSaveLog('steps', getPastDateStr(0), { id: `s_${Date.now()}`, steps, timestamp: Date.now() });

    const nextSteps = get().stepsCount;
    if (prevSteps < stepsGoal && nextSteps >= stepsGoal) {
      get().addXP(XP_TABLE.stepGoalHit, 'Hit your daily step goal', { lib: 'Ionicons', name: 'walk' });
    }
    get().checkAndUnlockBadges();
  },

  addManualSteps: (steps) => {
    if (steps <= 0) return;
    const prevSteps = get().stepsCount;
    const stepsGoal = get().user.stepsGoal;

    set((state) => {
      const nextSteps = state.stepsCount + steps;
      const nextActiveMinutes = state.activeMinutes + Math.round(steps / 100);
      
      const todayStr = getPastDateStr(0);
      const updatedHistory = [...state.stepHistory];
      const todayIdx = updatedHistory.findIndex((s) => s.date === todayStr);
      
      const newLog: StepLog = {
        date: todayStr,
        steps: nextSteps,
        caloriesBurned: Math.round(nextSteps * 0.04 * (state.user.weight / 70)),
        distanceKm: parseFloat(((nextSteps * (state.user.height / 100) * 0.415) / 1000).toFixed(1)),
      };

      if (todayIdx >= 0) {
        updatedHistory[todayIdx] = newLog;
      } else {
        updatedHistory.push(newLog);
      }

      return {
        stepsCount: nextSteps,
        activeMinutes: nextActiveMinutes,
        stepHistory: updatedHistory.slice(-30),
      };
    });

    const nextSteps = get().stepsCount;
    if (prevSteps < stepsGoal && nextSteps >= stepsGoal) {
      get().addXP(XP_TABLE.stepGoalHit, 'Hit your daily step goal', { lib: 'Ionicons', name: 'walk' });
    }
    get().checkAndUnlockBadges();
  },

  updateStepsGoal: (goal) => set((state) => ({ user: { ...state.user, stepsGoal: goal } })),

  setDashboardGrid: (grid) => set({ dashboardGrid: grid }),

  setIsDarkMode: (value) => set({ isDarkMode: value }),

  upsertDailyLog: (log) => {
    set((state) => ({
      dailyLogs: [
        ...(state.dailyLogs || []).filter((l) => l.date !== log.date),
        log,
      ],
    }));
  },

  addSleepLog: (log) => {
    const newLog: SleepLog = { ...log, id: `sleep_${Date.now()}` };
    set((state) => ({
      sleepLogs: [newLog, ...state.sleepLogs.filter((l) => l.date !== log.date)],
    }));

    get().addXP(XP_TABLE.sleepLog, 'Logged a night of sleep', { lib: 'Ionicons', name: 'moon' });
    get().checkAndUnlockBadges();
  },

  deleteSleepLog: (id) => {
    set((state) => ({ sleepLogs: state.sleepLogs.filter((l) => l.id !== id) }));
  },

  updateSleepLog: (id, updates) => {
    set((state) => ({
      sleepLogs: state.sleepLogs.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    }));
  },

  // ── Vitals CRUD ─────────────────────────────────────────────────────────────

  addHeartRate: (log) => {
    set((state) => ({
      heartRateLogs: [{ ...log, id: `hr_${Date.now()}` }, ...state.heartRateLogs],
    }));
    get().addXP(XP_TABLE.vitalsLog, 'Logged your heart rate', { lib: 'Ionicons', name: 'heart' });
    get().checkAndUnlockBadges();
  },
  deleteHeartRate: (id) => set((state) => ({
    heartRateLogs: state.heartRateLogs.filter((l) => l.id !== id),
  })),

  addBloodPressure: (log) => {
    set((state) => ({
      bloodPressureLogs: [{ ...log, id: `bp_${Date.now()}` }, ...state.bloodPressureLogs],
    }));
    get().addXP(XP_TABLE.vitalsLog, 'Logged your blood pressure', { lib: 'Ionicons', name: 'pulse' });
    get().checkAndUnlockBadges();
  },
  deleteBloodPressure: (id) => set((state) => ({
    bloodPressureLogs: state.bloodPressureLogs.filter((l) => l.id !== id),
  })),

  addBloodGlucose: (log) => {
    set((state) => ({
      bloodGlucoseLogs: [{ ...log, id: `glc_${Date.now()}` }, ...state.bloodGlucoseLogs],
    }));
    get().addXP(XP_TABLE.vitalsLog, 'Logged your blood glucose', { lib: 'Ionicons', name: 'water' });
    get().checkAndUnlockBadges();
  },
  deleteBloodGlucose: (id) => set((state) => ({
    bloodGlucoseLogs: state.bloodGlucoseLogs.filter((l) => l.id !== id),
  })),

  addOxygen: (log) => {
    set((state) => ({
      oxygenLogs: [{ ...log, id: `o2_${Date.now()}` }, ...state.oxygenLogs],
    }));
    get().addXP(XP_TABLE.vitalsLog, 'Logged your oxygen level', { lib: 'Ionicons', name: 'fitness' });
    get().checkAndUnlockBadges();
  },
  deleteOxygen: (id) => set((state) => ({
    oxygenLogs: state.oxygenLogs.filter((l) => l.id !== id),
  })),

  toggleWidgetVisibility: (id) => {
    set((state) => {
      const exists = state.dashboardGrid.includes(id);
      const nextGrid = exists
        ? state.dashboardGrid.filter((item) => item !== id)
        : [...state.dashboardGrid, id];
      return { dashboardGrid: nextGrid };
    });
  },

  hydrateStore: async () => {
    // With MMKV + persist middleware the store rehydrates automatically on startup.
    // This function is kept for manual refresh (e.g. pull-to-refresh) — synchronous reads.
    const recentWater = mmkvHydrateLogs('water', 2);
    const recentWeight = mmkvHydrateLogs('weight', 2);

    if (recentWater.length > 0) set({ waterLogs: recentWater });

    if (recentWeight.length > 0) {
      const timeOrder: Record<string, number> = { morning: 0, afternoon: 1, night: 2 };
      const sorted = (recentWeight as WeightLog[]).sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return timeOrder[a.timeOfDay] - timeOrder[b.timeOfDay];
      });
      set({ weightLogs: sorted });
    }
  },
  
  initializeFromSupabase: async () => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return;
    const userId = authData.user.id;
    
    // Fetch Profile
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (profile) {
      // Profile has meaningful data only when height + weight are set (filled in during setup).
      // A bare auth-trigger row has nulls → setupCompleted stays false → wizard shows.
      const hasRealData = (profile.height ?? 0) > 0 && (profile.weight ?? 0) > 0;
      set((state) => ({
        user: {
          ...state.user,
          name:       profile.name    ?? state.user.name,
          age:        profile.age     ?? state.user.age,
          height:     profile.height  ?? state.user.height,
          weight:     profile.weight  ?? state.user.weight,
          goal:       profile.goal    || state.user.goal,
          motto:      profile.motto   || state.user.motto,
          calorieGoal:  profile.calorie_goal  ?? state.user.calorieGoal,
          waterGoal:    profile.water_goal     ?? state.user.waterGoal,
          stepsGoal:    profile.steps_goal     ?? state.user.stepsGoal,
          workoutGoal:  profile.workout_goal   ?? state.user.workoutGoal,
          level:   profile.level  ?? state.user.level,
          xp:      profile.xp     ?? state.user.xp,
          streak:  profile.streak ?? state.user.streak,
          profilePic: profile.profile_pic ?? state.user.profilePic,
          weightUnit: profile.weight_unit || 'kg',
          volumeUnit: profile.volume_unit || 'ml',
          notificationsEnabled: profile.notifications_enabled ?? true,
          hapticsEnabled: profile.haptics_enabled ?? true,
          privateProfileEnabled: state.user.privateProfileEnabled,
          appLockEnabled: state.user.appLockEnabled,
          setupCompleted: hasRealData,
        }
      }));
    }
    
    // Fetch Water
    const { data: waterLogs } = await supabase.from('water_logs').select('*').eq('user_id', userId);
    if (waterLogs) {
      set({ waterLogs: waterLogs.map((log: any) => ({ id: log.id, time: log.time, ml: log.ml })) });
    }
    
    // Fetch Weight
    const { data: weightLogs } = await supabase.from('weight_logs').select('*').eq('user_id', userId);
    if (weightLogs) {
      const timeOrder: Record<string, number> = { morning: 0, afternoon: 1, night: 2 };
      const sorted = weightLogs.map((log: any) => ({
        id: log.id,
        weight: log.weight,
        date: log.date,
        timeOfDay: log.time_of_day,
      })).sort((a: any, b: any) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return timeOrder[a.timeOfDay] - timeOrder[b.timeOfDay];
      });
      set({ weightLogs: sorted });
    }
  },
}),
{
  name: 'fitforge-store',
  storage: createJSONStorage(() => zustandMMKVStorage),
  partialize: (state: FitnessState) => ({
    user:          state.user,
    weightLogs:    state.weightLogs,
    waterLogs:     state.waterLogs,
    meals:         state.meals,
    reminders:     state.reminders,
    stepsCount:    state.stepsCount,
    activeMinutes: state.activeMinutes,
    stepHistory:   state.stepHistory,
    dashboardGrid: state.dashboardGrid,
    isDarkMode:    state.isDarkMode,
    dailyLogs:          state.dailyLogs,
    sleepLogs:          state.sleepLogs,
    heartRateLogs:      state.heartRateLogs,
    bloodPressureLogs:  state.bloodPressureLogs,
    bloodGlucoseLogs:   state.bloodGlucoseLogs,
    oxygenLogs:         state.oxygenLogs,
    badges:             state.badges,
    xpHistory:          state.xpHistory,
    cycleLogs:          state.cycleLogs,
    cycleSettings:      state.cycleSettings,
  }),
}));

// ─── Custom Domain Hook Layer (Selector-Based State Consumption) ───────────────

/**
 * Custom hook for Diet/Nutrition logs tracking.
 */
export function useDietTracker() {
  const meals = useFitnessStore((state) => state.meals);
  const calorieGoal = useFitnessStore((state) => state.user.calorieGoal);
  const addFoodToMeal = useFitnessStore((state) => state.addFoodToMeal);
  const deleteFoodFromMeal = useFitnessStore((state) => state.deleteFoodFromMeal);

  return {
    meals,
    calorieGoal,
    addFoodToMeal,
    deleteFoodFromMeal,
  };
}

/**
 * Custom hook for Workout Engine.
 */
export function useWorkoutEngine() {
  const stepsCount = useFitnessStore((state) => state.stepsCount);
  const activeMinutes = useFitnessStore((state) => state.activeMinutes);
  const stepHistory = useFitnessStore((state) => state.stepHistory);
  const stepsGoal = useFitnessStore((state) => state.user.stepsGoal);
  const addSteps = useFitnessStore((state) => state.addSteps);
  const addManualSteps = useFitnessStore((state) => state.addManualSteps);
  const updateStepsGoal = useFitnessStore((state) => state.updateStepsGoal);

  return {
    stepsCount,
    activeMinutes,
    stepHistory,
    stepsGoal,
    addSteps,
    addManualSteps,
    updateStepsGoal,
  };
}

/**
 * Custom hook for Hydration tracker.
 */
export function useHydrationTracker() {
  const waterLogs = useFitnessStore((state) => state.waterLogs);
  const waterGoal = useFitnessStore((state) => state.user.waterGoal);
  const addWaterLog = useFitnessStore((state) => state.addWaterLog);
  const deleteWaterLog = useFitnessStore((state) => state.deleteWaterLog);
  const setWaterGoal = useFitnessStore((state) => state.setWaterGoal);

  // Dynamic calculations (from AppContext)
  const totalMl = waterLogs.reduce((sum, item) => sum + item.ml, 0);
  const waterAvg = Math.round((2100 * 4 + totalMl) / 5);
  const waterBest = Math.max(3200, totalMl);
  const waterStreak = totalMl >= waterGoal ? 9 : 8;

  return {
    waterLogs,
    waterGoal,
    addWaterLog,
    deleteWaterLog,
    setWaterGoal,
    waterAvg,
    waterBest,
    waterStreak,
  };
}

/**
 * Custom hook for Profile settings.
 */
export function useProfileSettings() {
  const name                 = useFitnessStore((s) => s.user.name);
  const email                = useFitnessStore((s) => s.user.email);
  const age                  = useFitnessStore((s) => s.user.age);
  const height               = useFitnessStore((s) => s.user.height);
  const weight               = useFitnessStore((s) => s.user.weight);
  const goal                 = useFitnessStore((s) => s.user.goal);
  const motto                = useFitnessStore((s) => s.user.motto);
  const profilePic           = useFitnessStore((s) => s.user.profilePic);
  const calorieGoal          = useFitnessStore((s) => s.user.calorieGoal);
  const waterGoal            = useFitnessStore((s) => s.user.waterGoal);
  const stepsGoal            = useFitnessStore((s) => s.user.stepsGoal);
  const workoutGoal          = useFitnessStore((s) => s.user.workoutGoal);
  const level                = useFitnessStore((s) => s.user.level);
  const xp                   = useFitnessStore((s) => s.user.xp);
  const streak               = useFitnessStore((s) => s.user.streak);
  const weightUnit           = useFitnessStore((s) => s.user.weightUnit);
  const volumeUnit           = useFitnessStore((s) => s.user.volumeUnit);
  const notificationsEnabled = useFitnessStore((s) => s.user.notificationsEnabled);
  const hapticsEnabled       = useFitnessStore((s) => s.user.hapticsEnabled);
  const privateProfileEnabled = useFitnessStore((s) => s.user.privateProfileEnabled);
  const appLockEnabled       = useFitnessStore((s) => s.user.appLockEnabled);
  const setUser              = useFitnessStore((s) => s.setUser);
  const updateUserGoal       = useFitnessStore((s) => s.updateUserGoal);
  const updateUserMotto      = useFitnessStore((s) => s.updateUserMotto);

  // Reconstruct user object for screens that need the full shape (edit modal etc.)
  const user = { name, email, age, height, weight, goal, motto, profilePic,
                 calorieGoal, waterGoal, stepsGoal, workoutGoal, level, xp, streak,
                 weightUnit, volumeUnit, notificationsEnabled, hapticsEnabled,
                 privateProfileEnabled, appLockEnabled };

  return { user, name, email, age, height, weight, goal, motto, profilePic,
           calorieGoal, waterGoal, stepsGoal, workoutGoal, level, xp, streak,
           weightUnit, volumeUnit, notificationsEnabled, hapticsEnabled,
           privateProfileEnabled, appLockEnabled,
           setUser, updateUserGoal, updateUserMotto };
}

/**
 * Custom hook for Dashboard grid builder layout.
 */
export function useDashboardEngine() {
  const dashboardGrid = useFitnessStore((state) => state.dashboardGrid);
  const setDashboardGrid = useFitnessStore((state) => state.setDashboardGrid);
  const toggleWidgetVisibility = useFitnessStore((state) => state.toggleWidgetVisibility);

  return {
    dashboardGrid,
    setDashboardGrid,
    toggleWidgetVisibility,
  };
}

/**
 * Custom hook for BMI and Weight Tracking.
 */
export function useBmiTracker() {
  const weightLogs = useFitnessStore((state) => state.weightLogs);
  const height = useFitnessStore((state) => state.user.height);
  const weight = useFitnessStore((state) => state.user.weight);
  const addWeightLog = useFitnessStore((state) => state.addWeightLog);
  const deleteWeightLog = useFitnessStore((state) => state.deleteWeightLog);

  const currentBMI = calculateBMI(weight, height);

  const bmiLogs: BMILog[] = [];
  const dateMap = new Map<string, WeightLog>();
  weightLogs.forEach((log) => dateMap.set(log.date, log));
  
  dateMap.forEach((log, date) => {
    const bmi = calculateBMI(log.weight, height);
    const result = classifyBMI(bmi);
    bmiLogs.push({
      date,
      bmi,
      weight: log.weight,
      height,
      category: result.category,
    });
  });
  bmiLogs.sort((a, b) => a.date.localeCompare(b.date));

  let weightTrend: 'losing' | 'gaining' | 'stable' = 'stable';
  if (weightLogs.length >= 7) {
    const recent = weightLogs.slice(-14);
    const mid = Math.floor(recent.length / 2);
    const firstHalf = recent.slice(0, mid);
    const secondHalf = recent.slice(mid);
    const avgFirst = firstHalf.reduce((s, l) => s + l.weight, 0) / (firstHalf.length || 1);
    const avgSecond = secondHalf.reduce((s, l) => s + l.weight, 0) / (secondHalf.length || 1);
    const diff = avgSecond - avgFirst;
    if (diff < -0.3) weightTrend = 'losing';
    else if (diff > 0.3) weightTrend = 'gaining';
  }

  return {
    weightLogs,
    currentBMI,
    bmiLogs,
    weightTrend,
    addWeightLog,
    deleteWeightLog,
  };
}

/**
 * Custom hook for App Theme (Dark / Light mode).
 * Reads isDarkMode from the persisted Zustand store so any screen can react to it.
 */
export function useThemeMode() {
  const isDarkMode   = useFitnessStore((s) => s.isDarkMode);
  const setIsDarkMode = useFitnessStore((s) => s.setIsDarkMode);
  return { isDarkMode, setIsDarkMode };
}
