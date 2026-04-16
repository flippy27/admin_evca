# JWT Token Lifecycle

**Status:** ✅ Complete - Login, refresh, claims extraction, permission validation all implemented

## Token Structure

**Keycloak JWT (from POST /auth/login):**

```json
{
  "iss": "https://keycloak.example.com/auth/realms/emobility",
  "sub": "fbe89b0c-7ff5-417c-8029-4db74bb3973b",
  "aud": "admin-evca",
  "exp": 1713192000,
  "iat": 1713105600,
  "auth_time": 1713105600,
  "jti": "uuid-here",
  "user_id_local": "fbe89b0c-7ff5-417c-8029-4db74bb3973b",
  "company_id_local": "e2722b79-58c6-4088-b145-b9b279b99ea2",
  "company_external_id": "5",
  "email": "user@company.com",
  "name": "Felipe Carrasco",
  "email_verified": true,
  "realm_access": {
    "roles": ["company-admin", "charger-read", "charger-write"]
  },
  "resource_access": {
    "admin-evca": {
      "roles": ["admin", "user"]
    }
  }
}
```

**Claims:**
- `exp` - Token expiration (Unix timestamp)
- `iat` - Issued at time
- `user_id_local` - User UUID from Keycloak
- `company_id_local` - Company UUID
- `company_external_id` - Numeric company ID (e.g., "5")
- `email` - User email
- `name` - User full name
- `realm_access.roles` - List of roles

## Token Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│ 1. Login                                                 │
└──────────┬──────────────────────────────────────────────┘
           │
           ▼
    ┌──────────────────┐
    │ User enters      │
    │ email/password   │
    └────────┬─────────┘
             │
             ▼
    ┌─────────────────────────────┐
    │ POST /auth/login            │
    │ {username, password}        │
    │                             │
    │ Via: lib/api/auth.api.ts   │
    └────────┬────────────────────┘
             │
             ▼ Success
    ┌──────────────────────────────────┐
    │ Response:                        │
    │ {                                │
    │   access_token: "jwt...",        │
    │   refresh_token: "jwt...",       │
    │   expires_in: 3600 seconds,      │
    │   token_type: "Bearer"           │
    │ }                                │
    └────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────┐
│ 2. Extract JWT Claims                                     │
│                                                           │
│ lib/utils/jwt.ts: decodeJWT() + getJWTClaims()           │
└────────┬──────────────────────────────────────────────────┘
         │
         ├─ Split JWT: header.payload.signature
         │
         ├─ Decode payload (base64)
         │
         ├─ Extract claims:
         │  • user_id_local
         │  • company_id_local
         │  • email
         │  • name
         │  • roles
         │
         └─ Return ProcessedUser object
            {
              userId: string
              companyId: string
              email: string
              fullName: string
              roles: string[]
            }

┌──────────────────────────────────────────────────────────┐
│ 3. Store Tokens                                           │
│                                                           │
│ expo-secure-store (encrypted on device)                  │
└────────┬──────────────────────────────────────────────────┘
         │
         ├─ ACCESS_TOKEN → access_token value
         │  (3600 second lifetime)
         │
         ├─ REFRESH_TOKEN → refresh_token value
         │  (7 day lifetime)
         │
         └─ EXPIRES_AT → current_time + 3600 seconds
            (used to check if token expired)

┌──────────────────────────────────────────────────────────┐
│ 4. Store User Data                                        │
│                                                           │
│ lib/stores/auth.store.ts                                 │
└────────┬──────────────────────────────────────────────────┘
         │
         └─ Set auth.store state:
            {
              user: {
                userId: string
                companyId: string
                email: string
                fullName: string
              },
              permissions: string[],
              isAuthenticated: true
            }

┌──────────────────────────────────────────────────────────┐
│ 5. Fetch Permissions                                      │
│                                                           │
│ lib/api/auth.api.ts                                      │
└────────┬──────────────────────────────────────────────────┘
         │
         ▼
    ┌──────────────────────────────────────┐
    │ POST /bff/users/{userId}/permissions │
    │ ?companyId={companyId}               │
    │                                      │
    │ With HMAC-signed request body        │
    └────────┬─────────────────────────────┘
             │
             ▼ Success
    ┌──────────────────────────────────────┐
    │ Response:                            │
    │ {                                    │
    │   payload: [                         │
    │     { resource: "CHARGERS_VIEW",     │
    │       enabled: true },               │
    │     { resource: "CHARGERS_CREATE",   │
    │       enabled: false },              │
    │     ...                              │
    │   ]                                  │
    │ }                                    │
    └────────┬─────────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────────┐
    │ auth.store.permissions =             │
    │ ["CHARGERS_VIEW", "SITES_VIEW", ...] │
    └──────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ 6. Authenticated Requests                                 │
│                                                           │
│ All subsequent API calls include:                         │
│ Authorization: Bearer {access_token}                      │
└────────┬──────────────────────────────────────────────────┘
         │
         ▼
   lib/api/client.ts (axios instance)
   - Adds Authorization header
   - Checks if token expired
   - Refreshes if needed (see next section)
```

## Token Refresh Flow

**Triggered when:**
- API returns 401 (Unauthorized)
- Token expiration time reached
- Multiple concurrent 401s → single refresh (single-flight pattern)

```
API call returns 401
        │
        ▼
Axios error interceptor
        │
        ├─ Check if already refreshing
        │  (single-flight pattern)
        │
        ├─ If YES: Wait for refresh to complete,
        │  then retry original request
        │
        └─ If NO: Initiate refresh
           │
           ▼
      lib/stores/auth.store.ts: refreshAccessToken()
           │
           ├─ Get refresh_token from SecureStore
           │
           ├─ POST /auth/refresh
           │  {refresh_token}
           │
           ├─ Success:
           │  ├─ Get new access_token from response
           │  ├─ Update SecureStore with new token
           │  ├─ Update EXPIRES_AT
           │  ├─ Notify waiting requests (resolve promise)
           │  └─ API interceptor retries original request
           │     with new token
           │
           └─ Failure (refresh token expired):
              ├─ Remove tokens from SecureStore
              ├─ Clear auth.store
              ├─ Call onRefreshFailed callback
              └─ Redirect to /login

Result: User transparently re-authenticated
        (app keeps working without logout)
```

## Implementation Details

### 1. JWT Decoding

**File:** `lib/utils/jwt.ts`

```typescript
export function decodeJWT(token: string): any {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format')
    }

    // Decode payload (base64)
    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64').toString('utf-8')
    )

    return payload
  } catch (error) {
    logger.error('JWT decode failed', { error })
    return null
  }
}

export function getJWTClaims(token: string): ProcessedUser | null {
  const payload = decodeJWT(token)
  if (!payload) return null

  return {
    userId: payload.user_id_local,
    companyId: payload.company_id_local,
    email: payload.email,
    fullName: payload.name,
    roles: payload.realm_access?.roles || []
  }
}
```

### 2. Token Storage

**File:** `lib/api/client.ts`

```typescript
import * as SecureStore from 'expo-secure-store'

const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  EXPIRES_AT: 'expires_at'
}

export async function storeToken(
  accessToken: string,
  refreshToken: string,
  expiresIn: number
) {
  try {
    const expiresAt = new Date().getTime() + (expiresIn * 1000)
    
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEYS.ACCESS_TOKEN, accessToken),
      SecureStore.setItemAsync(TOKEN_KEYS.REFRESH_TOKEN, refreshToken),
      SecureStore.setItemAsync(TOKEN_KEYS.EXPIRES_AT, expiresAt.toString())
    ])

    logger.info('Token stored', { expiresAt })
  } catch (error) {
    logger.error('Failed to store token', { error })
    throw error
  }
}

export async function getStoredToken() {
  try {
    const accessToken = await SecureStore.getItemAsync(TOKEN_KEYS.ACCESS_TOKEN)
    const refreshToken = await SecureStore.getItemAsync(TOKEN_KEYS.REFRESH_TOKEN)
    const expiresAt = await SecureStore.getItemAsync(TOKEN_KEYS.EXPIRES_AT)

    return { accessToken, refreshToken, expiresAt }
  } catch (error) {
    logger.error('Failed to get stored token', { error })
    return { accessToken: null, refreshToken: null, expiresAt: null }
  }
}

export async function clearTokens() {
  try {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS_TOKEN),
      SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH_TOKEN),
      SecureStore.deleteItemAsync(TOKEN_KEYS.EXPIRES_AT)
    ])
    logger.info('Tokens cleared')
  } catch (error) {
    logger.error('Failed to clear tokens', { error })
  }
}
```

### 3. Axios Interceptors

**File:** `lib/api/client.ts`

```typescript
let refreshTokenPromise: Promise<string> | null = null

// Request interceptor: Add auth header
bffClient.interceptors.request.use(
  async config => {
    const { accessToken, expiresAt } = await getStoredToken()

    if (accessToken) {
      // Check if token expired
      if (expiresAt && parseInt(expiresAt) < new Date().getTime()) {
        // Token expired, attempt refresh
        logger.warn('Token expired, refreshing...')
        const newToken = await refreshAccessTokenSingleFlight()
        if (newToken) {
          config.headers.Authorization = `Bearer ${newToken}`
        }
      } else {
        config.headers.Authorization = `Bearer ${accessToken}`
      }
    }

    return config
  },
  error => Promise.reject(error)
)

// Response interceptor: Handle 401
bffClient.interceptors.response.use(
  response => response,
  async error => {
    const config = error.config

    if (error.response?.status === 401 && !config.__retry) {
      config.__retry = true

      try {
        const newToken = await refreshAccessTokenSingleFlight()
        if (newToken) {
          config.headers.Authorization = `Bearer ${newToken}`
          return bffClient(config)  // Retry original request
        }
      } catch (refreshError) {
        logger.error('Token refresh failed', { error: refreshError })
        // Trigger logout
        useAuthStore.getState().logout()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// Single-flight pattern: Only one refresh at a time
async function refreshAccessTokenSingleFlight() {
  if (refreshTokenPromise) {
    return refreshTokenPromise
  }

  refreshTokenPromise = useAuthStore.getState().refreshAccessToken()

  try {
    return await refreshTokenPromise
  } finally {
    refreshTokenPromise = null
  }
}
```

### 4. Refresh Action in Store

**File:** `lib/stores/auth.store.ts`

```typescript
interface AuthState {
  refreshAccessToken: () => Promise<string | null>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  refreshAccessToken: async () => {
    try {
      const { refreshToken } = await getStoredToken()
      
      if (!refreshToken) {
        logger.error('No refresh token available')
        return null
      }

      const response = await bffClient.post('/auth/refresh', {
        refresh_token: refreshToken
      })

      const { access_token, expires_in } = response.data

      // Store new token
      await storeToken(access_token, refreshToken, expires_in)

      logger.info('Token refreshed successfully')
      return access_token
    } catch (error) {
      logger.error('Token refresh failed', { error })
      
      // Clear tokens and logout
      await clearTokens()
      set({
        user: null,
        permissions: [],
        isAuthenticated: false
      })

      // Trigger logout callback
      useAuthStore.getState().onRefreshFailed?.()

      return null
    }
  }
}))
```

## Token Expiration Handling

**Option 1: Proactive Refresh (Recommended)**
```typescript
// Refresh token 60 seconds before expiration
useEffect(() => {
  const checkTokenExpiry = () => {
    const { expiresAt } = getStoredToken()
    const timeUntilExpiry = parseInt(expiresAt) - new Date().getTime()
    const refreshIn = timeUntilExpiry - (60 * 1000)  // 60s buffer

    if (refreshIn > 0) {
      setTimeout(() => {
        useAuthStore.getState().refreshAccessToken()
      }, refreshIn)
    }
  }

  checkTokenExpiry()
}, [])
```

**Option 2: Reactive Refresh (Current)**
```typescript
// Refresh only when API returns 401
// Simpler but user might experience brief error
```

## Session Restoration

**On app launch (in _layout.tsx):**

```typescript
useEffect(() => {
  const restoreSession = async () => {
    const { accessToken, refreshToken, expiresAt } = await getStoredToken()
    
    if (!accessToken) {
      // No session, show login
      router.replace('/login')
      return
    }

    // Check if token expired
    if (parseInt(expiresAt) < new Date().getTime()) {
      // Try to refresh
      const newToken = await useAuthStore.getState().refreshAccessToken()
      if (!newToken) {
        // Refresh failed, show login
        router.replace('/login')
        return
      }
    }

    // Extract claims from token
    const claims = getJWTClaims(accessToken)
    
    // Fetch permissions
    const permissions = await authApi.getPermissions(
      claims.userId,
      claims.companyId
    )

    // Restore session
    useAuthStore.setState({
      user: claims,
      permissions: permissions.payload.map(p => p.resource),
      isAuthenticated: true
    })

    // Show dashboard
    router.replace('/(app)/dashboard')
  }

  restoreSession()
}, [])
```

## Logout

```typescript
export const useAuthStore = create<AuthState>((set, get) => ({
  logout: async () => {
    // Clear all tokens
    await clearTokens()

    // Clear store
    set({
      user: null,
      permissions: [],
      isAuthenticated: false
    })

    // (Optional) POST /auth/logout to backend

    // Redirect to login
    useRouter().replace('/login')
  }
}))
```

## Testing Token Flows

```bash
# Test login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user@company.com","password":"password"}'

# Extract token and test refresh
REFRESH_TOKEN="..."
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refresh_token\":\"$REFRESH_TOKEN\"}"

# Decode JWT at jwt.io to verify claims
```

---

**Next:** Read `08_PERFORMANCE.md` for optimization strategies.
