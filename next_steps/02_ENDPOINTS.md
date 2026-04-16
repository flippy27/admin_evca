# Complete API Endpoint Reference

**Status:** 152 BFF endpoints from api-emobility-bff analyzed.
**Mobile Completion:** ~40% endpoints implemented, ~60% missing UI.

## Endpoint Organization by Module

### 1. Authentication (6 endpoints)

#### POST /auth/login
```typescript
Request: {
  username: string
  password: string
}
Response: {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: "Bearer"
}
```
**Status:** ✅ Implemented
**Location:** `lib/api/auth.api.ts`, `lib/stores/auth.store.ts`

#### POST /auth/refresh
```typescript
Request: {
  refresh_token: string
}
Response: {
  access_token: string
  expires_in: number
}
```
**Status:** ✅ Implemented (used by interceptor)

#### GET /auth/verify
**Status:** ❌ Not used (JWT introspection instead)

#### POST /auth/logout
**Status:** ❌ Not implemented (local logout only)

### 2. Users (8 endpoints)

#### GET /bff/users/{userId}/locations?companyId=X&enabled=true
```typescript
Request: (URL params only)
Response: {
  meta: { success: true }
  payload: [
    {
      location_id: "11",
      location_name: "Madrid Main",
      address: "string",
      city: "string",
      country: "string",
      enabled: boolean
    }
  ]
}
```
**Status:** ✅ Implemented
**Location:** `lib/api/locations.api.ts`

#### GET /bff/users/{userId}/permissions?companyId=X
```typescript
Request: (URL params)
Response: {
  meta: { success: true }
  payload: [
    {
      resource: "CHARGERS_VIEW",
      action: "VIEW",
      enabled: boolean
    }
  ]
}
```
**Status:** ✅ Implemented
**Location:** `lib/api/auth.api.ts`

#### GET /bff/users (list all users - admin)
**Status:** ❌ No UI, not implemented

#### POST /bff/users (create user - admin)
**Status:** ❌ No UI, not implemented

#### PUT /bff/users/{userId} (edit user)
**Status:** ❌ No UI, not implemented

#### DELETE /bff/users/{userId} (delete user - admin)
**Status:** ❌ No UI, not implemented

#### GET /bff/users/{userId}/profile
**Status:** ❌ No UI, not implemented

#### PUT /bff/users/{userId}/profile (edit own profile)
**Status:** ❌ No UI, not implemented

### 3. Chargers (22 endpoints)

#### POST /bff/chargers/company (list with filters)
```typescript
Request: {
  payload?: {
    date_start?: string (YYYY-MM-DD)
    date_end?: string
    timezone?: string
    charger_ids?: string[]
    ocpp_id?: string[]
    connector_ids?: string[]
    location_ids?: string[] // becomes repeated params
    license_plates?: string[]
  }
  filters?: {
    charger_status?: string
    charger_type?: string
    power_min?: number
    power_max?: number
    // ... 20+ filter options
  }
  pagination?: {
    page: number (default 1)
    per_page: number (default 20)
  }
  sort?: {
    by: string (default "charger_id")
    order: "ASC" | "DESC"
  }
}
Response: {
  meta: { success: true, operation: "list_chargers" }
  columns: [{ name: "charger_id", type: "string" }, ...]
  payload: [
    {
      charger_id: string
      ocpp_id: string
      location_id: string
      charger_type: string
      power_kw: number
      status: "available" | "charging" | "faulted" | "unavailable"
      connectors_count: number
      // ... 20+ fields
    }
  ]
  pagination: {
    page: 1
    per_page: 20
    total: 150
    total_pages: 8
  }
}
```
**Status:** 🟡 Partially implemented
**Issues:** 
- Location filtering not working (fixed - manual query string)
- Pagination not concatenating (fixed)
**Location:** `lib/api/chargers.api.ts`, `lib/stores/chargers.store.ts`

#### GET /bff/chargers/{id} (detail)
```typescript
Request: (URL param only)
Response: {
  meta: { success: true }
  payload: {
    charger_id: string
    ocpp_id: string
    location_id: string
    // ... all charger fields
    connectors: [
      {
        connector_id: string
        name: string
        type: "AC" | "DC"
        power_kw: number
        status: string
      }
    ]
  }
}
```
**Status:** ❌ API exists, no UI

#### POST /bff/chargers (create)
```typescript
Request: {
  charger_id: string (unique)
  location_id: string
  ocpp_id: string
  charger_type: string
  power_kw: number
  // ... required fields
}
Response: {
  meta: { success: true }
  payload: { charger_id: string }
}
```
**Status:** ❌ No create form UI

#### PUT /bff/chargers/{id} (edit)
**Status:** ❌ No edit form UI

#### DELETE /bff/chargers/{id}
**Status:** ❌ No delete confirmation UI

#### POST /bff/chargers/{id}/live (real-time status)
```typescript
Request: {}
Response: {
  meta: { success: true }
  payload: {
    charger_id: string
    status: string
    connectors: [
      {
        connector_id: string
        status: string
        power_kw: number (current)
        temperature_c: number
      }
    ]
  }
}
```
**Status:** ❌ SSE configured, not integrated to UI

#### POST /bff/chargers/{id}/history
```typescript
Request: {
  pagination?: { page: number, per_page: number }
  date_start?: string
  date_end?: string
}
Response: {
  meta: { success: true }
  payload: [ /* charger events */ ]
  pagination: { page, per_page, total, total_pages }
}
```
**Status:** ❌ API exists, no UI

#### POST /bff/chargers/{id}/config
```typescript
Request: {}
Response: {
  meta: { success: true }
  payload: {
    charger_id: string
    // ... 20+ config options
  }
}
```
**Status:** ❌ API exists, no edit UI

#### PUT /bff/chargers/{id}/config (update config)
**Status:** ❌ No config form UI

#### OCPP Commands (6 endpoints)

##### POST /bff/chargers/{id}/start-charge
```typescript
Request: {
  connector_id: string
  idTag?: string (RFID)
  reservationId?: number
}
Response: {
  meta: { success: true }
  payload: { transactionId: number }
}
```
**Status:** ❌ Command buttons not implemented

##### POST /bff/chargers/{id}/stop-charge
```typescript
Request: {
  transactionId: number
}
Response: {
  meta: { success: true }
  payload: {}
}
```
**Status:** ❌ Command not implemented

##### POST /bff/chargers/{id}/disable
```typescript
Request: {}
Response: {
  meta: { success: true }
}
```
**Status:** ❌ Command not implemented

##### POST /bff/chargers/{id}/enable
**Status:** ❌ Command not implemented

##### POST /bff/chargers/{id}/unlock-connector
```typescript
Request: {
  connector_id: string
}
Response: {
  meta: { success: true }
}
```
**Status:** ❌ Command not implemented

##### POST /bff/chargers/{id}/reboot
```typescript
Request: {}
Response: {
  meta: { success: true }
  payload: { restart_in_seconds: number }
}
```
**Status:** ❌ Command not implemented

### 4. Sites/Locations (12 endpoints)

#### POST /bff/sites/company (list)
**Status:** ❌ API exists, no UI screen

#### GET /bff/sites/{id}
**Status:** ❌ API exists, no UI

#### POST /bff/sites (create)
**Status:** ❌ No create form

#### PUT /bff/sites/{id} (edit)
**Status:** ❌ No edit form

#### DELETE /bff/sites/{id}
**Status:** ❌ No delete UI

### 5. Charging Sessions (8 endpoints)

#### POST /bff/charging-session/company (list)
```typescript
Request: {
  payload?: {
    location_ids?: string[]
    session_status?: string
    date_start?: string
    date_end?: string
  }
  filters?: { /* 20+ filter options */ }
  pagination?: { page: number, per_page: number }
}
Response: {
  meta: { success: true }
  payload: [
    {
      session_id: string
      charger_id: string
      location_id: string
      connector_id: string
      license_plate?: string
      rfid?: string
      session_start_datetime: string (ISO)
      session_stop_datetime: string (ISO)
      duration_minutes: number
      energy_kwh: number
      status: "completed" | "in_progress" | "failed"
      max_power_kw: number
      initial_soc?: number (battery %)
      final_soc?: number
    }
  ]
  pagination: { page, per_page, total, total_pages }
}
```
**Status:** 🟡 API integrated, UI needs work
**Location:** `lib/api/charging-session.api.ts`, `lib/stores/charging-session.store.ts`

#### GET /bff/charging-session/{id} (detail)
**Status:** ❌ No detail view

#### POST /bff/charging-session/export (CSV)
**Status:** ❌ No export UI

### 6. Reporting (18 endpoints)

#### POST /bff/reporting/chargers
```typescript
Request: {
  payload: {
    location_ids?: string[]
    date_start: string
    date_end: string
  }
  filters?: { /* various */ }
  pagination?: { page, per_page }
}
Response: {
  meta: { success: true }
  payload: [ /* charger reports */ ]
  pagination: { page, per_page, total, total_pages }
}
```
**Status:** ❌ No UI screen

#### POST /bff/reporting/sessions (energy analysis)
**Status:** ❌ No UI

#### POST /bff/reporting/sites (site analytics)
**Status:** ❌ No UI

#### POST /bff/reporting/pdf-export (PDF generation)
**Status:** ❌ No UI

### 7. Credentials (6 endpoints)

#### GET /bff/credentials
```typescript
Request: (no body)
Response: {
  meta: { success: true }
  payload: [
    {
      id: string
      name: string
      type: "api_key" | "oauth2"
      created_at: string
      expires_at?: string
      scope: string[]
    }
  ]
}
```
**Status:** ❌ No UI

#### POST /bff/credentials (create)
**Status:** ❌ No create form

#### DELETE /bff/credentials/{id}
**Status:** ❌ No delete UI

#### POST /bff/credentials/{id}/rotate (refresh key)
**Status:** ❌ No UI

### 8. Energy Resources (8 endpoints)

#### POST /bff/energy/company (list resources)
**Status:** ❌ API exists, no list UI

#### GET /bff/energy/{id} (detail)
**Status:** ❌ No detail UI

#### POST /bff/energy (create)
**Status:** ❌ No create form

#### PUT /bff/energy/{id} (edit)
**Status:** ❌ No edit form

#### POST /bff/energy/{id}/consumption (usage data)
**Status:** ❌ No analytics UI

### 9. Alerts (10 endpoints)

#### POST /bff/alerts/company (list)
**Status:** ❌ No UI

#### PUT /bff/alerts/{id}/acknowledge
**Status:** ❌ No acknowledge UI

#### DELETE /bff/alerts/{id}
**Status:** ❌ No delete UI

### 10. Firmware (6 endpoints)

#### GET /bff/firmware (available versions)
**Status:** ❌ No UI

#### POST /bff/firmware/upload
**Status:** ❌ No upload form

#### POST /bff/chargers/{id}/firmware/update
**Status:** ❌ No update UI

## Implementation Priority

### Tier 1 (Must Have) - Week 1
- [x] Auth endpoints (login, refresh)
- [x] Chargers list (POST /bff/chargers/company)
- [x] Sites list (POST /bff/sites/company)
- [x] Locations endpoint (GET /bff/users/{id}/locations)
- [x] Charging sessions list (POST /bff/charging-session/company)
- [ ] Charger detail (GET /bff/chargers/{id})
- [ ] Site detail (GET /bff/sites/{id})

### Tier 2 (Should Have) - Week 2
- [ ] CRUD for Chargers (POST, PUT, DELETE)
- [ ] CRUD for Sites (POST, PUT, DELETE)
- [ ] OCPP Commands (start, stop, disable, enable, unlock, reboot)
- [ ] Session detail view
- [ ] Charger config (GET, PUT)
- [ ] Live data (POST /bff/chargers/{id}/live)

### Tier 3 (Nice to Have) - Week 3+
- [ ] Reporting module (all 18 endpoints)
- [ ] Credentials management (6 endpoints)
- [ ] Energy resources (8 endpoints)
- [ ] Alerts (10 endpoints)
- [ ] Firmware management (6 endpoints)
- [ ] CSV/PDF export functionality

## Testing BFF Endpoints

Use Postman collection at: `/Users/idhemax/proyects/admin_evca/POSTMAN_COLLECTION.json`

Or test with curl:
```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user@company.com","password":"password"}'

# Get chargers with location filter
curl -X POST http://localhost:3000/bff/chargers/company \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {"location_ids": ["11", "12"]},
    "pagination": {"page": 1, "per_page": 20}
  }'
```

---

**Next:** Read `03_CRUD_OPERATIONS.md` for missing create/edit/delete forms.
