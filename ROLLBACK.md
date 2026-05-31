# Rollback Plan

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
