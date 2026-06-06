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
  privateProfileEnabled?: boolean;
  appLockEnabled?: boolean;
  setupCompleted?: boolean;
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

export interface DailyLog {
  date: string;           // YYYY-MM-DD
  waterMl: number;        // total ml consumed
  caloriesKcal: number;   // total kcal from all meals
  mealsLogged: number;    // 0–4 meal types with items
}

export interface SleepLog {
  id: string;
  date: string;        // YYYY-MM-DD — the morning the user woke up
  bedtime: string;     // HH:mm (24h)
  wakeTime: string;    // HH:mm (24h)
  totalMin: number;    // computed total sleep duration
  deepMin: number;
  remMin: number;
  lightMin: number;
  awakeMin: number;
  wakeUps: number;     // interruption count
  cycles: number;      // estimated 90-min cycles
  score: number;       // 0–100 quality score
  notes?: string;
}

// ── Vitals ────────────────────────────────────────────────────────────────────

export type HeartRateContext = 'resting' | 'active' | 'post-workout' | 'sleeping';
export type BPPosition       = 'sitting' | 'standing' | 'lying';
export type BPArm            = 'left' | 'right';
export type GlucoseUnit      = 'mg/dL' | 'mmol/L';
export type GlucoseContext   = 'fasting' | 'pre-meal' | 'post-meal' | 'bedtime' | 'random';

export interface HeartRateLog {
  id:       string;
  date:     string;           // YYYY-MM-DD
  time:     string;           // HH:mm
  bpm:      number;
  context:  HeartRateContext;
  notes?:   string;
}

export interface BloodPressureLog {
  id:        string;
  date:      string;
  time:      string;
  systolic:  number;          // mmHg
  diastolic: number;          // mmHg
  pulse:     number;          // bpm
  position:  BPPosition;
  arm:       BPArm;
  notes?:    string;
}

export interface BloodGlucoseLog {
  id:       string;
  date:     string;
  time:     string;
  value:    number;           // always stored as mg/dL internally
  unit:     GlucoseUnit;      // user's preferred display unit
  context:  GlucoseContext;
  notes?:   string;
}

export interface OxygenLog {
  id:      string;
  date:    string;
  time:    string;
  spo2:    number;            // 0–100 %
  pulse:   number;            // bpm
  notes?:  string;
}

// ── Rewards (XP, Levels & Badges) ─────────────────────────────────────────────

export type BadgeTier     = 'bronze' | 'silver' | 'gold' | 'platinum';
export type BadgeCategory = 'consistency' | 'nutrition' | 'fitness' | 'vitals' | 'sleep' | 'milestone';

export interface Badge {
  id:          string;
  label:       string;
  description: string;
  category:    BadgeCategory;
  tier:        BadgeTier;
  icon:        { lib: 'Ionicons' | 'MCI'; name: string };
  xpReward:    number;
  unlocked:    boolean;
  unlockedAt:  string | null;  // ISO datetime when unlocked
  progress:    number;         // 0–1, drives "almost there" UI on locked badges
}

export interface XPGainEvent {
  id:     string;
  date:   string;   // YYYY-MM-DD
  time:   string;   // HH:mm
  amount: number;
  reason: string;
  icon:   { lib: 'Ionicons' | 'MCI'; name: string };
}