# Changelog

All notable changes to this project will be documented in this file.

## [1.0.1] - 2026-05-30T15:08:00+05:30

### Fixed
- **Dependency Incompatibility:** Upgraded `react-native-reanimated` from `3.17.5` to `4.3.1` and downgraded `react-native-worklets` from `0.9.1` to `0.8.3` to match the expectations of Expo SDK v56.0.0.
- **Runtime Crash:** Resolved `TypeError: Cannot read property 'ErrorBoundary' of undefined` which was caused by the silent failure of incompatible native modules during package/route evaluation in the Metro bundler.
