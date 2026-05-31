import React, { createContext, useContext, useState, useEffect } from 'react';
import { FoodItem, Meal, LogEntry, ReminderItem, UserProfile } from '../types';
import { Colors } from '../constants/theme';

interface AppContextType {
  // User Profile
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  updateUserGoal: (goal: string) => void;
  updateUserMotto: (motto: string) => void;
  
  // Weight Tracking
  weightLogs: number[];
  setWeightLogs: React.Dispatch<React.SetStateAction<number[]>>;
  addWeightLog: (weight: number, dateOffset?: 'today' | 'yesterday') => void;
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
  activeMinutes: number;
  setActiveMinutes: React.Dispatch<React.SetStateAction<number>>;
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

const initialWeightLogs: number[] = [
  84.8, 84.5, 84.6, 84.1, 83.9, 83.5, 83.2, 82.9, 82.5, 82.8,
  82.1, 81.9, 81.5, 81.2, 80.9, 81.1, 80.5, 80.1, 79.8, 79.5,
  79.2, 78.9, 79.1, 78.6, 78.4, 78.1, 78.3, 78.0, 77.8, 78.4
];

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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(initialUserProfile);
  const [weightLogs, setWeightLogs] = useState<number[]>(initialWeightLogs);
  const [meals, setMeals] = useState<Meal[]>(initialMeals);
  const [waterLogs, setWaterLogs] = useState<LogEntry[]>(initialWaterLogs);
  const [reminders, setReminders] = useState<ReminderItem[]>(initialReminders);
  const [stepsCount, setStepsCount] = useState<number>(6240);
  const [activeMinutes, setActiveMinutes] = useState<number>(48);

  const [waterAvg, setWaterAvg] = useState(2100);
  const [waterBest, setWaterBest] = useState(3200);
  const [waterStreak, setWaterStreak] = useState(8);

  // Keep user profile weight synced with weight logs
  useEffect(() => {
    if (weightLogs.length > 0) {
      const latestWeight = weightLogs[weightLogs.length - 1];
      setUser((u) => (u.weight !== latestWeight ? { ...u, weight: latestWeight } : u));
    }
  }, [weightLogs]);

  // Recalculate Water streaks/averages automatically when water logs update
  useEffect(() => {
    const totalMl = waterLogs.reduce((sum, item) => sum + item.ml, 0);
    
    // Average updates slightly over time based on new inputs
    setWaterAvg(Math.round((2100 * 4 + totalMl) / 5));
    
    // Best day updates if today beats previous peak
    if (totalMl > waterBest) {
      setWaterBest(totalMl);
    }
    
    // Streak calculations: if goal is met today
    if (totalMl >= user.waterGoal) {
      setWaterStreak(9); // Increments simulated streak
    } else {
      setWaterStreak(8); // Defaults to active base streak
    }
  }, [waterLogs, user.waterGoal]);

  // Profile operations
  const updateUserGoal = (goal: string) => {
    setUser((u) => ({ ...u, goal }));
  };

  const updateUserMotto = (motto: string) => {
    setUser((u) => ({ ...u, motto }));
  };

  // Weight operations
  const addWeightLog = (weight: number, dateOffset?: 'today' | 'yesterday') => {
    setWeightLogs((prev) => {
      const newLogs = [...prev];
      if (dateOffset === 'yesterday') {
        // Insert second to last or replace past weight
        newLogs[newLogs.length - 2] = weight;
      } else {
        newLogs.push(weight);
      }
      return newLogs;
    });
  };

  const deleteWeightLog = (index: number) => {
    setWeightLogs((prev) => {
      if (prev.length <= 1) return prev; // Keep at least one baseline weight
      const newLogs = [...prev];
      newLogs.splice(index, 1);
      return newLogs;
    });
  };

  // Nutrition operations
  const addFoodToMeal = (mealId: string, item: FoodItem) => {
    setMeals((prev) =>
      prev.map((meal) => {
        if (meal.id === mealId) {
          return {
            ...meal,
            items: [...meal.items, item],
          };
        }
        return meal;
      })
    );
  };

  const deleteFoodFromMeal = (mealId: string, itemIndex: number) => {
    setMeals((prev) =>
      prev.map((meal) => {
        if (meal.id === mealId) {
          const newItems = [...meal.items];
          newItems.splice(itemIndex, 1);
          return {
            ...meal,
            items: newItems,
          };
        }
        return meal;
      })
    );
  };

  // Water operations
  const addWaterLog = (ml: number) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const newEntry: LogEntry = {
      id: Date.now().toString(),
      time: timeStr,
      ml,
    };
    setWaterLogs((prev) => [...prev, newEntry]);
  };

  const deleteWaterLog = (id: string) => {
    setWaterLogs((prev) => prev.filter((item) => item.id !== id));
  };

  const setWaterGoal = (goal: number) => {
    setUser((u) => ({ ...u, waterGoal: goal }));
  };

  // Reminders operations
  const addReminder = (reminder: Omit<ReminderItem, 'id'>) => {
    const newReminder: ReminderItem = {
      ...reminder,
      id: 'rem_' + Date.now().toString(),
    };
    setReminders((prev) => [...prev, newReminder]);
  };

  const updateReminder = (id: string, reminder: Partial<ReminderItem>) => {
    setReminders((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...reminder } : item))
    );
  };

  const deleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item))
    );
  };

  // Steps operations
  const addSteps = (steps: number) => {
    setStepsCount((prev) => {
      const newSteps = prev + steps;
      // Increment active minutes as a factor of steps added
      setActiveMinutes((m) => m + Math.round(steps / 130));
      return newSteps;
    });
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        updateUserGoal,
        updateUserMotto,
        weightLogs,
        setWeightLogs,
        addWeightLog,
        deleteWeightLog,
        meals,
        setMeals,
        addFoodToMeal,
        deleteFoodFromMeal,
        waterLogs,
        setWaterLogs,
        addWaterLog,
        deleteWaterLog,
        setWaterGoal,
        waterAvg,
        waterBest,
        waterStreak,
        reminders,
        setReminders,
        addReminder,
        updateReminder,
        deleteReminder,
        toggleReminder,
        stepsCount,
        setStepsCount,
        addSteps,
        activeMinutes,
        setActiveMinutes,
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
