# Changelog

All notable changes to this project will be documented in this file.

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
