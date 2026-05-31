# Rollback Plan

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
