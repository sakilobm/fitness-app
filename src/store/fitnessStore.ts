import { create } from 'zustand';
import { FoodItem, Meal, LogEntry, ReminderItem, UserProfile, WeightLog, StepLog, BMILog } from '../types';
import { Colors } from '../constants/theme';
import { calculateBMI, classifyBMI } from '../utils/bmi';
import { stepsToCalories, stepsToDistanceKm, getDateStr } from '../utils/steps';
import { savePartitionedLog, deletePartitionedLog, hydrateRecentLogs } from '../utils/storage';

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

  // Hydration state
  hydrateStore: () => Promise<void>;
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
    frequency: 'Daily', enabled: true, accentColor: Colors.chart.water,
  },
  {
    id: 'r2', category: 'Water',
    icon: { lib: 'Ionicons', name: 'water-outline' },
    title: 'Afternoon Hydration',
    time: '15:00', days: ['M', 'T', 'W', 'T', 'F'],
    frequency: 'Weekdays', enabled: true, accentColor: Colors.chart.water,
  },
  {
    id: 'r3', category: 'Meals',
    icon: { lib: 'Ionicons', name: 'restaurant' },
    title: 'Log Breakfast',
    time: '07:30', days: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    frequency: 'Daily', enabled: true, accentColor: Colors.amber,
  },
  {
    id: 'r4', category: 'Meals',
    icon: { lib: 'Ionicons', name: 'restaurant-outline' },
    title: 'Log Dinner',
    time: '19:00', days: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    frequency: 'Daily', enabled: false, accentColor: Colors.amber,
  },
  {
    id: 'r5', category: 'Weigh-in',
    icon: { lib: 'MCI', name: 'scale-bathroom' },
    title: 'Morning Weigh-in',
    time: '07:00', days: ['M', 'W', 'F'],
    frequency: '3×/week', enabled: true, accentColor: Colors.lime,
  },
  {
    id: 'r6', category: 'Body Photo',
    icon: { lib: 'Ionicons', name: 'camera' },
    title: 'Progress Photo',
    time: '08:00', days: ['M'],
    frequency: 'Weekly', enabled: true, accentColor: Colors.lime,
  },
  {
    id: 'r7', category: 'Workout',
    icon: { lib: 'MCI', name: 'dumbbell' },
    title: 'Strength Training',
    time: '18:00', days: ['M', 'W', 'F'],
    frequency: '3×/week', enabled: true, accentColor: Colors.lime,
  },
  {
    id: 'r8', category: 'Supplements',
    icon: { lib: 'MCI', name: 'pill' },
    title: 'Take Vitamins',
    time: '08:30', days: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    frequency: 'Daily', enabled: false, accentColor: Colors.chart.fibre,
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

// Available dashboard grid items by default
const defaultDashboardGrid = ['activity', 'nutrition', 'water', 'weight', 'workout_focus'];

export const useFitnessStore = create<FitnessState>((set, get) => ({
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

  setUser: (updatedUser) => set((state) => ({ user: { ...state.user, ...updatedUser } })),
  
  updateUserGoal: (goal) => set((state) => ({ user: { ...state.user, goal } })),
  
  updateUserMotto: (motto) => set((state) => ({ user: { ...state.user, motto } })),

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

    // Persistent cache async sync
    savePartitionedLog('weight', targetDate, logEntry);
  },

  deleteWeightLog: (id) => {
    set((state) => {
      const remainingLogs = state.weightLogs.filter((log) => log.id !== id);
      const sortedLogs = remainingLogs.length > 0 ? remainingLogs : state.weightLogs;
      const latestWeight = sortedLogs[sortedLogs.length - 1]?.weight || state.user.weight;
      
      // Attempt async deletion
      const deletedLog = state.weightLogs.find((log) => log.id === id);
      if (deletedLog) {
        deletePartitionedLog('weight', deletedLog.date, id);
      }

      return {
        weightLogs: sortedLogs,
        user: { ...state.user, weight: latestWeight }
      };
    });
  },

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

    // Cache nutrition item
    const today = getPastDateStr(0);
    savePartitionedLog('nutrition', today, { id: `${mealId}_${Date.now()}`, mealId, item });
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

    // Cache water intake
    const today = getPastDateStr(0);
    savePartitionedLog('water', today, logEntry);
  },

  deleteWaterLog: (id) => {
    const today = getPastDateStr(0);
    set((state) => ({
      waterLogs: state.waterLogs.filter((item) => item.id !== id),
    }));
    deletePartitionedLog('water', today, id);
  },

  setWaterGoal: (goal) => set((state) => ({ user: { ...state.user, waterGoal: goal } })),

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

    // Save to partitioned storage
    const today = getPastDateStr(0);
    savePartitionedLog('steps', today, { steps, timestamp: Date.now() });
  },

  addManualSteps: (steps) => {
    if (steps <= 0) return;
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
  },

  updateStepsGoal: (goal) => set((state) => ({ user: { ...state.user, stepsGoal: goal } })),

  setDashboardGrid: (grid) => set({ dashboardGrid: grid }),

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
    // Hydrate latest 2 months of logs from segmented storage
    const recentWater = await hydrateRecentLogs('water', 2);
    const recentWeight = await hydrateRecentLogs('weight', 2);
    
    if (recentWater.length > 0) {
      set({ waterLogs: recentWater });
    }
    
    if (recentWeight.length > 0) {
      // Sort weight logs
      const timeOrder: Record<string, number> = { morning: 0, afternoon: 1, night: 2 };
      const sorted = recentWeight.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return timeOrder[a.timeOfDay] - timeOrder[b.timeOfDay];
      });
      set({ weightLogs: sorted });
    }
  },
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

  return {
    waterLogs,
    waterGoal,
    addWaterLog,
    deleteWaterLog,
    setWaterGoal,
  };
}

/**
 * Custom hook for Profile settings.
 */
export function useProfileSettings() {
  const user = useFitnessStore((state) => state.user);
  const setUser = useFitnessStore((state) => state.setUser);
  const updateUserGoal = useFitnessStore((state) => state.updateUserGoal);
  const updateUserMotto = useFitnessStore((state) => state.updateUserMotto);

  return {
    user,
    setUser,
    updateUserGoal,
    updateUserMotto,
  };
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
