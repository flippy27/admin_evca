const dotenv = require('dotenv')
const path = require('path')

// Determine environment from NODE_ENV or APP_ENV, default to 'dev'
const env = process.env.NODE_ENV || process.env.APP_ENV || 'dev'

// Map environment names to .env files
const envFileMap = {
  dev: '.env.dev',
  development: '.env.dev',
  qa: '.env.qa',
  stg: '.env.stg',
  staging: '.env.stg',
  prod: '.env.prod',
  production: '.env.prod',
}

const envFile = envFileMap[env] || '.env.dev'

// Load environment-specific .env file
console.log(`[app.config.js] Loading environment: ${env} (${envFile})`)
dotenv.config({ path: path.join(__dirname, envFile) })

module.exports = ({ config }) => {
  const appVariant = process.env.APP_VARIANT || 'production'
  const isDev = appVariant === 'development'
  const isStaging = appVariant === 'staging'

  const appName = 'Workforce'
  const appId = 'com.dhemax.workforce'

  const resolvedVersion = config.version || '1.0.0'
  const resolvedBuildNumber = config?.ios?.buildNumber || '1'
  const resolvedVersionCode = Number.parseInt(
    String(config?.android?.versionCode || 1),
    10,
  )

  return {
    ...config,
    name: appName,
    slug: 'rn-expo-three',
    version: resolvedVersion,
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'rn-expo-three',
    userInterfaceStyle: 'automatic',
    splash: {
      resizeMode: 'contain',
      backgroundColor: '#FFFFFF',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      ...(config.ios || {}),
      supportsTablet: true,
      buildNumber: resolvedBuildNumber,
      bundleIdentifier: appId,
    },
    android: {
      ...(config.android || {}),
      versionCode: Number.isFinite(resolvedVersionCode)
        ? resolvedVersionCode
        : 1,
      icon: './assets/images/adaptive-icon.png',
      package: appId,
      permissions: ['android.permission.ACCESS_NETWORK_STATE'],
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
      ...(config.web || {}),
    },
    plugins: ['expo-router'],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      ...(config.extra || {}),
      // API Configuration
      apiUrl:
        process.env.API_BASE_URL || 'https://emobility-bff.dev.dhemax.link/',
      apiTimeout: parseInt(process.env.API_TIMEOUT || '30000', 10),
      httpLogLevel: parseInt(process.env.HTTP_LOG_LEVEL || '1', 10),

      // Authentication
      authProvider: process.env.AUTH_PROVIDER || 'keycloak',
      authRealm: process.env.AUTH_REALM || 'evca',
      authClientId: process.env.AUTH_CLIENT_ID || 'admin-evca-mobile',
      encryptionKey:
        process.env.TOKEN_ENCRYPTION_KEY || 'your-32-char-encryption-key-here',

      // App Configuration
      environment: process.env.ENVIRONMENT || 'development',
      appVersion: process.env.APP_VERSION || '1.0.0',
      debug: process.env.DEBUG === 'true' || false,
      enableMockApi: process.env.ENABLE_MOCK_API === 'true',
      enableOfflineSupport: process.env.ENABLE_OFFLINE_SUPPORT !== 'false',

      // Services
      analyticsEnabled: process.env.ANALYTICS_ENABLED === 'true',
      analyticsKey: process.env.ANALYTICS_KEY || '',
      sentryEnabled: process.env.SENTRY_ENABLED === 'true',
      sentryDsn: process.env.SENTRY_DSN || '',

      // Localization
      defaultLanguage: process.env.DEFAULT_LANGUAGE || 'es',
      defaultTheme: process.env.DEFAULT_THEME || 'system',

      // EAS Build
      easProjectId: process.env.EAS_PROJECT_ID || '',
      easBuildChannel: process.env.EAS_BUILD_CHANNEL || 'production',

      // Maestro
      maestro: {
        appId,
        appVariant,
      },
    },
  }
}
