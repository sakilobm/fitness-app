# Changelog

All notable changes to this project will be documented in this file.

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
