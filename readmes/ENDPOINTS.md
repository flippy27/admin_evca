# API Endpoints

Mapped from **ui-emobility-web** for **admin_evca** implementation.

## Base Configuration

- **Base URL:** `ENV.API_URL` (set in `lib/config/env.ts`)
- **Auth Header:** `Authorization: Bearer <accessToken>`
- **Encrypted Permissions:** GET `/api/auth/permissions` returns `{ encryptedData, iv, authTag, signature }`

## Authentication

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/auth/login` | POST | ✅ | Implemented: email + password → tokens |
| `/api/auth/permissions` | GET | ✅ | Implemented: returns encrypted permissions |
| `/auth/refresh-token` | POST | 🟡 | Stub: needed for silent token refresh |
| `/auth/logout` | POST | ❌ | Not checked in web, might not exist |

## Chargers

| Endpoint | Method | Status | Mobile Location | Notes |
|----------|--------|--------|-----------------|-------|
| `/api/chargers` | GET | ❌ | `app/(app)/chargers/` | List chargers with filters |
| `/api/chargers/:id` | GET | ❌ | `app/(app)/chargers/[id]/` | Charger detail |
| `/api/chargers/:id/live` | GET | ❌ | `app/(app)/chargers/[id]/live.tsx` | Real-time data (WebSocket or polling) |
| `/api/chargers/:id/history` | GET | ❌ | `app/(app)/chargers/[id]/history.tsx` | Historical data (24h, 7d, 30d) |
| `/api/chargers/:id/configuration` | GET | ❌ | `app/(app)/chargers/[id]/configuration.tsx` | OCPP configuration |
| `/api/chargers/:id/configuration` | POST | ❌ | `app/(app)/chargers/[id]/configuration.tsx` | Update OCPP config |
| `/api/chargers/:id/connectors/:connectorId` | GET | ❌ | Charger detail | Connector status |
| `/api/chargers/:id/sessions` | GET | ❌ | History view | Charging sessions |

## Sites

| Endpoint | Method | Status | Mobile Location | Notes |
|----------|--------|--------|-----------------|-------|
| `/api/sites` | GET | ❌ | `app/(app)/sites/` | List sites |
| `/api/sites/:id` | GET | ❌ | `app/(app)/sites/[id]/` | Site detail/profile |
| `/api/sites/:id/chargers` | GET | ❌ | Site detail | Chargers at site |
| `/api/sites/:id/energy` | GET | ❌ | Site detail | Energy usage |

## Reporting

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/reports` | GET | ❌ | List reports (filters: dateRange, status) |
| `/api/reports/:id` | GET | ❌ | Report detail |
| `/api/reports/generate` | POST | ❌ | Generate new report |

## Credentials

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/credentials` | GET | ❌ | List credentials |
| `/api/credentials` | POST | ❌ | Create credential |
| `/api/credentials/:id` | DELETE | ❌ | Revoke credential |

## Energy Resources

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/energy-resources` | GET | ❌ | List energy sources |
| `/api/energy-resources/:id` | GET | ❌ | Detail |

## Profile

| Endpoint | Method | Status | Mobile Location | Notes |
|----------|--------|--------|-----------------|-------|
| `/api/user/profile` | GET | ❌ | `app/(app)/profile/` | Current user profile |
| `/api/user/profile` | PUT | ❌ | `app/(app)/profile/` | Update profile |
| `/api/user/change-password` | POST | ❌ | Password change | Change password |

## Users (Admin Only)

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/users` | GET | ❌ | List users (paginated) |
| `/api/users` | POST | ❌ | Create user |
| `/api/users/:id` | PUT | ❌ | Update user |
| `/api/users/:id` | DELETE | ❌ | Delete user |
| `/api/users/:id/permissions` | GET | ❌ | User permissions |
| `/api/users/:id/permissions` | PUT | ❌ | Update permissions |

## Error Handling

All endpoints return standardized error format:

```json
{
  "success": false,
  "message": "Error message",
  "statusCode": 400,
  "path": "/api/chargers",
  "timestamp": "2024-04-15T12:00:00Z",
  "details": {
    "message": ["Validation error 1", "Validation error 2"],
    "error": "ValidationError",
    "statusCode": 400
  }
}
```

Common status codes:
- `401` - Unauthorized (invalid/expired token)
- `403` - Forbidden (lacks permission)
- `404` - Not found
- `422` - Validation error
- `500` - Server error

## Implementation Priority

1. **High:** Chargers list + detail (live/history/config)
2. **High:** Sites list + detail
3. **Medium:** Dashboard real data
4. **Medium:** Reporting
5. **Low:** Energy Resources, Users, Products

## Notes

- Web uses RxJS facades and Angular's HttpClient
- Mobile must use axios client with same error handling
- Token refresh should be silent (interceptor)
- All requests must include auth token
- Encrypted permissions must be decrypted + validated with HMAC-SHA256
