const fs = require('fs');
const path = require('path');

function loadEnvFile() {
  const appEnv =
    process.env.APP_ENV ||
    (process.env.EAS_BUILD_PROFILE === 'production' ? 'production' : 'development');
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

module.exports = ({ config }) => {
  const env = loadEnvFile();

  const appName = process.env.APP_NAME || config.name || 'Vividly';
  const appPackage =
    process.env.APP_PACKAGE || config.android?.package || 'com.vividly.app';
  const appScheme = process.env.APP_SCHEME || config.scheme || 'vividly';

  return {
    ...config,
    name: appName,
    scheme: appScheme,
    ios: {
      ...config.ios,
      bundleIdentifier: appPackage,
    },
    android: {
      ...config.android,
      package: appPackage,
    },
    extra: {
      ...config.extra,
      appEnv: env,
    },
  };
};
