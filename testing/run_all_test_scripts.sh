#!/bin/bash
# ─── Fitness App Test Runner ──────────────────────────────────────────────────
# Runs all automated compiler validation and functional logic checks.
# ──────────────────────────────────────────────────────────────────────────────

echo "🚀 Starting Automated Tests..."

# 1. Type check the project
echo "Step 1: Running TypeScript Compiler Checks..."
npx tsc --noEmit
TSC_EXIT=$?

if [ $TSC_EXIT -ne 0 ]; then
  echo "❌ TypeScript compilation checks failed!"
  exit $TSC_EXIT
fi
echo "✅ TypeScript compilation checks passed!"

# 2. Compile calculations file for node runner
echo "Step 2: Compiling Health Calculations module..."
npx tsc src/utils/healthCalculations.ts --ignoreConfig --outDir testing/dist --module commonjs --target es2020 --skipLibCheck --esModuleInterop
COMPILE_EXIT=$?

if [ $COMPILE_EXIT -ne 0 ]; then
  echo "❌ Failed to compile Health Calculations module!"
  exit $COMPILE_EXIT
fi

# 3. Run unit tests for health calculations
echo "Step 3: Running Health Calculations Unit Tests..."
node "$(dirname "$0")/test_health_calculations.js"
TEST_EXIT=$?

if [ $TEST_EXIT -ne 0 ]; then
  echo "❌ Health calculations tests failed!"
  exit $TEST_EXIT
fi

echo "🎉 All tests passed successfully!"
exit 0
