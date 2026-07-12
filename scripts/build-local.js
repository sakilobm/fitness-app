const { execSync } = require('child_process');
const os = require('os');
const path = require('path');

const env = process.argv[2] || 'development'; // development | production
const type = process.argv[3] || 'apk'; // debug | apk | aab

process.env.APP_ENV = env;
process.env.EAS_BUILD_PROFILE = env;

console.log(`\x1b[36mBuilding local ${type.toUpperCase()} for ${env.toUpperCase()} environment...\x1b[0m`);

try {
  // 1. Run expo prebuild
  console.log('\x1b[33mRunning Expo Prebuild...\x1b[0m');
  execSync('npx expo prebuild --platform android --no-install', { stdio: 'inherit' });

  // 2. Determine gradlew command based on OS
  const isWindows = os.platform() === 'win32';
  const gradlewCmd = isWindows ? 'gradlew.bat' : './gradlew';
  
  // 3. Determine build task
  let gradleTask = 'assembleDebug';
  if (type === 'apk') {
    gradleTask = 'assembleRelease';
  } else if (type === 'aab') {
    gradleTask = 'bundleRelease';
  }

  // 4. Clean build directories directly using Node fs to avoid CMake config errors during gradlew clean
  console.log(`\x1b[33mCleaning build directories...\x1b[0m`);
  const fs = require('fs');
  const appBuildDir = path.resolve(__dirname, '..', 'android', 'app', 'build');
  const appCxxDir = path.resolve(__dirname, '..', 'android', 'app', '.cxx');
  const rootBuildDir = path.resolve(__dirname, '..', 'android', 'build');

  if (fs.existsSync(appBuildDir)) {
    fs.rmSync(appBuildDir, { recursive: true, force: true });
  }
  if (fs.existsSync(appCxxDir)) {
    fs.rmSync(appCxxDir, { recursive: true, force: true });
  }
  if (fs.existsSync(rootBuildDir)) {
    fs.rmSync(rootBuildDir, { recursive: true, force: true });
  }

  console.log(`\x1b[33mRunning Gradle ${gradleTask}...\x1b[0m`);
  execSync(`${gradlewCmd} ${gradleTask}`, {
    cwd: path.resolve(__dirname, '..', 'android'),
    stdio: 'inherit'
  });

  console.log(`\x1b[32mBuild completed successfully!\x1b[0m`);
} catch (error) {
  console.error(`\x1b[31mBuild failed with error:\x1b[0m`, error.message);
  process.exit(1);
}
