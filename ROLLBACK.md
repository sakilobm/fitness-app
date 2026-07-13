# Rollback Plan

If version `2.9.1` (Default App Theme Configuration to Light Mode) needs to be reverted, use this guide.

## Rollback Procedure (Reverting to v2.9.0)

1. **Revert store default changes:**
   ```powershell
   git checkout v2.9.0 -- src/store/themeStore.ts src/store/fitnessStore.ts
   ```

---

If version `2.9.0` (Daily Quests & Checklist Dashboard Widget) needs to be reverted, use this guide.

## Rollback Procedure (Reverting to v2.8.1)

1. **Revert code edits:**
   ```powershell
   git checkout v2.8.1 -- app/(tabs)/index.tsx src/store/fitnessStore.ts
   ```

2. **Delete added components:**
   ```powershell
   rm src/components/home/DailyQuests.tsx
   ```

---

If version `2.8.1` (Android Manifest Merger and minSdkVersion Conflicts) needs to be reverted, use this guide.

## Rollback Procedure (Reverting to v2.8.0)

1. **Revert configuration changes:**
   ```powershell
   git checkout v2.8.0 -- app.json package.json package-lock.json
   ```

2. **Clean rebuild:**
   ```powershell
   npx expo prebuild --clean
   ```

---

If version `2.8.0` (Comprehensive App Rebranding to Vividly) needs to be reverted, use this guide.

## Rollback Procedure (Reverting to v2.7.0)

1. **Revert modified branding files:**
   ```powershell
   git checkout v2.7.0 -- app.json app.config.js package.json src/components/AnimatedSplashScreen.tsx app/(auth)/onboarding.tsx app/(auth)/login.tsx app/settings.tsx src/utils/mmkvStorage.ts src/store/fitnessStore.ts src/store/themeStore.ts src/theme/tokens.ts src/constants/theme.ts
   ```

2. **Clean Metro bundle cache:**
   ```powershell
   npx expo start -c
   ```

---

If version `2.7.0` (Graceful Network & Offline Error Handling) needs to be reverted, use this guide.

## Rollback Procedure (Reverting to v2.6.9)

1. **Revert modified error handling files:**
   ```powershell
   git checkout v2.6.9 -- src/providers/AuthProvider.tsx src/utils/syncQueue.ts src/store/fitnessStore.ts app/(auth)/login.tsx app/(auth)/signup.tsx app/settings.tsx src/utils/index.ts
   Remove-Item src/utils/errorUtils.ts
   ```

2. **Clean Metro bundle cache:**
   ```powershell
   npx expo start -c
   ```

---

If version `2.6.9` (UI: Today's Activity Horizontal Scroll Spacing) needs to be reverted, use this guide.

## Rollback Procedure (Reverting to v2.6.8)

1. **Revert timeline ScrollView style changes:**
   ```powershell
   git checkout v2.6.8 -- app/(tabs)/index.tsx
   ```

2. **Clean Metro bundle cache:**
   ```powershell
   npx expo start -c
   ```

---

If version `2.6.8` (Type Compilation: Badge Import Path Suffix) needs to be reverted, use this guide.

## Rollback Procedure (Reverting to v2.6.7)

1. **Revert rewards screen import change:**
   ```powershell
   git checkout v2.6.7 -- app/rewards.tsx
   ```

2. **Clean Metro bundle cache:**
   ```powershell
   npx expo start -c
   ```

---

If version `2.6.7` (UI: Fix Sleep History Card Margins) needs to be reverted, use this guide.

## Rollback Procedure (Reverting to v2.6.6)

1. **Revert SleepLogCard styling changes:**
   ```powershell
   git checkout v2.6.6 -- c:/Users/sowbh/Desktop/App-Project-2026/Fitness-App/src/components/sleep/SleepLogCard.tsx
   ```

2. **Clean Metro bundle cache:**
   ```powershell
   npx expo start -c
   ```

---

If version `2.6.6` (DB Schema — Create Missing Log Tables with RLS) needs to be reverted, use this guide.

## Rollback Procedure (Reverting to v2.6.5)

1. **Drop the created tables via Supabase SQL editor:**
   ```sql
   DROP TABLE IF EXISTS public.step_logs CASCADE;
   DROP TABLE IF EXISTS public.reminders CASCADE;
   DROP TABLE IF EXISTS public.meals CASCADE;
   DROP TABLE IF EXISTS public.water_logs CASCADE;
   DROP TABLE IF EXISTS public.weight_logs CASCADE;
   ```

2. **Clean Metro bundle cache:**
   ```powershell
   npx expo start -c
   ```

---

If version `2.6.5` (Security — RLS Tightening & Per-User Delete Scoping) needs to be reverted, use this guide.

## Rollback Procedure (Reverting to v2.6.4)

1. **Revert store file:**
   ```powershell
   git checkout v2.6.4 -- src/store/fitnessStore.ts
   ```

2. **Restore old profiles RLS (only if needed for testing — NOT recommended for production):**
   ```sql
   CREATE POLICY "Public profiles are viewable by everyone."
   ON public.profiles FOR SELECT USING (true);
   ```

3. **Clean Metro bundle cache:**
   ```powershell
   npx expo start -c
   ```

---

If version `2.6.4` (Clear History Split — Local vs Cloud) needs to be reverted due to modal UX issues, use this guide.

## Rollback Procedure (Reverting to v2.6.3)

1. **Revert settings screen:**
   ```powershell
   git checkout v2.6.3 -- app/settings.tsx
   ```

2. **Clean Metro bundle cache:**
   ```powershell
   npx expo start -c
   ```

---

If version `2.6.3` (Navigation Gate — One-Shot Session Setup Check) needs to be reverted due to routing regressions, use this guide.

## Rollback Procedure (Reverting to v2.6.2)

1. **Revert layout file:**
   ```powershell
   git checkout v2.6.2 -- app/_layout.tsx
   ```

2. **Clean Metro bundle cache:**
   ```powershell
   npx expo start -c
   ```

---

If version `2.6.2` (NaN Fix — Null-Safe Supabase Profile Hydration) needs to be reverted, use this guide.

## Rollback Procedure (Reverting to v2.6.1)

1. **Revert store file:**
   ```powershell
   git checkout v2.6.1 -- src/store/fitnessStore.ts
   ```

2. **Clean Metro bundle cache:**
   ```powershell
   npx expo start -c
   ```

---

If version `2.6.1` (Setup Wizard Gate — setupCompleted Flag) needs to be reverted due to routing conflicts, use this guide.

## Rollback Procedure (Reverting to v2.6.0)

1. **Revert modified files:**
   ```powershell
   git checkout v2.6.0 -- src/types/index.ts src/store/fitnessStore.ts app/(auth)/setup.tsx app/_layout.tsx
   ```

2. **Clean Metro bundle cache:**
   ```powershell
   npx expo start -c
   ```

---

If version `2.6.0` (Code Reusability Refactor — Component & Hook Extraction) needs to be reverted due to import errors or component regressions, use this guide.

## Rollback Procedure (Reverting to v2.5.3)

1. **Revert screen files:**
   ```powershell
   git checkout v2.5.3 -- app/water.tsx app/settings.tsx "app/(auth)/setup.tsx"
   ```

2. **Remove new component/hook files:**
   ```powershell
   Remove-Item -Recurse -Force src/components/charts
   Remove-Item -Recurse -Force src/components/setup
   Remove-Item src/components/ui/PressableRow.tsx
   Remove-Item src/hooks/useWeightLogger.ts
   Remove-Item src/hooks/useWaterLogger.ts
   Remove-Item src/hooks/useSettingsForm.ts
   git checkout v2.5.3 -- src/components/ui/index.ts src/hooks/index.ts
   ```

3. **Clean Metro bundle cache:**
   ```powershell
   npx expo start -c
   ```

---

If version `2.5.3` (Interactive Haptics Diagnostic Test Button) needs to be reverted due to timing issues or state conflicts, use this guide.

## Rollback Procedure (Reverting to v2.5.2)

1. **Revert modified settings screen files:**
   ```powershell
   git checkout v2.5.2 -- app/settings.tsx
   ```

2. **Clean Metro bundle cache:**
   ```powershell
   npx expo start -c
   ```

---

If version `2.5.2` (Card Split Background, Undefined Units & Dynamic XP Progress) needs to be reverted due to layout issues, GlassCard rendering anomalies, or progress bar value problems, use this guide.

## Rollback Procedure (Reverting to v2.5.1)

1. **Revert modified UI component and profile screen files:**
   ```powershell
   git checkout v2.5.1 -- src/components/ui/GlassCard.tsx app/(tabs)/profile.tsx
   ```

2. **Clean Metro bundle cache:**
   ```powershell
   npx expo start -c
   ```

---

If version `2.5.1` (Android Native Haptic Exception & Settings Toasts Migration) needs to be reverted due to layout issues, Toast banner timing problems, or haptics behavior anomalies, use this guide.

## Rollback Procedure (Reverting to v2.5.0)

1. **Revert modified haptic utilities and settings screen files:**
   ```powershell
   git checkout v2.5.0 -- src/utils/haptics.ts app/settings.tsx
   ```

2. **Clean Metro bundle cache:**
   ```powershell
   npx expo start -c
   ```

---

If version `2.5.0` (Settings preferences and decoupled profile screen) needs to be reverted due to layout issues, navigation conflicts, or conversion bugs, use this guide.

## Rollback Procedure (Reverting to v2.4.3)

1. **Revert modified settings and profile screen files:**
   ```powershell
   git checkout v2.4.3 -- app/settings.tsx app/(tabs)/profile.tsx
   ```

2. **Clean Metro bundle cache:**
   ```powershell
   npx expo start -c
   ```

---

If version `2.4.3` (expo-system-ui integration) needs to be reverted due to build errors or package conflicts, use this guide.

## Rollback Procedure (Reverting to v2.4.2)

1. **Uninstall package:**
   ```powershell
   npm uninstall expo-system-ui
   ```

2. **Regenerate native folders:**
   ```powershell
   npx expo prebuild --clean
   ```

3. **Clean Metro bundle cache:**
   ```powershell
   npx expo start -c
   ```

---

If version `2.4.2` (Theme Adoption on Steps and Water screens) needs to be reverted due to layout issues, SVG rendering errors, or modal display problems, use this guide.

## Rollback Procedure (Reverting to v2.4.1)

1. **Revert modified steps and water screen files:**
   ```powershell
   git checkout v2.4.1 -- app/steps.tsx app/water.tsx
   ```

2. **Clean Metro bundle cache:**
   ```powershell
   npx expo start -c
   ```

---

If version `2.4.1` (Worklet API Deprecations & Weight Log Stability) needs to be reverted due to animation layout issues or dates formatting bugs, use this guide.

## Rollback Procedure (Reverting to v2.4.0)

1. **Revert modified animation and weight files:**
   ```powershell
   git checkout v2.4.0 -- src/theme/ThemeProvider.tsx app/(tabs)/weight.tsx
   ```

2. **Clean Metro bundle cache:**
   ```powershell
   npx expo start -c
   ```

---

If version `2.4.0` (Global Dynamic Persistence Theme System with Hook-based useTheme) needs to be reverted due to rendering issues or style compilation failures, use this guide.

## Rollback Procedure (Reverting to static theme colors v2.3.2)

1. **Revert modified layout and screen files:**
   ```powershell
   git checkout v2.3.2 -- app/_layout.tsx app/(auth)/setup.tsx app/(tabs)/profile.tsx app/(tabs)/index.tsx app/(tabs)/nutrition.tsx src/constants/theme.ts src/store/fitnessStore.ts
   ```

2. **Clean up new theme files:**
   ```powershell
   Remove-Item -Recurse -Force src/theme
   ```

3. **Clean Metro bundle cache:**
   ```powershell
   npx expo start -c
   ```

---

If version `2.3.2` (Splash Screen Full-Screen / Padding Issue Fix) needs to be reverted due to layout transitions performance issues or Reanimated library crashes, use this guide to revert.

## Rollback Procedure (Reverting to static single-color setup wizard v2.0.0)

1. **Restore wizard and weight tracking screens:**
   Revert the setup and weight files back to their v2.0.0 states:
   ```powershell
   git checkout v2.0.0 -- app/(auth)/setup.tsx app/(tabs)/weight.tsx testing/run_all_test_scripts.sh
   ```

2. **Clean Metro bundle cache:**
   Ensure compiled assets are rebuilt cleanly:
   ```powershell
   npx expo start -c
   ```

---

If version `2.0.0` (Zustand State, Component Registry & Segmented Storage Refactor) needs to be reverted due to library conflicts, performance issues, or state-sync bugs, use this guide to revert to the previous state.

## Rollback Procedure (Reverting to legacy context and static grid v1.9.0)

1. **Restore screens, stores, and schemas:**
   Revert the home screen, AppContext provider, and index exports back to their v1.9.0 states:
   ```powershell
   git checkout v1.9.0 -- app/(tabs)/index.tsx src/store/AppContext.tsx src/store/index.ts
   ```

2. **Clean up new shared feature files and utils:**
   Remove the new Zustand store, segmented storage helper, pure calculations utilities, and component registry feature folders:
   ```powershell
   Remove-Item -Recurse -Force src/features/dashboard
   Remove-Item -Force src/store/fitnessStore.ts src/utils/storage.ts src/utils/healthCalculations.ts testing/test_health_calculations.js testing/run_all_test_scripts.sh
   ```

3. **Uninstall dependencies:**
   Remove Zustand and AsyncStorage:
   ```powershell
   npm uninstall zustand @react-native-async-storage/async-storage
   ```

4. **Clean metro bundle cache:**
   To guarantee Metro completely purges state modifications:
   ```powershell
   npx expo start -c
   ```

---

If version `1.8.4` (Android Release Build Path Restoration) needs to be reverted due to unexpected compilation failures or path regressions on other operating systems, use this guide to revert to the previous state.

## Rollback Procedure (Reverting to redirected paths v1.8.3)

1. **Restore Gradle build files:**
   Restore the custom `buildDir` redirection block inside `android/build.gradle` and the `buildStagingDirectory` block inside `android/app/build.gradle` back to their v1.8.3 states:
   ```powershell
   git checkout v1.8.3 -- android/build.gradle android/app/build.gradle
   ```

2. **Stop Daemons and clean build cache:**
   ```powershell
   .\gradlew --stop
   .\gradlew clean
   ```

---

If version `1.8.2` (Native Storage Gallery Image Selection & Camera Upload) needs to be reverted due to permission failures, image picker crashes, or runtime compatibility issues with older Expo platforms, use this guide to revert to the previous working state.

## Rollback Procedure (Reverting to preset-avatar profile v1.8.1)

1. **Restore profile screen codebase:**
   Revert the profile picker changes, image picker imports, and action sheet modals back to their preset-only states:
   ```powershell
   git checkout v1.8.1 -- app/(tabs)/profile.tsx
   ```

2. **Uninstall picker dependencies:**
   Remove the native image picker package from package.json and node modules:
   ```powershell
   npm uninstall expo-image-picker
   ```

3. **Clean metro bundle cache:**
   To guarantee Metro bundle purges native module extensions and picker overlays:
   ```powershell
   npx expo start -c
   ```

---

If version `1.8.1` (Premium Profile Display Picture Selection System) needs to be reverted due to layout issues, image failing to load, or TypeScript compiler errors on older system platforms, use this guide to revert to the previous working state.

## Rollback Procedure (Reverting to text-avatar profile v1.8.0)

1. **Restore screens, types, and stores:**
   Revert the UserProfile schemas, initial states, and visual selector widgets back to their static states:
   ```powershell
   git checkout v1.8.0 -- src/types/index.ts src/store/AppContext.tsx app/(tabs)/profile.tsx
   ```

2. **Clean metro bundle cache:**
   Purge compiled packages to verify that stale DP layout states do not persist:
   ```powershell
   npx expo start -c
   ```

---

If version `1.8.0` (Complete Authentication Suite & Navigation Gating Stack) needs to be reverted due to routing issues, path failures, or TypeScript compiler errors on older Expo systems, use this guide to revert to the previous working state.

## Rollback Procedure (Reverting to visual graph modal v1.7.1)

1. **Restore screens and layouts:**
   Revert the root layout navigation gates and profile log out widgets back to their static states:
   ```powershell
   git checkout v1.7.1 -- app/_layout.tsx app/(tabs)/profile.tsx
   ```

2. **Clean up authentication stack files:**
   Remove the new auth route group files completely:
   ```powershell
   Remove-Item -Recurse -Force app/(auth)
   ```

3. **Clean metro bundle cache:**
   To guarantee Metro completely purges the authentication bundle files and redirects:
   ```powershell
   npx expo start -c
   ```

---

If version `1.7.1` (Visual Polish & Fullscreen Interactive Graph Modal) needs to be reverted due to gesture recognizer issues or SVG tap handler crashes on specific Native runtimes, use this guide to revert to the previous working state.

## Rollback Procedure (Reverting to static non-expandable graph logs v1.7.0)

1. **Restore weight screen codebase:**
   Wipe the visual headers, tap handlers, expandable modals, and styled history items, restoring standard daily/intraday charts:
   ```powershell
   git checkout v1.7.0 -- app/(tabs)/weight.tsx
   ```

2. **Clean metro bundle cache:**
   To guarantee Metro packager completely purges the new overlays and styles from compiled code:
   ```powershell
   npx expo start -c
   ```

---

If version `1.7.0` (Intraday Weight Tracking) needs to be reverted due to type casting errors or SVG coordinate plotting glitches on specific device platforms, use this guide to revert to the previous working state.

## Rollback Procedure (Reverting to daily weight array logs v1.6.0)

1. **Restore all screens, stores, and schemas:**
   Wipe the structured record schema and restore the daily numeric array list format:
   ```powershell
   git checkout v1.6.0 -- src/types/index.ts src/store/AppContext.tsx app/(tabs)/weight.tsx app/(tabs)/index.tsx
   ```

2. **Clean metro bundle cache:**
   To guarantee Metro packager completely purges the structured weight schemas from compiled code:
   ```powershell
   npx expo start -c
   ```

---

If version `1.6.0` (Centralized App State Provider & Global Inter-Screen Reactivity) needs to be reverted due to context re-rendering lags or path alias conflicts, use this guide to revert to the previous working state.

## Rollback Procedure (Reverting to static screens v1.5.0)

1. **Restore all screens and router layouts:**
   Wipe the global store context and revert all tab screens back to their local state versions:
   ```powershell
   git checkout v1.5.0 -- app/_layout.tsx app/water.tsx app/(tabs)/nutrition.tsx app/(tabs)/weight.tsx app/(tabs)/profile.tsx app/(tabs)/reminders.tsx
   ```

2. **Clean up new shared files:**
   Remove the new store context files and standard icon components:
   ```powershell
   Remove-Item -Force src/store/AppContext.tsx src/components/ui/AppIcon.tsx src/types/index.ts
   ```

3. **Re-initialize store and types index files:**
   Reset index files to their clean placeholder states:
   ```powershell
   git checkout v1.5.0 -- src/store/index.ts src/components/ui/index.ts src/types/index.ts src/utils/index.ts
   ```

4. **Clean metro bundle cache:**
   Purge Metro bundler cache to guarantee no stale global states persist in compiled bundles:
   ```powershell
   npx expo start -c
   ```

---

If version `1.5.0` (Fully Functional Interactive Water/Hydration Tracking) needs to be reverted due to animation rendering lags or modal sizing issues on older React Native packages, use this guide to revert to the previous working state.

## Rollback Procedure (Reverting to Water screen v1.1.1)

1. **Restore water.tsx codebase:**
   Revert [water.tsx](file:///c:/Users/sowbh/Desktop/Fitness-App/app/water.tsx) to its static presentation format by running git checkout or restoring from backup:
   ```powershell
   git checkout v1.1.1 -- app/water.tsx
   ```

2. **Clean metro bundle cache:**
   To guarantee Metro bundler purges any stale compiled dynamic sheets:
   ```powershell
   npx expo start -c
   ```

---

If version `1.4.0` (Fully Functional Interactive Food/Nutrition Tracking) needs to be reverted due to calculation overflows or modal keyboard interaction errors, use this guide to revert to the previous working state.

## Rollback Procedure (Reverting to Nutrition screen v1.1.1)

1. **Restore nutrition.tsx codebase:**
   Revert [nutrition.tsx](file:///c:/Users/sowbh/Desktop/Fitness-App/app/%28tabs%29/nutrition.tsx) to its static presentation format by running git checkout or restoring from backup:
   ```powershell
   git checkout v1.1.1 -- app/(tabs)/nutrition.tsx
   ```

2. **Clean metro bundle cache:**
   To guarantee Metro bundler purges any stale compiled dynamic sheets:
   ```powershell
   npx expo start -c
   ```

---

If version `1.3.0` (Fully Functional Interactive Weight Tracking) needs to be reverted due to data binding errors or visual glitches on older OS targets, use this guide to revert to the previous working state.

## Rollback Procedure (Reverting to Weight screen v1.1.1)

1. **Restore weight.tsx codebase:**
   Revert [weight.tsx](file:///c:/Users/sowbh/Desktop/Fitness-App/app/%28tabs%29/weight.tsx) to its static presentation format by running git checkout or restoring from backup:
   ```powershell
   git checkout v1.1.1 -- app/(tabs)/weight.tsx
   ```

2. **Clean metro bundle cache:**
   To guarantee Metro bundler purges any stale dynamic bundles:
   ```powershell
   npx expo start -c
   ```

---

If version `1.2.2` (Profile Modal Keyboard Resize & Shrinking Layout Fix) needs to be reverted due to unexpected keyboard behavior or styling regressions, use this guide to revert to the previous working state.

## Rollback Procedure (Reverting to Profile v1.2.1)

1. **Restore profile.tsx codebase wrapper and style:**
   * In [profile.tsx](file:///c:/Users/sowbh/Desktop/Fitness-App/app/%28tabs%29/profile.tsx), change `KeyboardAvoidingView` behavior back to:
     ```typescript
     behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
     ```
   * Revert the stylesheet entries in `profile.tsx` for `modalKeyboard` and `modalContent` back to their v1.2.1 definitions:
     ```typescript
     modalKeyboard: {
       width: '100%',
       justifyContent: 'flex-end',
     },
     modalContent: {
       backgroundColor: Colors.ivory,
       borderTopLeftRadius: Radius.lg,
       borderTopRightRadius: Radius.lg,
       paddingTop: 20,
       paddingHorizontal: 20,
       paddingBottom: Platform.OS === 'ios' ? 44 : 24,
       maxHeight: '100%',
       borderTopWidth: 1,
       borderLeftWidth: 1,
       borderRightWidth: 1,
       borderBottomWidth: 0,
       borderColor: Colors.lime + '20',
     },
     ```

2. **Clean metro bundle cache:**
   To guarantee Metro bundler purges any stale bundle layouts:
   ```powershell
   npx expo start -c
   ```

---

If version `1.2.1` (Profile Modal Bottom Alignment Layout Fix) needs to be reverted due to unexpected screen sizing bugs or padding issues on specific OS versions, use this guide to revert to the previous working state.

## Rollback Procedure (Reverting to Profile v1.2.0)

1. **Restore profile.tsx codebase style:**
   Revert the stylesheet entries in [profile.tsx](file:///c:/Users/sowbh/Desktop/Fitness-App/app/%28tabs%29/profile.tsx) for `modalKeyboard` and `modalContent` back to their v1.2.0 definitions:
   ```typescript
   modalKeyboard: {
     width: '100%',
   },
   modalContent: {
     backgroundColor: Colors.ivory,
     borderTopLeftRadius: Radius.lg,
     borderTopRightRadius: Radius.lg,
     paddingTop: 20,
     paddingHorizontal: 20,
     paddingBottom: Platform.OS === 'ios' ? 40 : 24,
     maxHeight: '92%',
     borderWidth: 1,
     borderColor: Colors.lime + '20',
   },
   ```

2. **Clean metro bundle cache:**
   To guarantee Metro bundler purges any stale bundle layouts:
   ```powershell
   npx expo start -c
   ```

---

If version `1.2.0` (Advanced Edit Profile Modal) needs to be reverted due to visual regressions or user issues on specific devices, use this guide to roll back to the previous state.

## Rollback Procedure (Reverting to Profile v1.1.1)

1. **Restore profile.tsx codebase:**
   Revert [profile.tsx](file:///c:/Users/sowbh/Desktop/Fitness-App/app/%28tabs%29/profile.tsx) to its static presentation format by running git checkout or restoring from backup:
   ```powershell
   git checkout v1.1.1 -- app/(tabs)/profile.tsx
   ```

2. **Clean metro bundle cache:**
   To verify that no compiled cached versions of the Modal continue to bundle:
   ```powershell
   npx expo start -c
   ```

---

If version `1.0.1` encounters regression issues or causes unexpected runtime side effects, use this guide to revert to the previous working package state.

## Rollback Procedure (Reverting to Dependency Configuration v1.0.0)

1. **Restore package.json dependencies:**
   Change the dependency versions in [package.json](file:///c:/Users/sowbh/Desktop/Fitness-App/package.json) back to the following:
   ```json
   "react-native-reanimated": "~3.17.0",
   "react-native-worklets": "^0.9.1"
   ```

2. **Clean and reinstall node modules:**
   Run the following terminal commands to wipe existing installations and restore exact lockfile configurations:
   ```powershell
   Remove-Item -RecurRecurse -Force node_modules, package-lock.json
   npm install
   ```

3. **Clear Metro Bundler Cache:**
   Ensure stale compiled bundles are purged entirely before restarting the app:
   ```powershell
   npx expo start -c
   ```
