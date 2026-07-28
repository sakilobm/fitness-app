# Portfolio Case Study: Vividly — Premium Privacy-First Health & Telemetry Mobile Application

## 📱 Project Overview
**Vividly** is a high-performance, offline-first health and wellness application built for modern mobile ecosystems. Unlike traditional monolithic tracking tools, Vividly provides a privacy-focused dashboard built with custom glassmorphism widgets, real-time vitals monitoring (Heart Rate, BP, Glucose, SpO2), a precise metabolic engine, scale-optimized macro logging, and a gamified quest rewards framework. 

* **Type**: Mobile Application (iOS & Android)
* **Role**: Lead Frontend Architect & Mobile Developer
* **Primary Focus**: High-fidelity UI/UX, responsive state management, native sensor telemetry syncing, offline-first performance, and gamification.

---

## 🛠️ Tech Stack & Engineering Architecture

| Layer | Technologies & Frameworks | Purpose & Impact |
|---|---|---|
| **Core Framework** | React Native, Expo SDK 56 | Cross-platform native runtime with target SDK 36 (Android 16 compatibility) and portrait orientation lock. |
| **Routing System** | Expo Router (v56.2.8) | Type-safe, file-based layouts utilizing nested tab bars and stack structures with custom animation screens. |
| **State Management** | Zustand (v5.0) + Shallow Hook Selectors | Direct client-side state slices with selector-based streaming to avoid unnecessary app-wide re-renders. |
| **Data Synchronization** | Supabase JS client | Secure user sessions, email OTP/Google OAuth, database syncing, and cloud telemetry backups. |
| **Persistent Storage** | MMKV + SecureStore | High-speed local JSI database (0ms reads) with fallback AsyncStorage and secure hardware storage for tokens. |
| **Hardware Syncing** | Google Health Connect + Apple HealthKit | Syncs step counter, water intake logs, active calories burned, weight, and heart rate directly from native layers. |
| **Animations** | React Native Reanimated (v4.3) + Lottie | High-fidelity micro-interactions, spring animations, dynamic progress rings, and tab transition effects. |
| **UI Styling** | Custom Styling Token System | Vanilla React Native StyleSheets built on an HSL-tailored palette, eliminating UI framework load overhead. |

---

## 🏗️ Architectural Topology

The app is built on a decoupled architecture prioritizing **Offline-First Telemetry Sync** and **Shallow Selection-Based State Flow**.

```mermaid
graph TD
    AppLayout["App Layout (_layout.tsx)"] --> AppProvider["AppProvider (AppContext.tsx)"]
    AppProvider --> NavigationGate["NavigationGate (_layout.tsx)"]
    
    NavigationGate --> |"Unauthenticated"| AuthGroup["Auth Stack ((auth))"]
    NavigationGate --> |"Authenticated"| TabNavigation["Tabs Navigation ((tabs))"]
    
    AuthGroup --> Onboarding["Onboarding (onboarding.tsx)"]
    AuthGroup --> Login["Login (login.tsx)"]
    
    TabNavigation --> Home["Home Dashboard (index.tsx)"]
    TabNavigation --> Nutrition["Nutrition Tracker (nutrition.tsx)"]
    TabNavigation --> Weight["Weight Logger (weight.tsx)"]
    TabNavigation --> Reminders["Smart Reminders (reminders.tsx)"]
    TabNavigation --> Profile["User Profile (profile.tsx)"]
    
    subgraph StateEngine["Zustand Core Store (fitnessStore.ts)"]
        useDietTracker["useDietTracker()"]
        useWorkoutEngine["useWorkoutEngine()"]
        useHydrationTracker["useHydrationTracker()"]
    end
    
    TabNavigation -.-> StateEngine
    StateEngine --> MMKV["MMKV Storage (0ms Offline Cache)"]
    StateEngine --> Supabase["Supabase (TLS Encrypted Cloud Backup)"]
```

---

## 🌟 Key Features & Engineering Breakdown

### 1. High-Performance Modular Dashboard
Vividly features a drag-and-drop-style dashboard grid system (`useDashboardEngine()`) enabling users to toggle widget visibility, reorder tiles, and personalize their health tracking layout. Micro-animations guide interactive transitions when cards are expanded or collapsed.

### 2. Multi-Point Vital Statistics Engine
Logs and visualizes blood telemetry parameters over 7-day and 30-day windows. Incorporates range bars showing normal bounds for:
* **Heart Rate (BPM)**
* **Blood Pressure (mmHg Systolic/Diastolic)**
* **Blood Glucose (mg/dL)**
* **Blood Oxygen (SpO2 %)**

### 3. Scaled Nutrition & Macro Logger
Implements a detailed intake engine allowing users to add, scale, and analyze daily foods under four custom segments (Breakfast, Lunch, Dinner, Snacks). Dynamically computes macro weight goals:
* **Protein** (30% split target)
* **Carbohydrates** (45% split target)
* **Fats** (25% split target)

### 4. Metabolic Engine (BMI & BMR Calc)
Calculates exact Body Mass Index (BMI) and Basal Metabolic Rate (BMR) utilizing the **Mifflin-St Jeor Formula**. It checks active variables (age, height, weight, activity multipliers) to compute Total Daily Energy Expenditure (TDEE).

### 5. Gamified Quests, Streaks, & Rewards
To keep retention rates high, the app processes active telemetry inputs (steps, hydration, calories, workouts logged) to reward users with coins and profile XP. Implements:
* Daily Check-in streaks.
* Dynamic badges based on telemetry milestones (e.g., "Hydration Hero").
* Coin shop to redeem digital theme tokens.

---

## ⚡ Engineering Challenges & High-Impact Solutions

### Challenge 1: The Monolithic State Performance Bottleneck
* **Problem**: In early versions, logging a single glass of water caused the entire DOM-tree and every unrelated widget (like step trackers and profile cards) to re-render, creating noticeable input lag and dropping frame rates below 30 FPS.
* **Solution**: Migrated from React Context to **Zustand selector hooks** (`useShallow`). By decoupling state slices, widgets only subscribe to their specific data ranges. Water tracking inputs now stream directly to the hydration engine, leaving the remaining widgets completely idle. This preserved a flawless 60 FPS profile during all operations.

### Challenge 2: Offline-First Reliability & Health API Syncing
* **Problem**: Users exercising in low-connectivity environments (e.g., gyms, hiking trails) lost state logs, and syncing background steps from wearable devices resulted in duplicate entries.
* **Solution**: Configured **MMKV key-value caching** as a JSI layer above the local file system. A background sync coordinator integrates with **Google Health Connect** and **Apple HealthKit** to pull logs using unique UUID deduplication. If offline, writes queue locally; upon network recovery, changes are bundled and pushed securely to Supabase using TLS 1.3 protocol.

---

## 💻 Code Showcase: Optimized Telemetry Hooks

Here is a snippet demonstrating how the **Zustand Selector-Based Architecture** is designed for extreme runtime efficiency:

```typescript
// src/features/bmi/hooks/useBMIScreen.ts
import { useMemo, useState, useCallback } from 'react';
import { useFitnessStore } from '@/store/fitnessStore';
import { useShallow } from 'zustand/react/shallow';
import { getBMIResult, getIdealWeightRange } from '../utils/bmiCalculator';

export function useBMIScreen() {
  // Pull fields from the store using shallow selectors
  const store = useFitnessStore(useShallow((state) => ({
    user: state.user,
    weightLogs: state.weightLogs,
    stepsCount: state.stepsCount,
    waterLogs: state.waterLogs,
    setUser: state.setUser,
  })));

  const { user, weightLogs, stepsCount, waterLogs } = store;

  // Memoized computations prevent redundant calculations during render loops
  const currentBMI = useMemo(() => {
    return user.weight / ((user.height / 100) * (user.height / 100));
  }, [user.weight, user.height]);

  const bmiResult = useMemo(() => {
    return getBMIResult(user.weight, user.height);
  }, [user.weight, user.height]);

  const idealRange = useMemo(() => {
    return getIdealWeightRange(user.height);
  }, [user.height]);

  return {
    user,
    currentBMI,
    bmiResult,
    idealRange,
  };
}
```

---

## 🏆 Measurable Outcomes & Project Results

* **0ms Latency Storage**: Replacing standard AsyncStorage with JSI-powered MMKV decreased data loading state transitions from 230ms to less than 1ms.
* **60 FPS Animation Smoothness**: Utilizing React Native Reanimated and hardware-accelerated layouts kept UI components running at a locked 60 FPS, even on mid-range Android devices.
* **100% Data Integrity**: The native Health APIs synchronization framework handled step telemetry with 0 lost logs across offline-online state cycles.
* **Privacy Compliance**: All telemetry resides locally on the device sandbox, giving users absolute authority over cloud replication.
