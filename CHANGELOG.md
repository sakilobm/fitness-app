# Changelog

All notable changes to this project will be documented in this file.

## [2.4.0] - 2026-06-04T12:55:00+05:30

### Added — Global Persistence Theme System

**Architectural Decision:** Implemented a scalable, dynamic Light/Dark theme system driven by React Context, integrated with Zustand state, and persisted via MMKV to eliminate static or unreadable input styling and achieve smooth, industry-standard theme transitions.

**Changes:**
- **Dynamic Context Provider (`src/theme/ThemeProvider.tsx`):** Wraps the app root and manages system Status Bar dynamically (`light` vs `dark`) based on the active theme colors.
- **Hook-based Consumption (`useTheme`):** Standardized a hook to read the dynamic palette (`colors`) and control theme state dynamically from any component.
- **Zustand MMKV Persistence:** Configured `isDarkMode` inside the Zustand storage partialization list to persist the user's theme selection across app relaunches.
- **Setup Wizard Theme Migration:** Migrated the setup wizard input screens (`app/(auth)/setup.tsx`) to resolve its local palette dynamically from the global provider, fixing contrast issues on input text fields in the Biology and Metrics steps.
- **Home, Nutrition, and Profile Migrations:** Converted static styles using `Colors` to memoized dynamic styles using React `useMemo` on the Home screen, Nutrition log, and Profile options screens.
- **Circular Dependency Resolution (`src/store/fitnessStore.ts`):** Removed static `Colors` imports from the Zustand store initialization by hardcoding initial reminder color values as standard hex strings, preventing initialization loops in the Metro bundler.

#### Rollback
See ROLLBACK.md section for v2.4.0.

## [2.3.2] - 2026-06-04T11:24:58+05:30

### Fixed — Splash Screen Full-Screen / Padding Issue

**Problem:** Custom splash screen showed padding on all sides (wasn't truly full-bleed) and had excess white/transparent space around the edges.

**Root Cause:** The container `Animated.View` had `transform: [{ scale: scale.value }]` applied to it with an initial scale of `0.8`. This meant the container was smaller than the screen during entrance, revealing whatever was behind it. On exit, scale went to `1.5`, also causing edge clipping.

**Fix:**
- Container (`Animated.View`) now uses `StyleSheet.absoluteFill` + only `opacity` animation — it is always 100% screen size, no scale.
- Only the **inner content** (logo icon + text block) scales/translates for entrance animation.
- Exit is a pure fade-out of the entire overlay.
- Added premium details: radial glow blob, pulsing ring, animated dots indicator at bottom.
- Background color: deep forest `#0D1F12` for brand consistency.

#### Rollback
```
git checkout HEAD~1 -- src/components/AnimatedSplashScreen.tsx
```

## [2.3.1] - 2026-06-03T23:20:24+05:30

### Fixed — Industry-Standard React Context Theming in Setup Wizard

**Problem:** Light theme was broken for all inputs (age, height, weight) and sub-components (ChoiceCard, StepHeader, StepDots). Static `StyleSheet.create` calls used hardcoded `DARK_PALETTE.*` constants — they never re-evaluated when `isDarkMode` changed.

**Root Cause:** `StyleSheet.create` is evaluated once at module load time. Any palette values baked into static stylesheets are frozen forever.

**Fix — React Context pattern (industry standard):**
- Defined `ThemeCtx = React.createContext<Palette>(DARK_PALETTE)` at module level.
- `SetupWizardScreen` wraps its entire return in `<ThemeCtx.Provider value={D}>`, where `D` is `isDarkMode ? DARK_PALETTE : LIGHT_PALETTE`.
- All sub-components (`StepDots`, `ChoiceCard`, `MetricInput`, `StepHeader`) call `const D = useT()` (alias for `React.useContext(ThemeCtx)`) — they get the live palette instantly with zero prop drilling.
- All static `StyleSheet.create` calls referencing palette-dependent colors removed from sub-components; replaced with inline style objects that read `D.*` at render time.
- `StatusBar barStyle` now reads `D.statusBar` so it switches between `light-content` / `dark-content` correctly.

#### Rollback
```
git checkout HEAD~1 -- app/(auth)/setup.tsx
```

## [2.3.0] - 2026-06-03T23:06:51+05:30

### Added — Persisted Dark / Light Theme System

**Architectural Decision:** Extended the Zustand store with a persisted `isDarkMode` boolean and wired the setup wizard and profile toggle to it so the theme choice survives app restarts.

#### Store Changes (`src/store/fitnessStore.ts`)
- Added `isDarkMode: boolean` (default `true`) and `setIsDarkMode: (value: boolean) => void` to `FitnessState` interface and store state.
- Exported `useThemeMode()` custom hook: `{ isDarkMode, setIsDarkMode }` — readable from any screen.

#### Setup Wizard (`app/(auth)/setup.tsx`)
- Defined two palette constants: `DARK_PALETTE` (`#0A0A0F` canvas) and `LIGHT_PALETTE` (`#F4F3EF` warm cream canvas).
- Converted the static `StyleSheet.create(...)` into a `makeStyles(D: Palette)` factory called inside the component via `React.useMemo`, so styles regenerate instantly when theme changes.
- Sub-components (`ChoiceCard`, `MetricInput`) call `useThemeMode()` directly for inline dynamic colors.
- Static sub-component stylesheet (dotS, choiceS, miS, shS) falls back to `DARK_PALETTE` constants as stable defaults (only text/colors are overridden via inline props at render time).

#### Profile Screen (`app/(tabs)/profile.tsx`)
- Replaced local `useState(true)` for `darkTheme` with `useThemeMode()` from the store.
- The Dark Theme switch now persists across sessions and immediately affects the setup wizard.

#### Rollback Notes
- To revert: `git checkout HEAD~1 -- app/(auth)/setup.tsx src/store/fitnessStore.ts app/(tabs)/profile.tsx`

## [2.2.0] - 2026-06-03T23:00:00+05:30

### Changed — Full Premium UI Rewrite: Setup Wizard (`app/(auth)/setup.tsx`)

**Architectural Decision:** Completely replaced the existing setup wizard UI with a dark, cinematic, glassmorphic design system to provide a world-class first-impression onboarding experience.

#### Design System Changes
- **Dark Canvas:** All screens now render on `#0A0A0F` deep background (separate from the main app theme) to create visual drama during onboarding.
- **Segmented Step Dots:** Replaced the thin progress bar with animated step-dot indicators (growing pill shape for active, filled dot for done, grey for upcoming) for clearer progress communication.
- **Labeled Step Badges:** Each step renders a pill badge (`01 BASICS`, `02 METRICS`, etc.) with the step's accent color to establish context immediately.

#### Component Additions
- **`ChoiceCard`:** Reusable animated card (scale spring + glow shadow) for activity/goal selection — uses `borderColor` interpolation for a smooth glow-in on selection.
- **`MetricInput`:** Full-height tappable metric card with large display-size numbers, label, unit badge, and focus color animation.
- **`StepHeader`:** Composable header block (badge + title + subtitle) with staggered `FadeInUp` entrance animations.
- **`PulseRing`:** Radial pulsing ring for the calibration step — uses `withDelay` + `withRepeat` for offset rings creating a sonar/radar feel.
- **`StepDots`:** Dynamic progress indicator with morphing pill for the active step.

#### Screen-Level Changes
- **Welcome (Step 0):** Triple concentric decorative rings around a glowing center orb + feature pills row.
- **Basics (Step 1):** Large sex selector cards (full icon + label + check badge) + metric input for age.
- **Metrics (Step 2):** Dual metric inputs + live BMI preview card with color-coded status badge (Normal/Overweight/etc.).
- **Activity (Step 3):** Full ChoiceCard list with individual accent colors per level.
- **Goal (Step 4):** ChoiceCard list + "Most Popular" badge overlay for Burn Fat option.
- **Calibration (Step 5):** Sonar pulse rings, animated phase icon, phase progress dots, live task status list (Done/Running per phase).
- **Results (Step 6):** Trophy orb + horizontal metric cards with inline editable values.

#### Rollback Notes
- Previous version backed up implicitly via git. To rollback: `git checkout HEAD~1 -- app/(auth)/setup.tsx`

## [2.1.0] - 2026-06-03T19:50:00+05:30

### Added — Premium Animations & Overhauled Interactive Onboarding Setup Wizard

**Architectural Decision:** Enhanced the onboarding/recalibration setup page (`app/(auth)/setup.tsx`) to feature high-end spring animations, entry transitions, and an interactive multi-phase calibration loading experience to provide a premium, modern user onboarding feel:

#### 1. Page Transition & Card Animations (`app/(auth)/setup.tsx`)
- **Layout Transitions:** Integrated Reanimated's `FadeInRight` entering transitions on every wizard step view to slide and fade screens smoothly as the user navigates.
- **Interactive Card Scaling (`InteractiveCard`):** Created a spring-driven selection card wrapper that scales selected items (Biological Sex, Activity Level, Goals) to `1.04x` with custom border highlights and soft shadow glows on selection.
- **Smooth Progress Bar:** Animated the progress bar width transition smoothly using a Reanimated shared value and timing curve.

#### 2. Multi-Phase Calibration Loading screen (`app/(auth)/setup.tsx`)
- **Dynamic 5-Phase Loading Cycle:** Upgraded the calibration phase (Step 5) to cycle through 5 distinct steps (Vitals, Training, Hydration, Caloric, Completion) over a 5-second window.
- **Color & Icon Transitions:** Dynamically transitions between matching colors (Red, Blue, Water Blue, Amber, Teal) and corresponding Ionicons (`heart`, `barbell`, `water`, `flame`, `trophy`) inside a dual pulsing orb structure.
- **3D Pop & Rotation:** Rotates the icon 360 degrees and performs a pop scale animation on each phase change to increase engagement.
- **Structured Logs & Diagnostics:** Implemented correlation IDs, structured console logs, and safe error bounds catching during engine metrics calculations.

### Fixed — Compilation & Type Safety Checks
- **Weight History Deletions (`app/(tabs)/weight.tsx`):** Fixed a type parameter mismatch where `deleteWeightLog` was passed an array index instead of the log's string ID, resolving type-checking errors.

## [2.0.0] - 2026-06-03T12:22:00+05:30

### Added — Zustand State Engine, Granular Selector Hooks, Segmented Caching, Dynamic Dashboard Widget Registry, Pure Health Utility Layer

**Architectural Decision:** Restructured state management and data layouts from monolithic contexts and raw UI code blocks to a decoupled, scalable architecture featuring Zustand, custom selector hooks, partitioned AsyncStorage caches, zero-dependency pure calculations, and a component widget registry:

#### 1. Zustand Store & Custom Selector Hooks (`src/store/fitnessStore.ts`)
- **Granular Store:** Engineered a Zustand store (`useFitnessStore`) managing profile, weight logs, meals, water, reminders, steps, and layout states.
- **Selector-Based Consumption:** Implemented dedicated domain hooks (`useDietTracker`, `useWorkoutEngine`, `useHydrationTracker`, `useProfileSettings`, `useDashboardEngine`) to ensure components subscribe only to their relevant state slices, guaranteeing 60 FPS performance by preventing application-wide re-renders.
- **Backwards-Compatibility Adapter (`src/store/AppContext.tsx`):** Refactored the legacy `AppProvider` to forward state reads and actions directly to the Zustand store, preventing breaking changes in existing tab views.

#### 2. Segmented Local Storage Caching (`src/utils/storage.ts`)
- **Partitioned Keys:** Implemented domain-prefix and year-month partitioned caching in AsyncStorage (e.g. `logs:water:2026-06`) to ensure constant-time writes regardless of history size.
- **Hydration Strategy:** Configured the app to load only the active 2 months of logs during startup, preventing memory leaks and lag.

#### 3. Pure Health Calculations Layer (`src/utils/healthCalculations.ts`)
- **Zero-Dependency Utilities:** Extracted core math equations into a pure functional folder with detailed JSDoc annotations, covering BMI, BMR (Mifflin-St Jeor), TDEE (Harris-Benedict), Active Calorie Burn (MET), and Macronutrient goals distribution.

#### 4. Dynamic Dashboard Widget Registry (`src/features/dashboard/components/WidgetRegistry.tsx`)
- **Type-Safe registry:** Built a generic `<MetricCard>` container mapping widget keys to custom visualization components (`radial_chart`, `linear_progress`, `numeric_delta`, `compact_chip`) using TypeScript generics to enforce data shapes.
- **Dashboard Customizer Modal (`app/(tabs)/index.tsx`):** Designed an interactive customization panel on the Home dashboard allowing users to reorder and toggle widget visibility dynamically.

## [1.9.0] - 2026-06-02T10:09:00+05:30

### Added — Step Tracking Enhancement, BMI Calculator & Tracking, Health Suggestions Engine

**Architectural Decision:** Extended the centralized AppContext state store with step history tracking (`StepLog[]`), computed BMI derivations from existing `weightLogs[]`, and weight trend detection. Built two new utility modules (`src/utils/bmi.ts`, `src/utils/steps.ts`) for calculation logic and a rule-based health suggestion engine. Upgraded the existing Steps screen from hardcoded data to full context wiring, and created a new standalone BMI Tracker screen:

#### 1. Enhanced Step Tracking (`app/steps.tsx`)
- **Context Wiring:** Replaced 100% hardcoded data (steps, weekly bars, streaks, motion breakdown) with live `AppContext` state including `stepsCount`, `activeMinutes`, `stepHistory`, and `user.stepsGoal`.
- **Manual Step Entry Modal:** Designed a bottom-sheet slide-up modal with quick-add pills (+500, +1000, +2000, +5000) and custom numeric input. Live preview shows estimated calories and distance before confirming.
- **Dynamic Weekly Chart:** `WeekBars` SVG component now renders from rolling 7-day `stepHistory` with goal reference line and gradient-filled bars.
- **Editable Step Goal:** New "Edit Goal" bottom-sheet modal with preset goals (5k, 7.5k, 10k, 12k, 15k) and custom input. Syncs to `user.stepsGoal` in context.
- **Weekly Summary Stats:** Added a combined stats row below the chart showing total steps, calories burned, and distance walked for the week.
- **Activity Tips Integration:** Embedded personalized exercise suggestions from the suggestion engine based on step goal completion percentage.

#### 2. BMI Calculator & Tracking (`app/bmi.tsx`)
- **BMI Hero Card:** Displays live BMI value computed from `user.weight` and `user.height` with classification badge (Underweight/Normal/Overweight/Obese) and WHO-standard color coding.
- **BMI Gradient Gauge:** Custom horizontal SVG gauge spanning the 15–40 BMI range with animated white marker positioned at the user's current value. Category boundaries (18.5, 25, 30) marked with divider lines.
- **BMI History Sparkline:** SVG line chart showing BMI changes over time derived from `weightLogs` + `user.height`. Includes normal zone band overlay (18.5–25.0) and trend statistics (current, change, lowest, highest).
- **WHO Category Breakdown Cards:** Four styled cards showing all BMI categories with range labels. Active category highlighted with color border and "You" badge.
- **Interactive BMI Calculator Modal:** Standalone calculator allowing users to input any weight/height combination with live BMI result preview and category classification.
- **Weight Action Badge:** Dynamic badge showing "Lose/Gain X kg to reach normal BMI" or "You're in the healthy BMI range! 🎉".

#### 3. Personalized Health Suggestions Engine (`src/utils/bmi.ts`)
- **Rule-Based Engine:** Generates personalized health tips based on four input signals: BMI category, step goal completion %, weight trend direction (losing/gaining/stable), and daily water intake vs goal.
- **Category-Specific Advice:** Tailored suggestions for each BMI category (e.g., underweight → calorie increase + strength training, overweight → mindful eating + daily movement).
- **Priority-Weighted Tips:** Each suggestion tagged with `high`/`medium`/`low` priority and a category label (diet/exercise/lifestyle/hydration) for visual hierarchy.
- **Cross-Signal Correlation:** Detects dangerous patterns (e.g., losing weight while underweight, gaining while obese) and surfaces high-priority warnings.

#### 4. Data Layer Additions
- **New Types:** `StepLog` (date, steps, caloriesBurned, distanceKm) and `BMILog` (date, bmi, weight, height, category) in `src/types/index.ts`.
- **New AppContext Fields:** `stepHistory`, `addManualSteps()`, `updateStepsGoal()`, `bmiLogs` (auto-derived), `currentBMI` (computed), `weightTrend` (detected).
- **Step Utilities (`src/utils/steps.ts`):** Research-based conversion formulas for steps → calories (weight-adjusted), steps → distance (height-adjusted stride), and display formatting.

#### 5. Navigation & Home Dashboard
- **BMI Route Registration:** Added `/bmi` to root Stack navigator in `app/_layout.tsx`.
- **Home Dashboard BMI Chip:** New quick-access chip on the home dashboard showing current BMI value, category emoji, and label with tap-to-navigate to the full BMI Tracker screen.


## [1.8.4] - 2026-06-01T13:17:00+05:30

### Fixed — Android Release Build / Reverted Build Redirections to Fix Autolinking

**Architectural Decision:** Restored standard native build and staging directories to align perfectly with React Native's autolinking JNI compilation requirements, relying fully on the upgraded Ninja v1.12.1 compiler and `CMAKE_OBJECT_PATH_MAX=1024` to handle Windows path constraints:
- **Restored Standard Build Directories:** Reverted custom `buildDir` overrides in `android/build.gradle` and custom `buildStagingDirectory` overrides in `android/app/build.gradle`. This resolves CMake configuration errors where the autolinking engine was looking for code-generated JNI files under standard `node_modules/.../android/build` directories instead of the redirected out-of-tree folders.
- **De-cluttered Autolinked Packages:** Completely deleted an obsolete empty `react-native-gesture-handler` folder in `node_modules` that had no `package.json` or `build.gradle` files. This stops the React Native CLI config scanner from incorrectly adding it as a project which previously triggered Gradle variant resolution and directory-missing failures.
- **Successful APK Verification:** Verified a 100% clean build of the final Release APK for the `arm64-v8a` architecture, resulting in `BUILD SUCCESSFUL` inside 1m 36s.

## [1.8.3] - 2026-05-31T21:44:00+05:30

### Fixed — Android Release Build / C++ Object Path Length Windows Limits

**Architectural Decision:** Upgraded local Android SDK build compiler and cleaned build paths to resolve Windows filesystem MAX_PATH compilation errors during Android Release APK creation:
- **Deduplicated & Relocated `expo-modules-core`:** Moved the duplicate nested packages from `node_modules/expo/node_modules/expo-modules-core` up to the root `node_modules/expo-modules-core`. This shortened absolute package paths inside Android build configurations by more than 30 characters while keeping module resolution fully functional.
- **Upgraded Compiler to Ninja v1.12.1:** Replaced the older, bundled `ninja.exe` inside the local Android SDK CMake directory (`C:\Users\sowbh\AppData\Local\Android\Sdk\cmake\3.22.1\bin\ninja.exe`) with the latest official `v1.12.1` release. Since Ninja v1.12.1 natively supports long paths on Windows by auto-prepending `\\?\` Unicode prefixes, it completely bypasses the legacy 260-character path limit for C++ builds without requiring system registry changes or administrator access.
- **Enabled Long Object File Paths for CMake:** Added the `-DCMAKE_OBJECT_PATH_MAX=1024` argument within the `defaultConfig.externalNativeBuild.cmake` configuration block in `android/app/build.gradle`. This dynamically lifts the default 250-character path restriction when CMake and Ninja generate intermediate object files.
- **Workspace Timestamp Sync:** Synchronized all files in the repository using a PowerShell timestamp touch pass, eliminating the clock-skew state that triggered infinite "manifest build.ninja still dirty" loops.

## [1.8.2] - 2026-05-31T17:07:00+05:30

### Added — Native Storage Gallery Image Selection & Camera Upload

**Architectural Decision:** Integrated native device storage access inside the display picture selection workflow to support direct image picking and camera capturing. Utilized the official, SDK 56-compatible `expo-image-picker` package to query system permissions and resolve local file paths securely, and designed a custom glassmorphic bottom Action Sheet modal inside the Profile editor:
- **Expo Image Picker Integration:** Installed and configured `expo-image-picker` to request media roll and camera permissions, handling user cancellations and resolving selected paths to native `file://` or `content://` local URIs dynamically.
- **Translucent Camera edit badge Trigger:** Wrapped the profile form's preview circle in a responsive `<TouchableOpacity>` that opens the visual action sheet on click.
- **Glassmorphic Bottom Action Sheet Modal:** Designed a bottom-aligned pop-up sheet with three elegant action buttons:
  - `🖼️ Choose from Gallery` (ImagePicker.launchImageLibraryAsync)
  - `📸 Take Photo` (ImagePicker.launchCameraAsync)
  - `❌ Cancel` (Dismisses overlay)
- **Local File URI rendering:** Configured the state engine to persist and render native file URIs seamlessly inside the dashboard header and preview circles with zero compilation overhead.
- **MediaType Deprecation Warning Resolution:** Addressed the Expo ImagePicker SDK 56 console warning by replacing deprecated enum `ImagePicker.MediaTypeOptions.Images` with standard string literal `'images'` inside launch handlers, satisfying typescript types.

## [1.8.1] - 2026-05-31T17:02:00+05:30

### Added — Premium Profile Display Picture (DP) Selection System

**Architectural Decision:** Enhanced the personalization layer of the Profile screen by implementing a dynamic Profile Display Picture (DP) selection system. Upgraded the `UserProfile` data schema with a central `profilePic` string variable, and designed a highly tactile, visual editor overlay inside the Edit Profile form modal:
- **Extended User Schema:** Added `profilePic?: string` inside `src/types/index.ts` and set a gorgeous bodybuilder persona default image URL inside the central store provider `AppContext.tsx`.
- **Dynamic Image / Initials Fallbacks:** Overhauled the main Profile dashboard avatar bubble to render a high-definition `<Image>` component dynamically with smooth bounds containment, falling back robustly to standard initials text if the picture string is empty.
- **Glassmorphic Rings & Camera Icon Overlays:** Designed a centered, glowing preview circle inside the Edit Profile form modal showing the current image selection wrapped in a floating camera bubble edit indicator to cue editing triggers.
- **Pre-Curated Persona Presets Carousel:** Built a horizontal scrolling presets carousel hosting 6 pre-curated fitness avatars (illustrated fitness personas like Strength, Runner, Yoga, Trainer, Boxing, Cyclist) with active glowing selector indicators.
- **Custom Image Link Textbox:** Integrated a styled text input box showing instant live preview updates as users type or paste custom web URLs, complete with quick clear chips.

## [1.8.0] - 2026-05-31T16:52:00+05:30

### Added — Complete Authentication Suite & Navigation Gating Stack

**Architectural Decision:** Decoupled authentication Stack screens cleanly from tab menus using standard route grouping `app/(auth)/`. Secured all Core Dashboard tabs (`/(tabs)`) and root-level pages (`/steps`, `/water`, `/metabolism`) from unauthorized entries by implementing a reactive `<NavigationGate>` segment router wrapper inside `app/_layout.tsx` that routes unauthenticated users instantly to onboarding and authenticated sessions to tabs, preventing flashing or unauthorized route mounting. Exposed a secure Log Out action inside Profile settings.
- **Sleek Swipe-Based Onboarding Carousel (`app/(auth)/onboarding.tsx`):** Engineered a pure horizontal swipe welcome carousel with high-end glassmorphic slide cards mapping core features (Weight Tracking, Nutrition, Reminders), motivational quotes, dynamic dots page indicator colors, and forest-teal navigation CTA buttons.
- **Glassmorphic Sign In Screen (`app/(auth)/login.tsx`):** Designed form inputs showing real-time outline active boundary highlights (`Colors.lime` / `Colors.danger` based on format validity), custom vector password show/hide eye-toggles, Google & Apple quick credentials bypass indicators, and submit spinner loader feedback.
- **Password Strength Analyzer Sign Up Screen (`app/(auth)/signup.tsx`):** Implemented registration forms with real-time outline validators and an interactive **Password Strength Bar** (red/yellow/green visual complexity meter) tracking length and char mixtures.
- **Verification Reset Screen (`app/(auth)/forgot.tsx`):** Created a recovery screen that dynamically transitions into a majestic "Verification Link Sent!" success panel showing interactive email badges and quick return routes.

## [1.7.1] - 2026-05-31T16:50:00+05:30

### Added — Visual Polish & Immersive Fullscreen Graph Analysis Modal

**Architectural Decision:** Resolved visual limitations of small mobile viewports (clipped labels on today's chart and horizontal static layout constraints) by implementing center centering protection and designing an immersive fullscreen graph Modal analysis overlay:
- **X-Axis Centering Bounds Protection:** Integrated `PADDING_X = 36` inside the `SparkLine` SVG chart to secure coordinate lines from edge clipping. Swapped hardcoded offset values with standard SVG `textAnchor="middle"` rendering, guaranteeing labels (**Morn 🌅**, **Aft ☀️**, **Ngt 🌙**) center perfectly beneath their dots without truncating.
- **Zoom Trend Interactive Header:** Wrapped the weight trend chart card inside a highly responsive `TouchableOpacity` trigger, embedding a visual header ("Weight Trend" and "Tap to inspect logs & view analysis") alongside a glowing green expand vector icon to cue advanced interactivity.
- **Immersive Fullscreen Modal Overlay:** Designed a gorgeous fullscreen Modal viewport (`fullscreenModalVisible`) loading scalable charts in a focused analysis dashboard.
- **SVG Node Tap Gesture tooltips:** Programmed visual tap handlers (`onPress`) on SVG chart points. Clicking any coordinate highlights the node and overlays a details card dynamically presenting exact weight figures and corresponding times/dates.
- **Full History logs CRUD Manager:** Created a scrollable history panel listing all logged entries in reverse chronological order at the bottom of the modal. Tapping the delete trash icon resolves the entry ID and dispatches `deleteWeightLog` on the central context, allowing full historical data scrubbing.

## [1.7.0] - 2026-05-31T16:45:00+05:30

### Added — Intraday Weight Tracking & Multi-Time Graph Visualization

**Architectural Decision:** Transitioned the application store's weight logging tracking system from a flat, simple `number[]` array to a multi-point database-style schema model (`WeightLog[]`). Grouping weight entries chronologically by calendar date and time of day (Morning, Afternoon, Night) provides rich, localized, high-resolution body tracking:
- **Intraday Weight Data Schema:** Formulated a structured TypeScript type definition (`src/types/index.ts`) requiring a unique string identifier `id`, precise double metric `weight` value, calendar string format `date` (YYYY-MM-DD), and `timeOfDay` tag constraints ('morning' | 'afternoon' | 'night').
- **Global Context Architecture Refactoring:** Overhauled `src/store/AppContext.tsx` global states. Replaced standard 1D weight list with the new structured record type. Programmed a dynamic, relational pre-population generator that simulates 30 days of data and inserts multiple intraday test weights (Morning, Afternoon, Night) for yesterday and today to showcase graph flows natively.
- **Upsert Weight Logs Reducer:** Engineered `addWeightLog` inside the global context. Implemented search logic that matches dates and timeOfDay keys. Tapping "Save" under an active slot replaces previous entries (supporting multiple weight logs for the same slot) and automatically sorts elements chronologically by date and chronological slot ordering.
- **Dedicated Intraday "Today" Zoom Filter:** Added `'today'` into the weight Period toggle selector array in `app/(tabs)/weight.tsx`. Selecting "Today" triggers a focused zoom-in view on today's weight variance, rendering exact weight figures above coordinate points.
- **SparkLine SVG Status Plotting:** Modified `SparkLine` SVG drawing engine. Integrated a point status mapper: logged indices render as glowing green circles, while estimated slots (automatically carrying forward the user's latest recorded baseline weight) render as dotted, translucent hollow vectors, creating a premium visual representation of today's progress.
- **Clock-Aware Bottom-Sheet Picker:** Upgraded the "Log Weight" slide-up Sheet Modal. Embedded a Segmented Control Pill Row utilizing visual emojis (`🌅 Morning`, `☀️ Afternoon`, `🌙 Night`) that automatically pre-selects the correct time slot by querying local device hour thresholds upon modal opening.
- **Backward-Compatible Daily Summarizers:** Enforced zero regressions on other dashboard screens (like `index.tsx`) by constructing date-grouped summaries (`dailyWeightValues`) from the multi-point entries list.

## [1.6.0] - 2026-05-31T15:35:00+05:30

### Added — Centralized App State Provider & Global Inter-Screen Reactivity

**Architectural Decision:** Unified all local, siloed state trackers under a single Global Application Store (`src/store/AppContext.tsx`) using React's native Context API. Wrapped the root stack router inside this store, enabling real-time, bidirectional reactivity across all tabs and subviews. Consolidated duplicate icon mappings under a modular `<AppIcon>` UI component:
- **Global Context State Engine:** Created `AppContext` managing user profile details, target goals, steps logs, dynamic hydration streams, nutritional meal logs, and scheduled reminders list.
- **Dynamic Interconnected Workflows:** 
  - *Hydration:* Logging water from the Home dashboard or the Macro chip inside Nutrition dynamically adds water logs and raises the main water cylinder level.
  - *Profile Goals:* Editing step, calorie, or water targets in the Profile modal automatically propagates targets to the Home and Nutrition macro cards.
  - *Weight logs:* Connected dynamic weights list to profile stats, BMIs, sparklines, and home stats.
- **Fully Interactive Reminders Tab:** Replaced the static reminders presentation layer with a complete CRUD engine. Implemented configurable title inputs, custom segmented time wheels (Hours, Minutes, AM/PM selectors), preset and custom repeat schedules, custom indicator color selection, and smart recommendations that pre-populate form options.
- **Simulated Notification Banners:** Built a glassmorphic simulated notification overlay toast system inside the Reminders tab that triggers when reminders are toggled, created, deleted, or simulated for test actions.
- **Modular Vector Icon Helper:** Unified redundant vector icon rendering into a shared, robust UI utility (`src/components/ui/AppIcon.tsx`) for high code reuse.

## [1.5.0] - 2026-05-31T15:25:00+05:30

### Added — Fully Functional Interactive Water/Hydration Tracking

**Architectural Decision:** Converted the static presentation layer of the Water Hydration screen into a fully interactive state-driven module. Added a custom goal selection modal and custom logs entry sheet:
- **Interactive Sizing & Controls:** Built a sliding quick-add hydration row (`150ml`, `250ml`, `500ml`, and `Custom` modals) linked directly to the main reanimated `WaterCylinder` container. Log entry additions dynamically raise the animated cylinder water level with realistic timing physics.
- **Dynamic Deletable History:** Enabled timeline item deletions. Users can tap the `close-circle` next to any log entry to instantly filter the state array, subtract values from their daily total, and drop the cylinder water level.
- **Custom Target Goal Editor:** Replaced the static daily goal baseline constant with a dynamic state hook (`goalMl`). Tapping the **Daily Goal Target** card opens a modal utilizing selector chips (`1500`, `2000`, `2500`, `3000`, `3500` ml) alongside custom target inputs.
- **Dynamic Streak & Stats:** Automatically checks daily hydration targets. Met goals automatically increment user streaks (golden active glow) and update their all-time **Best Day Peak** record dynamically.
- **Success Feedback Banner:** Rendered a visually premium golden sparkles reward banner *"🎉 Daily Hydration Goal Achieved!"* when intake exceeds targets.

## [1.4.0] - 2026-05-31T15:15:00+05:30

### Added — Fully Functional Interactive Food/Nutrition Tracking

**Architectural Decision:** Converted the static presentation layer of the Food/Nutrition screen into a fully interactive state-driven module. Added a multi-tabbed slide-up `Modal` to log meals, custom food items, and track daily caloric/macro progress:
- **State-driven Calculations:** Refactored the summary card to derive Calories, Proteins, Carbs, Fats, and Fiber dynamically from active breakfast/lunch/dinner/snacks logs. Log changes automatically trigger updates in the remaining calorie badge, macro progress bars, and the circular **Nutrition Score ring** (dynamically scored `'A'`, `'B'`, or `'C'` contextually).
- **Search Library & Configurator:** Integrated a responsive, filterable default food library (e.g. Eggs, Oats, Chicken, Avocado, Rice). Selecting an item opens a **portion scaler** (grams input) that mathematically computes calories and macros in real-time before saving.
- **Custom Entry Tab:** Provided a manual tab to log custom dishes by typing their name, grams, and precise calories/macros.
- **Active Editing & Deleting:** Enabled swipe/click `close-circle` buttons on logged list items to instantly remove entries and re-balance subtotals.
- **Contextual Automation & Shortcuts:** Added contextual hour-of-day pre-selection for meals, alongside a dynamic water chip that allows quick-add logging of `+250ml` water directly from the Nutrition dashboard.

## [1.3.0] - 2026-05-31T15:00:00+05:30

### Added — Fully Functional Interactive Weight Tracking

**Architectural Decision:** Converted the static presentation layer of the Weight screen into a fully interactive state-driven module. Added a bottom-sheet styled `Modal` to dynamically log body weight and track metrics:
- **Interactive Sizing & Controls:** Placed a direct "Log Weight" CTA card and linked it to a modal containing a precision manual keyboard input synced with quick-adjust increment pills (`-1.0kg`, `-0.1kg`, `+0.1kg`, `+1.0kg`) to guarantee swift mobile logging.
- **Dynamic Derivations:** Linked weight logs directly to local screen state (`weightLogs`). Adding a log dynamically triggers real-time updates for:
  - The SVG **Sparkline Chart** (sliced by Today/Week/Month metrics).
  - The **Stats Grid** (Current Weight, dynamic Lost Weight, dynamic Weekly arrow comparison changes, and dynamic Streak incrementation).
  - The circular **Goal Progress Ring** (Percentage calculations and remaining weight).
  - The checklist **Milestones badges** (checks unlocking reactively if weight is below the metric milestone).
  - The **BMI indicator bar** (dynamic indices computed automatically using user profile height baseline).

## [1.2.2] - 2026-05-31T14:50:00+05:30

### Fixed — Profile Modal Keyboard Resize & Shrinking Layout

**Architectural Decision:** Resolved the layout bug where focusing the bottom inputs (like Motivation Motto) on Android/OS and dismissing the keyboard caused the modal's available viewport height to collapse permanently. Assigned `flex: 1` to the `KeyboardAvoidingView` wrapper style to ensure full dynamic height recovery, removed the redundant `behavior="height"` on Android (preventing soft-input double-shrinking conflict), and added a stable `minHeight: 540` constraint to `modalContent` to keep the bottom sheet visual structure solid and consistent.

## [1.2.1] - 2026-05-31T14:45:00+05:30

### Fixed — Profile Modal Bottom Alignment Layout

**Architectural Decision:** Resolved the layout issue where the slide-up modal left a gap or did not sit flush against the bottom of the device screen. Added `justifyContent: 'flex-end'` to the modal keyboard container, extended the maximum height boundary to `100%`, adjusted the iOS safe-area bottom padding to `44`, and removed the bottom border outline to create a perfectly flush, borderless connection to the bottom screen edge.

## [1.2.0] - 2026-05-31T14:10:00+05:30

### Added — Advanced Edit Profile Modal & Dynamic State Bindings

**Architectural Decision:** Replaced static account details in the Profile screen with dynamic state hooks (`useState`), binding them directly to dashboard metrics, headers, and goal progress components. Added a stylish, modern slide-up segmented form Modal to edit:
- **Basic Metrics:** Full Name, Age, Height, Weight, Primary Goal (via custom selectable chips), and Motivation Motto.
- **Advanced Goals:** Daily Calories Intake Target (kcal), Daily Hydration Goal (ml), Daily Steps Target, and Weekly Workout Frequency (via selectable pills).
- **Inline Validation:** Enforced real-time bounds and sanity checks with explicit visual error boundaries (`Colors.danger` highlighting and contextual helper messages) to guarantee robust data integrity and visual layouts.

## [1.1.1] - 2026-05-31T13:54:00+05:30

### Fixed — Weight Stats Overhaul Styles & Cleanup

**Architectural Decision:** Completed the style implementation for the redesigned weight screen 2x2 metric panel by introducing cohesive local styles (`statsGrid`, `statCard`, `statAccentBar`, etc.) that leverage our design tokens (`Colors`, `Radius`, `Typography`) and cleanly removed the unused `StatBadge` import. This ensures structural layout rendering and maintains complete UI harmony without dead code or warnings.

## [1.1.0] - 2026-05-31T13:33:00+05:30

### Changed — UI Polish Overhaul (Award-Winning Layout)

**Architecture Decision:** Replaced plain bold-text screen titles with a unified, colorful `ScreenHeader` component across ALL screens. Each screen now has a unique accent color, contextual icon bubble, uppercase subtitle label, and decorative accent bar — creating visual identity and consistent premium feel.

#### Components Upgraded
- **ScreenHeader** — Complete redesign with icon bubbles, accent color system, subtitle labels, decorative accent bars. Both tab-screen (large title) and detail-screen (back button) variants.
- **SectionHeader** — Added optional accent color dot/bar for visual hierarchy. Action button now styled as subtle pill chip.
- **StatBadge** — Added colored accent top bar and decorative dot indicator for better visual hierarchy.
- **GlassCard** — Added subtle inner glow when accent color is set. Card border tints to match accent.

#### Screens Upgraded
- **Weight** — Amber accent, scale icon, "BODY METRICS" subtitle. BMI result in pill badge. Photo card uses icon bubble.
- **Nutrition** — Calories accent, food-apple icon, "FOOD & MACROS" subtitle. Remaining kcal in pill badge. Meal chevrons styled. Modal search has barcode icon.
- **Reminders** — Indigo accent, notifications icon, active count subtitle. Per-category colored filters. Time badges on cards. FAB matches indigo.
- **Profile** — Lime accent, person icon, "MY ACCOUNT" subtitle. Stats cells have colored icon bubbles. Per-badge achievement colors. Avatar online dot.
- **Water** — Blue accent, water icon, "HYDRATION" subtitle, back button. Hero in GlassCard. Log pills have water icons. Goal has icon bubble.
- **Steps** — Indigo accent, footsteps icon, "ACTIVITY" subtitle, back button. Progress % in pill badge. Consistent indigo color.
- **Metabolism** — Amber accent, flame icon, "ENERGY & BODY" subtitle, back button. BMR hero icon bubble with shadow. Macro grams in pill badges.

## [1.0.1] - 2026-05-30T15:08:00+05:30

### Fixed
- **Dependency Incompatibility:** Upgraded `react-native-reanimated` from `3.17.5` to `4.3.1` and downgraded `react-native-worklets` from `0.9.1` to `0.8.3` to match the expectations of Expo SDK v56.0.0.
- **Runtime Crash:** Resolved `TypeError: Cannot read property 'ErrorBoundary' of undefined` which was caused by the silent failure of incompatible native modules during package/route evaluation in the Metro bundler.
