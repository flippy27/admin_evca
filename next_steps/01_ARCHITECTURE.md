# Architecture: Web vs Mobile vs API

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Keycloak (Authentication)                │
└──────────────┬──────────────────────────────────────────────┘
               │ JWT Token (contains user_id_local, company_id_local, roles)
       ┌───────┴────────┬─────────────┐
       │                │             │
   ┌───▼──────┐    ┌───▼──────┐  ┌──▼──────┐
   │ Web App  │    │ Mobile   │  │ Desktop │
   │ Angular  │    │ React    │  │ (TBD)   │
   └───┬──────┘    │ Native   │  └─────────┘
       │           └───┬──────┘
       │               │
       └───────┬───────┘
               │
        ┌──────▼────────────────┐
        │ BFF (Backend-for-     │
        │ Frontend)             │
        │ api-emobility-bff     │
        │ 152 endpoints         │
        └──────┬────────────────┘
               │
        ┌──────▼─────────────────────┐
        │ Microservices & Databases  │
        │ Chargers, Sites, Auth,     │
        │ Reporting, Energy, etc.    │
        └────────────────────────────┘
```

## Layer Comparison

### Frontend Layer

| Aspect | Web (Angular) | Mobile (React Native) |
|--------|---------------|----------------------|
| Framework | Angular v20 (Standalone) | React Native + Expo |
| Routing | ng router (module-based) | Expo Router (file-based) |
| State Mgmt | NgRx signals | Zustand stores |
| HTTP Client | HttpClient (RxJS) | Axios |
| UI Library | Material + custom | React Native + Custom |
| Components | 120+ smart/dumb | 26 UI + 12 screens |
| CSS | SCSS + Angular styles | StyleSheet (RN) |
| Testing | Jasmine + Karma | Jest (planned) |
| Build | ng build (npm) | eas build (expo) |
| Auth Guard | canActivate, canMatch | usePermissionGuard hook |
| Permissions | ngx-permissions | Custom store + enum |
| Localization | i18n | hardcoded es/en |
| Charts | ApexCharts + AG Grid | (planned: Victory) |

### BFF Layer (Shared)

| Aspect | Implementation |
|--------|-----------------|
| Framework | NestJS (Node.js) |
| Architecture | DDD (Domain-Driven Design) |
| Response Format | `{meta, columns, payload, pagination}` |
| Endpoints | 152 total across 17 modules |
| Auth | JWT (Keycloak) + HMAC permission verification |
| Error Handling | Standardized error codes + messages |
| Rate Limiting | None currently |
| CORS | Configured for web/mobile |
| Request Timeout | 5-30s per service |
| Retry Logic | Single request (no built-in retry) |
| Caching | No caching layer |

### Data Models

**Core Entities:**
- Chargers (OCPP-enabled charging stations)
- Sites/Locations (physical locations with chargers)
- Charging Sessions (historical charge data)
- Connectors (ports on chargers)
- Vehicles (registered EVs)
- Users (admin/operators)
- Energy Resources (power sources)
- Alerts (system notifications)
- Firmware (charger updates)

**Company Structure:**
- Multi-tenant architecture
- All data scoped by company_id
- User permissions per company
- Location-based filtering

## Authentication Flow

```
┌─────────────┐
│   Login     │
└──────┬──────┘
       │ (username, password)
       ▼
┌─────────────────────────┐
│ Keycloak POST /token    │
└──────┬──────────────────┘
       │ Returns JWT
       ▼
┌──────────────────────┐
│ Extract JWT Claims:  │
│ - user_id_local      │
│ - company_id_local   │
│ - realm_access.roles │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────────┐
│ Store in SecureStore:    │
│ - access_token           │
│ - refresh_token (if /w)  │
│ - expires_at             │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Extract Permissions:     │
│ POST to BFF /permissions │
│ with HMAC-signed request │
└──────┬───────────────────┘
       │ Returns 35 permissions
       ▼
┌──────────────────────────┐
│ Store in auth.store:     │
│ - permissions array      │
│ - user object (userId,   │
│   companyId, email, etc) │
└──────────────────────────┘
```

**JWT Claims Example:**
```json
{
  "user_id_local": "fbe89b0c-7ff5-417c-8029-4db74bb3973b",
  "company_id_local": "e2722b79-58c6-4088-b145-b9b279b99ea2",
  "company_external_id": "5",
  "email": "user@company.com",
  "name": "Felipe Carrasco",
  "realm_access": {
    "roles": ["company-admin", "charger-read", ...]
  },
  "exp": 1713192000,
  "iat": 1713105600
}
```

## API Integration Pattern

### Web (Angular)

1. **Service Layer:**
   ```typescript
   // chargers.service.ts
   list(filters): Observable<ListResponse<Charger>> {
     return this.http.get<ListResponse<Charger>>('/chargers', {params})
   }
   ```

2. **Store Layer (NgRx Signals):**
   ```typescript
   fetchChargers$ = effect(() => {
     const filters = this.filterSignal();
     this.chargersService.list(filters).pipe(...).subscribe(...)
   })
   ```

3. **Component:**
   ```typescript
   chargers$ = this.store.chargers$;
   // Subscribe in template with async pipe
   ```

### Mobile (React Native)

1. **API Layer:**
   ```typescript
   // lib/api/chargers.api.ts
   export const chargersApi = {
     list: async (request: ChargersRequest) => {
       return await bffClient.post('/bff/chargers/company', request)
     }
   }
   ```

2. **Store Layer (Zustand):**
   ```typescript
   // lib/stores/chargers.store.ts
   fetchChargers: async (request) => {
     const res = await chargersApi.list(request)
     set({ chargers: res.data.payload })
   }
   ```

3. **Component:**
   ```typescript
   const { chargers, fetchChargers } = useChargersStore()
   useEffect(() => { fetchChargers(request) }, [deps])
   ```

### BFF (NestJS)

1. **Controller:**
   ```typescript
   @Post('bff/chargers/company')
   @UseGuards(JwtAuthGuard, CompanyGuard)
   async listChargers(@Body() req: ChargersRequest) {
     return this.chargersService.list(req)
   }
   ```

2. **Service:**
   ```typescript
   async list(req: ChargersRequest) {
     const chargers = await this.db.chargers.find({
       company_id: req.companyId,
       location_ids: req.payload.location_ids
     })
     return {
       meta: { success: true },
       payload: chargers,
       pagination: { page, total, total_pages }
     }
   }
   ```

## State Management Pattern

### Web (NgRx Signals)
- Centralized store
- Immutable updates
- Async effects

### Mobile (Zustand)
- Multiple specialized stores (12 total)
- Direct mutations via `set()`
- Async actions

**Stores in Mobile:**
1. `auth.store` - User, token, permissions
2. `chargers.store` - Chargers list, filters
3. `sites.store` - Sites list, filters
4. `charging-session.store` - Session history
5. `locations.store` - Location selection
6. `energy.store` - Energy resources
7. `reporting.store` - Reports
8. `profile.store` - User profile
9. `credentials.store` - API credentials
10. `alerts.store` - System alerts
11. `connectors.store` - Connector management
12. `app.store` - Global UI state

## Component Architecture

### Web
- Smart components (containers)
- Dumb components (presentational)
- Shared component library
- Material Design UI

### Mobile
- Screen components (routes)
- UI components (26 custom)
- Hooks for logic
- StyleSheet for styling
- React Native primitives

## Error Handling Strategy

### Web
- Global HTTP interceptor
- Per-service try/catch
- User toasts for errors
- Navigate to /error on critical failures

### Mobile
- Axios interceptors (request/response/error)
- Per-store try/catch
- User toasts for errors
- ErrorBoundary component (planned)
- Graceful fallback UI

### BFF
- NestJS exception filters
- Standardized error response format
- Error codes mapped to i18n messages
- Silent failures for 404 (return empty 200)

## Key Differences in Mobile Implementation

1. **No lazy loading** - All code bundled (Expo limitation)
2. **No CSS** - StyleSheet only
3. **No DOM** - React Native primitives
4. **No routing guards** - Implemented as hooks
5. **Simple auth** - Single JWT, no session timeout polling
6. **No server-side rendering** - Native app only
7. **Direct API calls** - No GraphQL or caching layer
8. **Linear navigation** - Stack navigator vs hierarchical tabs

## Performance Considerations

### Web
- Code splitting by module
- Lazy loading of features
- Image optimization
- CSS purging
- Service worker caching

### Mobile
- Flat bundle (no code splitting)
- Memory management (RN garbage collection)
- Image caching (React Native built-in)
- Network optimization (batch requests)
- Pagination for large lists

### BFF
- Database indexing
- Connection pooling
- Request timeouts (5-30s)
- No caching layer (implement on client)
- Pagination limits (default 20 items)

---

**Next:** Read `02_ENDPOINTS.md` for complete API endpoint reference.
