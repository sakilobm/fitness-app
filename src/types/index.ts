import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export type IoniconName = React.ComponentProps<typeof Ionicons>['name'];
export type MCIName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export type IconDef =
  | { lib: 'Ionicons'; name: IoniconName }
  | { lib: 'MCI'; name: MCIName };

export interface FoodItem {
  name: string;
  grams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  id: string;
  label: string; // Breakfast, Lunch, Dinner, Snacks
  icon: string;  // Emojis like 🌅, ☀️, 🌙, 🍎
  items: FoodItem[];
  expanded: boolean;
}

export interface LogEntry {
  id: string;
  time: string;
  ml: number;
}

export interface ReminderItem {
  id: string;
  category: string;
  icon: IconDef;
  title: string;
  time: string;
  days: string[];
  frequency: string;
  enabled: boolean;
  accentColor: string;
}

export interface UserProfile {
  name: string;
  email?: string;
  age: number;
  height: number;
  weight: number;
  goal: string;
  motto: string;
  calorieGoal: number;
  waterGoal: number;
  stepsGoal: number;
  workoutGoal: number;
  level: number;
  xp: number;
  streak: number;
  profilePic?: string;
  weightUnit?: 'kg' | 'lbs';
  volumeUnit?: 'ml' | 'oz';
  notificationsEnabled?: boolean;
  hapticsEnabled?: boolean;
}

export interface WeightLog {
  id: string;
  weight: number;
  date: string; // YYYY-MM-DD
  timeOfDay: 'morning' | 'afternoon' | 'night';
}

export interface StepLog {
  date: string;        // YYYY-MM-DD
  steps: number;
  caloriesBurned: number;
  distanceKm: number;
}

export interface BMILog {
  date: string;        // YYYY-MM-DD
  bmi: number;
  weight: number;
  height: number;
  category: 'underweight' | 'normal' | 'overweight' | 'obese';
}

