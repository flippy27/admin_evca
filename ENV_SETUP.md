# Environment Configuration Guide

## Overview

This project uses environment-specific `.env` files for different stages:

- **`.env.dev`** - Development environment (local development)
- **`.env.qa`** - QA/Testing environment
- **`.env.stg`** - Staging environment (pre-production)
- **`.env.prod`** - Production environment

## Usage

### Running with Different Environments

Use the npm scripts to run the app with the desired environment:

#### Development (default)
```bash
npm run dev           # Start development server
npm run dev:ios       # Build for iOS
npm run dev:android   # Build for Android
npm run dev:web       # Web preview
```

#### QA
```bash
npm run qa            # Start QA server
npm run qa:ios        # Build for iOS
npm run qa:android    # Build for Android
npm run qa:web        # Web preview
```

#### Staging
```bash
npm run stg           # Start staging server
npm run stg:ios       # Build for iOS
npm run stg:android   # Build for Android
npm run stg:web       # Web preview
```

#### Production
```bash
npm run prod          # Start production server
npm run prod:ios      # Build for iOS
npm run prod:android  # Build for Android
npm run prod:web      # Web preview
```

## Environment Variables

Each environment file contains:

### API Configuration
- `API_BASE_URL` - Backend API base URL
- `API_TIMEOUT` - Request timeout in milliseconds
- `HTTP_LOG_LEVEL` - HTTP logging verbosity (0-3)

### Authentication
- `AUTH_PROVIDER` - Authentication provider (keycloak)
- `AUTH_REALM` - Auth realm
- `AUTH_CLIENT_ID` - OAuth client ID
- `TOKEN_ENCRYPTION_KEY` - 32-character encryption key

### App Configuration
- `ENVIRONMENT` - Current environment (dev, qa, staging, production)
- `APP_VERSION` - App version
- `DEBUG` - Debug mode toggle
- `ENABLE_MOCK_API` - Use mock API instead of real API
- `ENABLE_OFFLINE_SUPPORT` - Enable offline mode

### Services
- `ANALYTICS_ENABLED` - Enable analytics
- `ANALYTICS_KEY` - Analytics API key
- `SENTRY_ENABLED` - Enable error tracking
- `SENTRY_DSN` - Sentry error tracking DSN

### Localization
- `DEFAULT_LANGUAGE` - Default language (es, en)
- `DEFAULT_THEME` - Default theme (light, dark, system)

### EAS Build
- `EAS_PROJECT_ID` - EAS project ID
- `EAS_BUILD_CHANNEL` - EAS build channel

## How It Works

1. **Environment Detection**: The app detects the environment from `NODE_ENV` or `APP_ENV` variable
2. **File Loading**: `app.config.js` loads the corresponding `.env.{environment}` file
3. **Variable Injection**: All variables are injected into `app.extra` in Expo config

## Example: Customize for Your Setup

Edit each `.env.{environment}` file to match your backend URLs and configuration:

```bash
# .env.dev
API_BASE_URL=http://localhost:3000/
DEBUG=true
HTTP_LOG_LEVEL=3

# .env.prod
API_BASE_URL=https://api.production.com/
DEBUG=false
HTTP_LOG_LEVEL=0
```

## Important Notes

⚠️ **DO NOT** commit actual credentials or sensitive keys to version control. Use placeholder values and replace them with real values in your CI/CD pipeline or local setup.

For production deployments, use environment variables in your EAS Build secrets or CI/CD system.

## Accessing Environment Variables in Code

Use Expo's `Constants.expoConfig.extra`:

```typescript
import Constants from 'expo-constants';

const apiUrl = Constants.expoConfig?.extra?.apiUrl;
const debug = Constants.expoConfig?.extra?.debug;
```

Or use the existing service configuration (already set up in the project):

```typescript
import { getConfig } from '@/lib/config'; // if available
```
