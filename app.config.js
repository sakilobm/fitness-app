const fs = require('fs');
const path = require('path');

function loadEnvFile() {
  let appEnv = process.env.APP_ENV;

  if (!appEnv) {
    const isProductionEnv =
      process.env.NODE_ENV === 'production' ||
      process.env.BABEL_ENV === 'production' ||
      process.env.EAS_BUILD_PROFILE === 'production';

    const hasReleaseOrExportArg = process.argv.some(arg => 
      arg.toLowerCase().includes('release') || 
      arg.toLowerCase() === 'export' || 
      arg.toLowerCase() === 'build'
    );

    const isDevFalse = process.argv.some((arg, index, arr) => 
      arg === '--dev' && arr[index + 1] === 'false'
    );

    appEnv = (isProductionEnv || hasReleaseOrExportArg || isDevFalse) ? 'production' : 'development';
  }

  const envFilePath = path.resolve(__dirname, `.env.${appEnv}`);

  if (fs.existsSync(envFilePath)) {
    const content = fs.readFileSync(envFilePath, 'utf8');
    content.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key) {
          const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
          process.env[key.trim()] = value;
        }
      }
    });
  }
  return appEnv;
}

function incrementVersionString(versionStr) {
  const parts = versionStr.split('.').map(p => parseInt(p, 10) || 0);
  if (parts.length < 3) return '1.0.0';
  parts[2] += 1;
  if (parts[2] >= 100) {
    parts[2] = 0;
    parts[1] += 1;
  }
  if (parts[1] >= 10) {
    parts[1] = 0;
    parts[0] += 1;
  }
  return parts.join('.');
}

function getOrIncrementVersion() {
  const versionControlPath = path.resolve(__dirname, 'version-control.json');
  let versionData = {
    versionCode: 1,
    version: "1.0.0",
    lastIncrementTime: 0
  };

  if (!fs.existsSync(versionControlPath)) {
    try {
      fs.writeFileSync(versionControlPath, JSON.stringify(versionData, null, 2), 'utf8');
    } catch (e) {
      console.error('Failed to initialize version-control.json:', e);
    }
  } else {
    try {
      versionData = JSON.parse(fs.readFileSync(versionControlPath, 'utf8'));
    } catch (e) {
      // Use fallback defaults
    }
  }

  // Determine if in export / build mode
  const isProductionEnv =
    process.env.NODE_ENV === 'production' ||
    process.env.BABEL_ENV === 'production' ||
    process.env.EAS_BUILD_PROFILE === 'production';

  const hasReleaseOrExportArg = process.argv.some(arg => 
    arg.toLowerCase().includes('release') || 
    arg.toLowerCase() === 'export' || 
    arg.toLowerCase() === 'build'
  );

  const isDevFalse = process.argv.some((arg, index, arr) => 
    arg === '--dev' && arr[index + 1] === 'false'
  );

  const isExportOrBuild = isProductionEnv || hasReleaseOrExportArg || isDevFalse;

  if (isExportOrBuild) {
    const now = Date.now();
    const COOLDOWN_MS = 20000; // 20 seconds cooldown to prevent duplicate increments in same build run
    if (now - versionData.lastIncrementTime > COOLDOWN_MS) {
      versionData.versionCode = (versionData.versionCode || 0) + 1;
      versionData.version = incrementVersionString(versionData.version || "1.0.0");
      versionData.lastIncrementTime = now;
      try {
        fs.writeFileSync(versionControlPath, JSON.stringify(versionData, null, 2), 'utf8');
        console.log(`\x1b[32mAuto-incremented build version: ${versionData.version} (Code ${versionData.versionCode})\x1b[0m`);
      } catch (e) {
        console.error('Failed to update version-control.json:', e);
      }
    }
  }

  return {
    version: versionData.version || "1.0.0",
    versionCode: versionData.versionCode || 1
  };
}

module.exports = ({ config }) => {
  const env = loadEnvFile();

  const appName = process.env.APP_NAME || config.name || 'Vividly';
  const appPackage =
    process.env.APP_PACKAGE || config.android?.package || 'com.vividly.app';
  const appScheme = process.env.APP_SCHEME || config.scheme || 'vividly';

  const { version, versionCode } = getOrIncrementVersion();

  return {
    ...config,
    name: appName,
    scheme: appScheme,
    version: version,
    ios: {
      ...config.ios,
      bundleIdentifier: appPackage,
      buildNumber: versionCode.toString(),
    },
    android: {
      ...config.android,
      package: appPackage,
      versionCode: versionCode,
    },
    extra: {
      ...config.extra,
      appEnv: env,
    },
  };
};
