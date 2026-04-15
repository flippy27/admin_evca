# admin_evca Architecture

Mobile app (React Native/Expo) mirroring **ui-emobility-web** (Angular) exactly.

## Features Status

| Feature | Web | Mobile | Notes |
|---------|-----|--------|-------|
| **Dashboard** | ✅ | 🟡 | Basic route exists, needs complete data/widgets |
| **Chargers** | ✅ | 🟡 | Routes: list, detail/live/history/config. Need all screens |
| **Sites** | ✅ | 🟡 | Routes: list, detail/profile. Need all screens |
| **Reporting** | ✅ | 🟡 | Routes exist, implementation missing |
| **Credentials** | ✅ | 🟡 | Route exists, implementation needed |
| **Energy Resources** | ✅ | ❌ | Not started |
| **Profile** | ✅ | 🟡 | Basic route exists, incomplete |
| **Users** | ✅ | ❌ | Not started |
| **Products** | ✅ | ❌ | Not started |
| **Design System** | ✅ | 🟡 | Components exist, needs showcase |

## Permissions System

Web uses **permission-based route guards** via:
- `ROUTE_PERMISSIONS_MAP` - config of required permissions per route
- `routePermissionGuard` - canActivate (check user permissions before entering)
- `routePermissionMatchGuard` - canMatch (prevent lazy-loading unauthorized bundles)
- `AuthPermissionsEnum` - all permission codes

**Mobile must implement same:**
- Auth store checks permissions before rendering routes
- Deep linking respects permissions
- Fallback navigation on forbidden

## Navigation Structure

```
Web (Angular Router):
/dashboard
/chargers
  /chargers-list
    /:id
      /live
      /history
      /configuration
/sites
  /sites-list
    /:id
      /profile
/reporting
/credentials
/energy-resources
/profile
/users
/authentication/login
/authentication/forgot-password
/authentication/reset-password

Mobile (Expo Router):
/(app)
  /(tabs)
    /dashboard
    /chargers
      /[id]
        /live
        /history
        /configuration
    /sites
      /[id]
        /profile
/(auth)
  /login
  /forgot-password
  /reset-password
```

## State Management

**Web:** Angular services + RxJS
**Mobile:** Zustand stores
  - `auth.store.ts` - authentication, session, user data, permissions
  - `app.store.ts` - global settings, theme
  - `chargers.store.ts` - chargers list, detail, filters
  - TODO: sites.store, reporting.store, etc

## API Integration

**Base URL:** Configured in `lib/config/env.ts`

### Authentication Flow
1. POST `/auth/login` → tokens
2. GET `/api/auth/permissions` → encrypted permissions
3. Decrypt + validate HMAC signature
4. Store in secure storage (`expo-secure-store`)

### Chargers Endpoints
- GET `/api/chargers` - list
- GET `/api/chargers/:id` - detail
- GET `/api/chargers/:id/live` - real-time data
- GET `/api/chargers/:id/history` - historical data
- GET `/api/chargers/:id/configuration` - OCPP config
- POST `/api/chargers/:id/configuration` - update config

### Sites Endpoints
- GET `/api/sites` - list
- GET `/api/sites/:id` - detail/profile

## Error Handling

**Web:**
- Interceptors for HTTP errors
- Toast notifications
- Logging service

**Mobile (TODO):**
- Need: Error interceptor in axios client
- Toast system (exists: `ToastContainer`)
- Logger service
- Network error handling
- Retry logic

## Robustness Checklist

- [ ] All routes protected by permission checks
- [ ] Error states handled (loading, error, empty)
- [ ] Network failures graceful (retry, offline indicator)
- [ ] Token refresh automatic (silent refresh on 401)
- [ ] Session validation on app resume
- [ ] Deep linking respects auth state
- [ ] All forms have validation + error messages
- [ ] No console errors or warnings
- [ ] Responsive design (mobile/tablet)
- [ ] Tests: unit, integration, e2e
