import Constants from 'expo-constants';

// Read from app.json extra or fallback to environment
const extra = Constants.expoConfig?.extra ?? {};

// API URL from app.config.js extra (loaded from .env)
const apiUrl = extra.apiUrl || 'http://localhost:3000';

export const ENV = {
  // Main API - configured via .env in app.config.js
  API_URL: apiUrl,
  BFF_URL: apiUrl,
  USER_MGMT_URL: extra.userMgmtUrl || apiUrl,

  // Security keys - should be stored securely
  ENCRYPTION_KEY: extra.encryptionKey || 'H6pLB2FvN0y9M/RoH08zrXZyJl/gN8PEZQdzVTlwxeBvulpY+5y18Jhi11cTpN8nQ1FE6yVcl5HngGMHB24Y8Q==',
  HMAC_SECRET: extra.hmacSecret || 'JMzs4PDKaxdxS1ykXs5yyPWWI1mJ8OurUx43d4QHxygvRsfHltTJNa0pEe5lbW3rdJBISoQwyl+vOZt6uKo34A==',
  APP_CODE: 'cms',

  // Environment
  ENVIRONMENT: extra.environment || 'development',
  DEBUG: extra.debug || false,

  // HTTP Logging: 0=off, 1=basic (URL+status), 2=detailed (+headers), 3=verbose (+bodies)
  HTTP_LOG_LEVEL: extra.httpLogLevel || '1',
};
