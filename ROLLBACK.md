# Rollback Plan

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
