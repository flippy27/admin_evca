# API Integration Step-by-Step Guide

**Goal:** Get admin_evca calling real backend APIs and displaying live data.

## Prerequisites

1. **Backend running:** api-emobility-bff at http://localhost:3000 (or configured URL)
2. **Keycloak running:** Auth server configured
3. **Environment variables:** Copy .env.example to .env, update API_BASE_URL
4. **Test credentials:** Admin user account in Keycloak

## Step 1: Verify Backend Connectivity

```bash
# Test if backend is responding
curl http://localhost:3000/health

# Should return 200 OK with health status
# If 404 or timeout: backend not running
```

## Step 2: Test Authentication Flow

### 2a. Manual Login via Postman

1. Import POSTMAN_COLLECTION.json into Postman
2. POST to `/auth/login`
3. Body:
```json
{
  "username": "admin@company.com",
  "password": "password"
}
```
4. If 200: Note the `access_token` and `refresh_token` values
5. If 401/403: Check credentials with backend admin

### 2b. Test in App

1. Start dev server: `npm run dev` or `npx expo start`
2. Open app (simulator/device)
3. Enter credentials
4. Check React Native debugger console for logs:
   - "JWT Claims extracted"
   - "Permissions fetched: 15 permissions"
5. Should navigate to Dashboard automatically

**If stuck at login:**
- Check API_BASE_URL in .env matches backend
- Check Keycloak is running and accessible
- Look for 401/403/5xx errors in console
- Try disabling HTTPS requirement if needed

## Step 3: Verify User & Permission Data

```typescript
// In Dashboard useEffect, add logging:

useEffect(() => {
  const { user, permissions } = useAuthStore.getState()
  console.log('User:', user)
  console.log('Permissions:', permissions)
}, [])
```

**Expected output:**
```
User: {
  userId: "fbe89b0c-7ff5-417c-8029-4db74bb3973b",
  companyId: "e2722b79-58c6-4088-b145-b9b279b99ea2",
  email: "admin@company.com",
  fullName: "Admin User"
}
Permissions: [
  "CHARGERS_VIEW", "CHARGERS_CREATE", "CHARGERS_EDIT",
  "SITES_VIEW", "REPORTS_VIEW", ...
]
```

**If userId is undefined:**
- Check JWT decoding in lib/utils/jwt.ts
- Verify Keycloak is returning `user_id_local` claim
- Enable logging in getJWTClaims()

## Step 4: Test Locations API

```typescript
// In Dashboard useEffect:

useEffect(() => {
  const fetchLocationsTest = async () => {
    try {
      const { user } = useAuthStore.getState()
      const response = await fetch(
        `http://localhost:3000/bff/users/${user?.userId}/locations?companyId=${user?.companyId}&enabled=true`,
        {
          headers: {
            Authorization: `Bearer ${/* get token from SecureStore */}`
          }
        }
      )
      const data = await response.json()
      console.log('Locations response:', data)
    } catch (error) {
      console.error('Locations error:', error)
    }
  }

  fetchLocationsTest()
}, [user])
```

**Expected response:**
```json
{
  "payload": [
    {
      "location_id": "11",
      "location_name": "Madrid Main",
      "address": "...",
      "enabled": true
    }
  ]
}
```

**If empty array:**
- Check companyId is correct (not null/undefined)
- Verify locations exist in backend for that company
- Check enabled=true filter

## Step 5: Test Chargers API

### 5a. Via Postman

1. POST to `/bff/chargers/company`
2. Headers: `Authorization: Bearer {token}`
3. Body:
```json
{
  "payload": {
    "location_ids": ["11", "12"]
  },
  "pagination": {
    "page": 1,
    "per_page": 20
  }
}
```

**Expected response:**
```json
{
  "meta": { "success": true },
  "payload": [
    {
      "charger_id": "CHG-001",
      "ocpp_id": "OCH-123",
      "location_id": "11",
      "status": "available",
      "power_kw": 22,
      "connectors_count": 2
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 42,
    "total_pages": 3
  }
}
```

**If empty payload:**
- Check location_ids exist and have chargers
- Verify charger status in backend

### 5b. In App (Chargers Screen)

1. Login to app
2. Navigate to Chargers tab
3. Check if chargers list appears

**If still empty/error:**
- Add console.log in chargers.store fetchChargers()
- Log full request and response
- Check error message if any

## Step 6: Test Charging Sessions API

1. Navigate to Chargers → Sessions tab
2. Should show charging session history

**If empty:**
- Check if sessions exist in backend for date range
- Verify filtering dates are correct

## Step 7: Set Up Environment Variables

```bash
# .env
API_BASE_URL=http://localhost:3000
ENVIRONMENT=development
DEBUG=true

# Optional:
# USER_MGMT_URL=https://keycloak.example.com
```

**Build with env:**
```bash
# Using app.config.js
eas build --profile preview

# Or locally
npx expo start --platform ios
```

## Step 8: Test Each Feature

### Dashboard
- [ ] User name displays
- [ ] Company name displays
- [ ] Location selector shows locations
- [ ] Chargers count shows
- [ ] Sites count shows

### Chargers List
- [ ] Filter by location works
- [ ] Scroll to load more works (infinite scroll)
- [ ] Click charger → detail screen

### Charger Detail
- [ ] All fields display
- [ ] Connectors list shows
- [ ] Status badge shows
- [ ] Tabs available (if implemented)

### Sites List
- [ ] List shows
- [ ] Click site → detail

### Reporting
- [ ] Date range picker works
- [ ] Generate report works
- [ ] Charts display

## Step 9: Implement Missing Features

### Priority Order

1. **Week 1:**
   - [ ] Charger detail screen (GET /bff/chargers/{id})
   - [ ] Site detail screen (GET /bff/sites/{id})
   - [ ] Modal component for details
   - [ ] Test with real backend

2. **Week 2:**
   - [ ] Create Charger form (POST /bff/chargers)
   - [ ] Edit Charger form (PUT /bff/chargers/{id})
   - [ ] Delete Charger (DELETE /bff/chargers/{id})
   - [ ] Same for Sites

3. **Week 3:**
   - [ ] OCPP commands (start, stop, disable, etc.)
   - [ ] Reporting forms and charts
   - [ ] Credentials management
   - [ ] Advanced filtering

## Step 10: Error Handling Testing

### Test 401 (Token Expired)

```typescript
// Simulate expired token
await SecureStore.setItemAsync('expires_at', '1')

// Navigate and make API call
// Should auto-refresh token and retry
```

**If doesn't auto-refresh:**
- Check refreshAccessToken() in auth.store.ts
- Check axios interceptors in client.ts
- Enable logging to see refresh attempt

### Test 403 (No Permission)

```typescript
// With user that lacks CHARGERS_DELETE permission
// Navigate to charger and try delete button
// Should show "No permission" error or hide button
```

### Test Network Error

```typescript
// Disconnect network
// Try to load data
// Should show error toast with retry button
// Click retry after reconnecting
// Should work again
```

## Step 11: Performance Testing

### Load 100+ Items

```bash
# Create test data in backend
POST /bff/chargers with bulk insert

# In app: Load chargers list
# Should not freeze or lag
# Scroll to load more pages smoothly
```

### Measure Load Times

```typescript
// Add timing to stores
fetchChargers: async () => {
  const start = performance.now()
  // ... fetch logic
  const duration = performance.now() - start
  logger.info(`Fetched in ${duration.toFixed(0)}ms`)
}
```

## Troubleshooting

### 401 on Every Request

```
Problem: All API calls return 401
Cause: Token not being sent in header
Fix:
1. Verify bffClient.post() adds Authorization header
2. Check token is stored in SecureStore
3. Log axios request interceptor
```

### 404 on Endpoints

```
Problem: POST /bff/chargers/company returns 404
Cause: Endpoint doesn't exist in backend
Fix:
1. Check POSTMAN_COLLECTION for correct endpoint
2. Verify backend module is loaded
3. Check BFF is running on correct port
```

### CORS Errors

```
Problem: Browser console shows CORS error
Cause: Backend not configured for mobile domain
Fix:
1. Backend should allow http://localhost:* for dev
2. Or use proxy in development
3. Production: Backend should allow production domain
```

### Infinite Scroll Not Working

```
Problem: Only first page shows, no "Load More" button
Cause: Pagination logic broken
Fix:
1. Check totalPages > 1 in response
2. Verify page !== totalPages before showing button
3. Check fetchChargers concatenates: [...get().chargers, ...newItems]
```

### Blank Screens After Login

```
Problem: App crashes or shows blank after successful login
Cause: Missing error boundary or unhandled exception
Fix:
1. Check React Native debugger console for errors
2. Verify auth.store state is valid
3. Check Dashboard has permission guard
4. Verify useLocationsStore doesn't throw
```

## API Integration Checklist

### Core Auth ✅
- [x] Login (POST /auth/login)
- [x] Token refresh (POST /auth/refresh)
- [x] Permissions (GET /bff/users/{id}/permissions)
- [x] Locations (GET /bff/users/{id}/locations)

### Chargers (Partial)
- [x] List (POST /bff/chargers/company)
- [x] Sessions (POST /bff/charging-session/company)
- [ ] Detail (GET /bff/chargers/{id})
- [ ] Create (POST /bff/chargers)
- [ ] Edit (PUT /bff/chargers/{id})
- [ ] Delete (DELETE /bff/chargers/{id})
- [ ] OCPP: Start (POST /bff/chargers/{id}/start-charge)
- [ ] OCPP: Stop (POST /bff/chargers/{id}/stop-charge)
- [ ] OCPP: Disable (POST /bff/chargers/{id}/disable)
- [ ] OCPP: Enable (POST /bff/chargers/{id}/enable)
- [ ] OCPP: Unlock (POST /bff/chargers/{id}/unlock-connector)
- [ ] OCPP: Reboot (POST /bff/chargers/{id}/reboot)

### Sites
- [ ] List (POST /bff/sites/company)
- [ ] Detail (GET /bff/sites/{id})
- [ ] Create (POST /bff/sites)
- [ ] Edit (PUT /bff/sites/{id})
- [ ] Delete (DELETE /bff/sites/{id})

### Reporting
- [ ] Chargers report (POST /bff/reporting/chargers)
- [ ] Sessions report (POST /bff/reporting/sessions)
- [ ] Sites report (POST /bff/reporting/sites)
- [ ] Export PDF (POST /bff/reporting/pdf-export)

### Other
- [ ] Credentials (GET, POST, DELETE /bff/credentials)
- [ ] Energy resources (POST /bff/energy/company)
- [ ] User management (GET, POST, PUT /bff/users)
- [ ] Alerts (GET, PUT /bff/alerts)
- [ ] Firmware (GET, POST /bff/firmware)

---

**Summary:** Use this guide as your step-by-step implementation plan. Each step builds on previous work. After Step 5, you have a working MVP. After Step 9, you have feature-complete app. After Step 10, you have production-ready error handling.
