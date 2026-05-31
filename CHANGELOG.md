# Changelog

All notable changes to this project will be documented in this file.

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
