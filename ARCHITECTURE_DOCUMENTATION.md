# Architecture Documentation

This document explains the software architecture of the Fitness App. It serves as a visual guide and reference for developers to understand state flows, UI component interactions, and data models.

---

## 1. High-Level Architectural Pattern

The Fitness App is built on a **Centralized Global State Engine** using React's native Context API and **Expo Router** for tab-based navigation. 

All core feature tabs (Home, Nutrition, Weight, Reminders, Profile) are wrapped within a master `AppProvider` context. This guarantees complete inter-screen reactivity—making action logs in one screen instantly propagate across the entire app.

```mermaid
graph TD
    AppLayout["App Layout (_layout.tsx)"] --> AppProvider["AppProvider (AppContext.tsx)"]
    AppProvider --> Navigation["Tabs Navigation ((tabs))"]
    
    Navigation --> Home["Home Tab (index.tsx)"]
    Navigation --> Nutrition["Nutrition Tab (nutrition.tsx)"]
    Navigation --> Weight["Weight Tab (weight.tsx)"]
    Navigation --> Reminders["Reminders Tab (reminders.tsx)"]
    Navigation --> Profile["Profile Tab (profile.tsx)"]
    
    Home <--> AppProvider
    Nutrition <--> AppProvider
    Weight <--> AppProvider
    Reminders <--> AppProvider
    Profile <--> AppProvider
```

---

## 2. Centralized State Store (`AppContext.tsx`)

The global store handles all local storage simulation and synchronous states. The context exposes features categorized as:
* **User Profile Engine:** Manages account stats (height, streak, levels, XP) and targets (calorie goal, step target, workout frequency).
* **Weight Tracker:** Implements structured weight records with intraday logging slots (Morning, Afternoon, Night).
* **Macro Tracker:** Aggregates food item lists bucketed by meal types (Breakfast, Lunch, Dinner, Snacks).
* **Hydration Flow:** Tracks water volumes logged during the day.
* **Reminders Scheduler:** Manages active alert configurations (frequency, schedule, category colors).
* **Step Burn Metrics:** Tracks total steps and translates them to active duration and calorie burns.

---

## 3. Data Schema & Models (`src/types/index.ts`)

The key application types are structured as follows:

### A. Weight Entry Schema
Historically, weights were a basic numeric list. The architecture transitioned to a multi-point daily log:
```typescript
export interface WeightLog {
  id: string;
  weight: number;
  date: string; // YYYY-MM-DD
  timeOfDay: 'morning' | 'afternoon' | 'night';
}
```

### B. Nutrition Schema
Stores portions scaled dynamically to calculate protein, carbs, and fat:
```typescript
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
  icon: string;
  items: FoodItem[];
  expanded: boolean;
}
```

### C. Hydration & Reminders
```typescript
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
```

---

## 4. Weight Tracking Graph & Intraday Logic

The Weight SparkLine Graph is powered by a custom SVG drawing engine. Depending on the active Period selector, data flows differently:
1. **Today Period:**
   - Filters `weightLogs` for the current date.
   - Buckets logs into **Morning**, **Afternoon**, and **Night** indices.
   - Plots exactly three coordinates on the X-axis. 
   - Solid dots represent actual user logs; dashed hollow dots represent estimated slots (carrying forward the previous weight baseline) to maintain visual line continuation.
2. **Week / Month / 3M Periods:**
   - Reducers compress the weight logs list by taking the last logged entry of each unique calendar date (`dailyWeightValues`).
   - Slices and plots daily values chronologically.

### X-Axis Center-Alignment Fix
To prevent text labels like **Morn 🌅**, **Aft ☀️**, and **Ngt 🌙** from clipping outside SVG margins, we introduced:
- **`PADDING_X = 36`**: Horizontal boundaries protection padding.
- **`textAnchor="middle"`**: SVG text property to anchor strings exactly in the middle of coordinate points.

---

## 5. Fullscreen Immersive Analysis Modal

Tapping on the main Weight Trend card launches a fullscreen interactive analysis viewport:
* **Zoom Analysis**: Fully scalable charts displaying daily, weekly, monthly, and 3-month weight trends.
* **Point Selection Details**: Native tap handlers (`onPress`) on SVG chart nodes let users click any point to display a glowing panel showing exact metrics (Weight, Date, Time of Day).
* **Weight Log History Manager**: Displays a scrollable history list of all entries in reverse chronological order. Clicking the delete trash icon searches and triggers `deleteWeightLog` on the central store, removing entries with dynamic visual refitting.
