import Constants from 'expo-constants';

// Read from app.json extra or fallback to dev environment
const extra = Constants.expoConfig?.extra ?? {};

export const ENV = {
  BFF_URL: extra.BFF_URL || 'https://emobility-bff.dev.dhemax.link',
  USER_MGMT_URL: extra.USER_MGMT_URL || 'https://user-management.dev.dhemax.link/api',
  ENCRYPTION_KEY: extra.ENCRYPTION_KEY || 'H6pLB2FvN0y9M/RoH08zrXZyJl/gN8PEZQdzVTlwxeBvulpY+5y18Jhi11cTpN8nQ1FE6yVcl5HngGMHB24Y8Q==',
  HMAC_SECRET: extra.HMAC_SECRET || 'JMzs4PDKaxdxS1ykXs5yyPWWI1mJ8OurUx43d4QHxygvRsfHltTJNa0pEe5lbW3rdJBISoQwyl+vOZt6uKo34A==',
  APP_CODE: 'cms',
};
