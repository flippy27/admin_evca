const dotenv = require('dotenv');
const path = require('path');

// Load .env file
dotenv.config({ path: path.join(__dirname, '.env') });

module.exports = ({ config }) => {
  const appVariant = process.env.APP_VARIANT || "production";
  const isDev = appVariant === "development";
  const isStaging = appVariant === "staging";
  const isPreview = isDev || isStaging;

  const appName = isPreview ? "RNExpoThree (Dev)" : "RNExpoThree";
  const appId = isPreview
    ? "com.example.rnexpothree.dev"
    : "com.example.rnexpothree";

  const resolvedVersion = config.version || "1.0.0";
  const resolvedBuildNumber = config?.ios?.buildNumber || "1";
  const resolvedVersionCode = Number.parseInt(
    String(config?.android?.versionCode || 1),
    10
  );

  return {
    ...config,
    name: appName,
    slug: "rn-expo-three",
    version: resolvedVersion,
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "rn-expo-three",
    userInterfaceStyle: "automatic",
    splash: {
      resizeMode: "contain",
      backgroundColor: "#FFFFFF",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      ...(config.ios || {}),
      supportsTablet: true,
      buildNumber: resolvedBuildNumber,
      bundleIdentifier: appId,
    },
    android: {
      ...(config.android || {}),
      versionCode: Number.isFinite(resolvedVersionCode) ? resolvedVersionCode : 1,
      icon: "./assets/images/adaptive-icon.png",
      package: appId,
      permissions: ["android.permission.ACCESS_NETWORK_STATE"],
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
      ...(config.web || {}),
    },
    plugins: ["expo-router"],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      ...(config.extra || {}),
      apiUrl: process.env.API_BASE_URL,
      userMgmtUrl: process.env.USER_MGMT_URL,
      encryptionKey: process.env.TOKEN_ENCRYPTION_KEY,
      hmacSecret: process.env.HMAC_SECRET,
      environment: process.env.ENVIRONMENT,
      debug: process.env.DEBUG === 'true',
      httpLogLevel: process.env.HTTP_LOG_LEVEL,
      maestro: {
        appId,
        appVariant,
      },
    },
  };
};
