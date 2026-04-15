# EVCA Admin Mobile App - Development Guide

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`
- iOS/Android simulator or physical device

### Installation

```bash
# Install dependencies
npm install

# Copy environment template and configure
cp .env.example .env

# Start the app
npx expo start
```

## Configuration

### Environment Variables

Edit `.env` to configure:

```env
# API Server (defaults to http://localhost:3000)
API_BASE_URL=http://your-server:3000

# Encryption & HMAC (defaults to dev values)
TOKEN_ENCRYPTION_KEY=your-32-char-key
HMAC_SECRET=your-secret

# Feature Flags
ENABLE_MOCK_API=false        # Use mock data instead of API
ENABLE_DETAILED_LOGGING=true # Show debug logs
ENABLE_OFFLINE_SUPPORT=true  # Support offline mode

# App Configuration
ENVIRONMENT=development     # development, staging, production
DEFAULT_LANGUAGE=es         # es or en
DEFAULT_THEME=system        # light, dark, system
```

## Development Workflows

### Option 1: With Mock Data (No Backend Required)

Use mock data to develop UI without a backend:

```env
ENABLE_MOCK_API=true
```

Then modify `lib/api/mock.ts` to add/change test data. Mock data updates automatically without rebuilding.

### Option 2: With Local Backend

Start your backend on `http://localhost:3000`:

```env
API_BASE_URL=http://localhost:3000
ENABLE_MOCK_API=false
```

Then make API calls normally.

### Option 3: With Remote Backend

Point to development or staging server:

```env
API_BASE_URL=https://your-dev-api.example.com
```

## Testing API Endpoints

### Using Postman

1. Open Postman
2. Import `POSTMAN_COLLECTION.json`
3. Set variables:
   - `API_BASE_URL`: Your API server
   - `access_token`: Get from login endpoint
   - `refresh_token`: Get from login endpoint
4. Test endpoints one by one

### Using curl

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@evca.com","password":"password123"}'

# Get chargers (replace TOKEN)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/chargers?page=1&pageSize=20
```

## Key Screens

| Screen | Permission | Location | Features |
|--------|-----------|----------|----------|
| Login | None | `(auth)/login` | Email/password auth |
| Dashboard | DASHBOARD_VIEW | `(app)/dashboard` | System overview, stats |
| Chargers | CHARGERS_VIEW | `(app)/chargers` | List, search, detail, live |
| Sites | SITES_VIEW | `(app)/sites` | List, detail, chargers map |
| Profile | PROFILE_EDIT | `(app)/profile` | Edit user info, password |
| Reporting | REPORTS_VIEW | `(app)/reporting` | Reports & analytics |
| Credentials | CREDENTIALS_VIEW | `(app)/credentials` | View & manage API keys |
| Energy Resources | ENERGY_RESOURCES_VIEW | `(app)/energy-resources` | Monitor power sources |

## Permission Guards

All protected routes require specific permissions. If a user lacks permission, they're redirected to `/forbidden` screen.

Permissions are checked at:
1. **Route level** - `lib/config/route-permissions.ts` defines what's needed
2. **Component level** - `usePermissionGuard()` hook enforces at render

## Debugging

### Enable Detailed Logging

```env
ENABLE_DETAILED_LOGGING=true
```

Then check console output:

```bash
# Watch logs
npx expo start --android/--ios
```

### Common Issues

**"Cannot read property 'length' of undefined"**
- Check that API data is loading
- Verify API endpoint returns correct format
- Check `lib/stores/` for proper null handling

**"401 Unauthorized"**
- Token may have expired
- Check token refresh in `lib/api/client.ts`
- Re-login via auth screen

**"Network Error"**
- Verify API server is running
- Check `API_BASE_URL` in `.env`
- Check firewall/CORS settings

## TypeScript & Linting

```bash
# Type check
npx tsc --noEmit

# Run linter (if configured)
npm run lint
```

## Building for Production

```bash
# For iOS
eas build --platform ios

# For Android
eas build --platform android

# See app.config.js for EAS settings
```

## File Structure

```
admin_evca/
├── app/                          # Expo Router screens
│   ├── (auth)/                   # Auth group
│   │   └── login.tsx
│   ├── (app)/                    # App group (protected)
│   │   ├── dashboard/
│   │   ├── chargers/
│   │   ├── sites/
│   │   ├── profile/
│   │   ├── reporting/
│   │   ├── credentials/
│   │   ├── energy-resources/
│   │   └── forbidden.tsx
│   └── _layout.tsx               # Root layout with auth
├── components/                   # UI components
│   └── ui/                       # Reusable components
├── lib/
│   ├── api/                      # API clients & endpoints
│   ├── stores/                   # Zustand stores (state)
│   ├── hooks/                    # Custom React hooks
│   ├── types/                    # TypeScript types
│   ├── services/                 # Utility services
│   ├── config/                   # Configuration files
│   └── i18n/                     # Translations
├── assets/                       # Images, fonts, etc.
├── app.config.js                 # Expo configuration
├── .env.example                  # Environment template
├── POSTMAN_COLLECTION.json       # API docs
├── tsconfig.json                 # TypeScript config
└── package.json                  # Dependencies

```

## Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes following existing patterns
3. Test with mock data first
4. Test against real backend
5. Run `tsc --noEmit` to verify types
6. Commit: `git commit -m "Add feature description"`
7. Push: `git push origin feature/my-feature`

## Resources

- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
- [React Native Docs](https://reactnative.dev/)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [TypeScript Docs](https://www.typescriptlang.org/)
