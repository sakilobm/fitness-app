# Rollback Plan

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
