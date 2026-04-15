import Constants from 'expo-constants';

// Read from app.json extra or fallback to environment
const extra = Constants.expoConfig?.extra ?? {};

// API URL can be overridden via APP_CONFIG.apiUrl from app.config.js
const apiUrl = extra.apiUrl || process.env.API_BASE_URL || 'http://localhost:3000';

export const ENV = {
  // Main API - can be configured via .env or app.config.js
  API_URL: apiUrl,
  BFF_URL: apiUrl,  // For backward compatibility
  USER_MGMT_URL: extra.userMgmtUrl || process.env.USER_MGMT_URL || 'http://localhost:3001/api',

  // Security keys - should be stored securely
  ENCRYPTION_KEY: extra.encryptionKey || process.env.TOKEN_ENCRYPTION_KEY || 'H6pLB2FvN0y9M/RoH08zrXZyJl/gN8PEZQdzVTlwxeBvulpY+5y18Jhi11cTpN8nQ1FE6yVcl5HngGMHB24Y8Q==',
  HMAC_SECRET: extra.hmacSecret || process.env.HMAC_SECRET || 'JMzs4PDKaxdxS1ykXs5yyPWWI1mJ8OurUx43d4QHxygvRsfHltTJNa0pEe5lbW3rdJBISoQwyl+vOZt6uKo34A==',
  APP_CODE: 'cms',

  // Environment
  ENVIRONMENT: extra.environment || process.env.ENVIRONMENT || 'development',
  DEBUG: extra.debug || process.env.DEBUG === 'true',
};
