/**
 * Expo configuration file
 * Defines app metadata, build settings, and platform-specific options
 */

export default {
  expo: {
    name: 'EVCA Admin',
    slug: 'admin-evca',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'adminevca',
    userInterfaceStyle: 'automatic',

    // Splash screen
    splash: {
      image: './assets/images/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },

    // App entry point
    assetBundlePatterns: ['**/*'],

    // iOS configuration
    ios: {
      supportsTabletMode: true,
      requireFullScreen: false,
      bundleIdentifier: 'com.evca.admin',
      usesAppleSignIn: false,
    },

    // Android configuration
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.evca.admin',
      permissions: [
        'android.permission.INTERNET',
        'android.permission.ACCESS_NETWORK_STATE',
        'android.permission.ACCESS_FINE_LOCATION',
        'android.permission.ACCESS_COARSE_LOCATION',
        'android.permission.CAMERA',
        'android.permission.READ_CONTACTS',
      ],
    },

    // Web configuration
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },

    // Plugin configuration
    plugins: [
      [
        'expo-build-properties',
        {
          ios: {
            useFrameworks: 'static',
          },
        },
      ],
    ],

    // EAS configuration
    extra: {
      eas: {
        projectId: process.env.EAS_PROJECT_ID,
      },
      // App-specific config that can be accessed via Constants
      apiUrl: process.env.API_BASE_URL || 'http://localhost:3000',
      apiTimeout: parseInt(process.env.API_TIMEOUT || '30000'),
      environment: process.env.ENVIRONMENT || 'development',
    },
  },
};
