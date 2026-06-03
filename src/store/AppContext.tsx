import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { FoodItem, Meal, LogEntry, ReminderItem, UserProfile, WeightLog, StepLog, BMILog } from '../types';
import { Colors } from '../constants/theme';
import { calculateBMI, classifyBMI } from '../utils/bmi';
import { stepsToCalories, stepsToDistanceKm, getDateStr } from '../utils/steps';
import { supabase } from '../lib/supabase';

interface AppContextType {
  // User Profile
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  updateUserGoal: (goal: string) => void;
  updateUserMotto: (motto: string) => void;
  
  // Weight Tracking
  weightLogs: WeightLog[];
  setWeightLogs: React.Dispatch<React.SetStateAction<WeightLog[]>>;
  addWeightLog: (weight: number, timeOfDay: 'morning' | 'afternoon' | 'night', dateOffset?: 'today' | 'yesterday') => void;
  deleteWeightLog: (index: number) => void;
  
  // Nutrition/Food Tracking
  meals: Meal[];
  setMeals: React.Dispatch<React.SetStateAction<Meal[]>>;
  addFoodToMeal: (mealId: string, item: FoodItem) => void;
  deleteFoodFromMeal: (mealId: string, itemIndex: number) => void;
  
  // Water Hydration
  waterLogs: LogEntry[];
  setWaterLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>;
  addWaterLog: (ml: number) => void;
  deleteWaterLog: (id: string) => void;
  setWaterGoal: (goal: number) => void;
  waterAvg: number;
  waterBest: number;
  waterStreak: number;
  
  // Reminders
  reminders: ReminderItem[];
  setReminders: React.Dispatch<React.SetStateAction<ReminderItem[]>>;
  addReminder: (reminder: Omit<ReminderItem, 'id'>) => void;
  updateReminder: (id: string, reminder: Partial<ReminderItem>) => void;
  deleteReminder: (id: string) => void;
  toggleReminder: (id: string) => void;
  
  // Steps/Activity
  stepsCount: number;
  setStepsCount: React.Dispatch<React.SetStateAction<number>>;
  addSteps: (steps: number) => void;
  addManualSteps: (steps: number) => void;
  activeMinutes: number;
  setActiveMinutes: React.Dispatch<React.SetStateAction<number>>;
  stepHistory: StepLog[];
  updateStepsGoal: (goal: number) => void;

  // BMI Tracking
  bmiLogs: BMILog[];
  currentBMI: number;
  weightTrend: 'losing' | 'gaining' | 'stable';

  // Authentication State
  isAuthenticated: boolean;
  loginUser: (email: string) => void;
  signupUser: (name: string, email: string) => void;
  logoutUser: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial States
const initialUserProfile: UserProfile = {
  name: 'Sakil',
  age: 24,
  height: 178, // 178 cm
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
  return d.toISOString().split('T')[0]; // "YYYY-MM-DD"
};

const initialWeightValues = [
  84.8, 84.5, 84.6, 84.1, 83.9, 83.5, 83.2, 82.9, 82.5, 82.8,
  82.1, 81.9, 81.5, 81.2, 80.9, 81.1, 80.5, 80.1, 79.8, 79.5,
  79.2, 78.9, 79.1, 78.6, 78.4, 78.1, 78.3, 78.0, 77.8, 78.4
];

const generateInitialWeightLogs = (): WeightLog[] => {
  const logs: WeightLog[] = [];
  // Add past 28 days as morning entries
  for (let i = 29; i >= 2; i--) {
    const val = initialWeightValues[29 - i] || 78.4;
    logs.push({
      id: `w_past_${i}`,
      weight: val,
      date: getPastDateStr(i),
      timeOfDay: 'morning',
    });
  }
  // Yesterday: Morning and Night
  logs.push({
    id: 'w_yest_m',
    weight: 77.8,
    date: getPastDateStr(1),
    timeOfDay: 'morning',
  });
  logs.push({
    id: 'w_yest_n',
    weight: 78.1,
    date: getPastDateStr(1),
    timeOfDay: 'night',
  });
  // Today: Morning, Afternoon, Night
  logs.push({
    id: 'w_tod_m',
    weight: 78.4,
    date: getPastDateStr(0),
    timeOfDay: 'morning',
  });
  logs.push({
    id: 'w_tod_a',
    weight: 78.9,
    date: getPastDateStr(0),
    timeOfDay: 'afternoon',
  });
  logs.push({
    id: 'w_tod_n',
    weight: 78.6,
    date: getPastDateStr(0),
    timeOfDay: 'night',
  });
  return logs;
};

const initialWeightLogs: WeightLog[] = generateInitialWeightLogs();

const initialWaterLogs: LogEntry[] = [
  { id: '1', time: '07:15', ml: 250 },
  { id: '2', time: '09:30', ml: 500 },
  { id: '3', time: '11:00', ml: 250 },
  { id: '4', time: '13:45', ml: 200 },
];

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

// Generate 7-day step history with realistic demo data
const generateInitialStepHistory = (): StepLog[] => {
  const stepValues = [8400, 5200, 10300, 9100, 7800, 6240, 0];
  const history: StepLog[] = [];
  for (let i = 6; i >= 0; i--) {
    const steps = stepValues[6 - i];
    history.push({
      date: getDateStr(i),
      steps,
      caloriesBurned: stepsToCalories(steps, 78.4),
      distanceKm: stepsToDistanceKm(steps, 178),
    });
  }
  return history;
};

import { useFitnessStore } from './fitnessStore';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = useFitnessStore();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Sync profile when authentication state changes
  useEffect(() => {
    const syncUserFromSession = (session: any) => {
      if (!session?.user) return;
      const meta = session.user.user_metadata ?? {};
      const name = meta.full_name || meta.name || meta.user_name || session.user.email?.split('@')[0] || 'User';
      const email = session.user.email ?? meta.email;
      const profilePic = meta.avatar_url || meta.picture;
      store.setUser({
        name,
        email,
        ...(profilePic ? { profilePic } : {}),
      });
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      syncUserFromSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      syncUserFromSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Hydrate partitioned logs from AsyncStorage once on load
  useEffect(() => {
    store.hydrateStore();
  }, []);

  // Water calculations
  const [waterAvg, setWaterAvg] = useState(2100);
  const [waterBest, setWaterBest] = useState(3200);
  const [waterStreak, setWaterStreak] = useState(8);

  useEffect(() => {
    const totalMl = store.waterLogs.reduce((sum, item) => sum + item.ml, 0);
    setWaterAvg(Math.round((2100 * 4 + totalMl) / 5));
    if (totalMl > waterBest) {
      setWaterBest(totalMl);
    }
    if (totalMl >= store.user.waterGoal) {
      setWaterStreak(9);
    } else {
      setWaterStreak(8);
    }
  }, [store.waterLogs, store.user.waterGoal]);

  // Derived variables
  const currentBMI = useMemo(() => {
    return calculateBMI(store.user.weight, store.user.height);
  }, [store.user.weight, store.user.height]);

  const bmiLogs = useMemo((): BMILog[] => {
    const dateMap = new Map<string, WeightLog>();
    store.weightLogs.forEach((log) => {
      dateMap.set(log.date, log);
    });

    const logs: BMILog[] = [];
    dateMap.forEach((log, date) => {
      const bmi = calculateBMI(log.weight, store.user.height);
      const result = classifyBMI(bmi);
      logs.push({
        date,
        bmi,
        weight: log.weight,
        height: store.user.height,
        category: result.category,
      });
    });

    return logs.sort((a, b) => a.date.localeCompare(b.date));
  }, [store.weightLogs, store.user.height]);

  const weightTrend = useMemo((): 'losing' | 'gaining' | 'stable' => {
    if (store.weightLogs.length < 7) return 'stable';
    const recent = store.weightLogs.slice(-14);
    const mid = Math.floor(recent.length / 2);
    const firstHalf = recent.slice(0, mid);
    const secondHalf = recent.slice(mid);
    const avgFirst = firstHalf.reduce((s, l) => s + l.weight, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((s, l) => s + l.weight, 0) / secondHalf.length;
    const diff = avgSecond - avgFirst;
    if (diff < -0.3) return 'losing';
    if (diff > 0.3) return 'gaining';
    return 'stable';
  }, [store.weightLogs]);

  // Adapters for context structure
  const setUserAdapter = (updated: any) => {
    if (typeof updated === 'function') {
      store.setUser(updated(store.user));
    } else {
      store.setUser(updated);
    }
  };

  const setWeightLogsAdapter = (updated: any) => {
    if (typeof updated === 'function') {
      const next = updated(store.weightLogs);
      useFitnessStore.setState({ weightLogs: next });
    } else {
      useFitnessStore.setState({ weightLogs: updated });
    }
  };

  const setMealsAdapter = (updated: any) => {
    if (typeof updated === 'function') {
      const next = updated(store.meals);
      useFitnessStore.setState({ meals: next });
    } else {
      useFitnessStore.setState({ meals: updated });
    }
  };

  const setWaterLogsAdapter = (updated: any) => {
    if (typeof updated === 'function') {
      const next = updated(store.waterLogs);
      useFitnessStore.setState({ waterLogs: next });
    } else {
      useFitnessStore.setState({ waterLogs: updated });
    }
  };

  const setRemindersAdapter = (updated: any) => {
    if (typeof updated === 'function') {
      const next = updated(store.reminders);
      useFitnessStore.setState({ reminders: next });
    } else {
      useFitnessStore.setState({ reminders: updated });
    }
  };

  const setStepsCountAdapter = (updated: any) => {
    if (typeof updated === 'function') {
      const next = updated(store.stepsCount);
      useFitnessStore.setState({ stepsCount: next });
    } else {
      useFitnessStore.setState({ stepsCount: updated });
    }
  };

  const setActiveMinutesAdapter = (updated: any) => {
    if (typeof updated === 'function') {
      const next = updated(store.activeMinutes);
      useFitnessStore.setState({ activeMinutes: next });
    } else {
      useFitnessStore.setState({ activeMinutes: updated });
    }
  };

  const deleteWeightLogAdapter = (index: number) => {
    const log = store.weightLogs[index];
    if (log) {
      store.deleteWeightLog(log.id);
    }
  };

  const loginUser = (email: string) => {
    // Handled by Supabase directly
  };

  const signupUser = (name: string, email: string) => {
    // Handled by Supabase directly
  };

  const logoutUser = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AppContext.Provider
      value={{
        user: store.user,
        setUser: setUserAdapter,
        updateUserGoal: store.updateUserGoal,
        updateUserMotto: store.updateUserMotto,
        weightLogs: store.weightLogs,
        setWeightLogs: setWeightLogsAdapter,
        addWeightLog: store.addWeightLog,
        deleteWeightLog: deleteWeightLogAdapter,
        meals: store.meals,
        setMeals: setMealsAdapter,
        addFoodToMeal: store.addFoodToMeal,
        deleteFoodFromMeal: store.deleteFoodFromMeal,
        waterLogs: store.waterLogs,
        setWaterLogs: setWaterLogsAdapter,
        addWaterLog: store.addWaterLog,
        deleteWaterLog: store.deleteWaterLog,
        setWaterGoal: store.setWaterGoal,
        waterAvg,
        waterBest,
        waterStreak,
        reminders: store.reminders,
        setReminders: setRemindersAdapter,
        addReminder: store.addReminder,
        updateReminder: store.updateReminder,
        deleteReminder: store.deleteReminder,
        toggleReminder: store.toggleReminder,
        stepsCount: store.stepsCount,
        setStepsCount: setStepsCountAdapter,
        addSteps: store.addSteps,
        addManualSteps: store.addManualSteps,
        activeMinutes: store.activeMinutes,
        setActiveMinutes: setActiveMinutesAdapter,
        stepHistory: store.stepHistory,
        updateStepsGoal: store.updateStepsGoal,
        bmiLogs,
        currentBMI,
        weightTrend,
        isAuthenticated,
        loginUser,
        signupUser,
        logoutUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
};

