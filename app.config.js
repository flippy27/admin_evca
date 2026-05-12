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
  const appVariant = process.env.APP_VARIANT || 'development'

  const appName = 'Workforce'

  // Bundle identifier dinámico según el ambiente
  // IMPORTANTE: iOS NO permite '_' (underscore), solo letras, números, '.' y '-'
  // dev: com.dhemax.workforce-dev
  // qa: com.dhemax.workforce-qa
  // stg: com.dhemax.workforce-stg
  // prod: com.dhemax.workforce (sin sufijo)
  const getBundleId = () => {
    switch (appVariant) {
      case 'development':
      case 'dev':
        return 'com.dhemax.workforce-dev'
      case 'qa':
        return 'com.dhemax.workforce-qa'
      case 'staging':
      case 'stg':
        return 'com.dhemax.workforce-stg'
      case 'production':
      case 'prod':
      default:
        return 'com.dhemax.workforce'
    }
  }

  const appId = getBundleId()

  const resolvedVersion = process.env.APP_VERSION || '1.0.0'
  const resolvedBuildNumber = process.env.APP_BUILD_NUMBER || '1'
  const resolvedVersionCode = Number.parseInt(
    String(config?.android?.versionCode || 1),
    10,
  )

  return {
    name: appName,
    slug: process.env.APP_SLUG,
    version: resolvedVersion,
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'adminevca',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    splash: {
      resizeMode: 'contain',
      backgroundColor: '#FFFFFF',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      buildNumber: resolvedBuildNumber,
      bundleIdentifier: appId,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      versionCode: Number.isFinite(resolvedVersionCode)
        ? resolvedVersionCode
        : 1,
      package: appId,
      permissions: ['android.permission.ACCESS_NETWORK_STATE'],
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: { backgroundColor: '#000000' },
        },
      ],
      'expo-secure-store',
      'expo-localization',
      [
        'expo-local-authentication',
        {
          faceIDPermission: 'Usar Face ID para iniciar sesión en Workforce App',
        },
      ],
      [
        'expo-build-properties',
        {
          ios: {
            extraPodfileProperties: {
              SWIFT_STRICT_CONCURRENCY: 'minimal',
            },
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      // API
      BFF_URL: process.env.BFF_URL || 'https://emobility-bff.dev.dhemax.link',
      USER_MGMT_URL:
        process.env.USER_MGMT_URL ||
        'https://user-management.dev.dhemax.link/api',
      ENCRYPTION_KEY:
        process.env.ENCRYPTION_KEY ||
        'H6pLB2FvN0y9M/RoH08zrXZyJl/gN8PEZQdzVTlwxeBvulpY+5y18Jhi11cTpN8nQ1FE6yVcl5HngGMHB24Y8Q==',
      HMAC_SECRET:
        process.env.HMAC_SECRET ||
        'JMzs4PDKaxdxS1ykXs5yyPWWI1mJ8OurUx43d4QHxygvRsfHltTJNa0pEe5lbW3rdJBISoQwyl+vOZt6uKo34A==',
      apiUrl:
        process.env.API_BASE_URL || 'https://emobility-bff.dev.dhemax.link/',
      apiTimeout: parseInt(process.env.API_TIMEOUT || '30000', 10),
      httpLogLevel: parseInt(process.env.HTTP_LOG_LEVEL || '2', 10),
      httpLogMethods: process.env.HTTP_LOG_METHODS || 'COMMANDS',
      httpLogSkipPaths:
        process.env.HTTP_LOG_SKIP_PATHS || 'charging-session/company',
      // Auth
      authProvider: process.env.AUTH_PROVIDER || 'keycloak',
      authRealm: process.env.AUTH_REALM || 'evca',
      authClientId: process.env.AUTH_CLIENT_ID || 'admin-evca-mobile',
      encryptionKey:
        process.env.TOKEN_ENCRYPTION_KEY || 'your-32-char-encryption-key-here',
      // App
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
      // EAS
      easProjectId: process.env.EAS_PROJECT_ID || '',
      easBuildChannel: process.env.EAS_BUILD_CHANNEL || 'production',
      // Misc
      maestro: { appId, appVariant },
      eas: { projectId: process.env.EAS_PROJECT_ID },
      router: {},
    },
  }
}
