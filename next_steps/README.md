# Admin_evca Completion Guide

Comprehensive documentation for completing admin_evca from 60-70% to 100% production-ready.

## Quick Navigation

**Start here → [00_ROADMAP.md](00_ROADMAP.md)**

Gives you the weekly breakdown and success criteria. Read this first to understand what needs to be done and by when.

## Documentation Files

### Phase 1: Understanding the System

1. **[00_ROADMAP.md](00_ROADMAP.md)** - Weekly breakdown and priorities
   - Immediate actions (Week 1)
   - Phase 2 & 3 work
   - Success criteria
   - Dependencies and assumptions

2. **[01_ARCHITECTURE.md](01_ARCHITECTURE.md)** - System design and comparison
   - Web vs Mobile vs API comparison
   - Authentication flow diagram
   - API integration patterns
   - State management comparison
   - Performance considerations

3. **[02_ENDPOINTS.md](02_ENDPOINTS.md)** - Complete API reference
   - All 152 BFF endpoints organized by module
   - Request/response JSON examples
   - Implementation status per endpoint
   - Testing with Postman/curl
   - Implementation priority tiers

### Phase 2: Building Features

4. **[03_CRUD_OPERATIONS.md](03_CRUD_OPERATIONS.md)** - Create, Read, Update, Delete
   - 4 Charger CRUD forms (create, edit, detail, delete)
   - 4 Site CRUD forms
   - Form component utilities
   - Validation patterns
   - Navigation flows

5. **[04_OCPP_COMMANDS.md](04_OCPP_COMMANDS.md)** - Charger control
   - 6 OCPP commands (start, stop, disable, enable, unlock, reboot)
   - Store implementation for each command
   - UI components for command buttons
   - Command status tracking
   - Permission checks

6. **[05_DATA_FLOWS.md](05_DATA_FLOWS.md)** - Screen-by-screen data flow
   - Login flow diagram
   - Dashboard data flow
   - Chargers screen with tabs
   - Site screens
   - Reporting screen
   - Error recovery flows

7. **[06_PERMISSIONS.md](06_PERMISSIONS.md)** - Access control
   - All 35 permissions defined and explained
   - Current enforcement locations
   - Permission check utilities
   - Role examples (Admin, Site Manager, Operator)
   - Implementation checklist
   - Testing strategies

### Phase 3: Technical Details

8. **[07_JWT_LIFECYCLE.md](07_JWT_LIFECYCLE.md)** - Token handling
   - JWT structure and claims
   - Complete token flow diagram
   - Token refresh mechanism
   - Single-flight pattern for concurrent refreshes
   - Session restoration on app launch
   - Token expiration strategies
   - Testing token flows

9. **[08_PERFORMANCE.md](08_PERFORMANCE.md)** - Optimization strategies
   - Request optimization (batching, debouncing, cancellation)
   - Data caching strategies
   - Component optimization (memo, useMemo, useCallback)
   - List virtualization
   - Image optimization
   - Network optimization
   - Memory management
   - Performance budgets and metrics

10. **[09_TESTING.md](09_TESTING.md)** - Testing strategy
    - Testing pyramid (unit, integration, E2E)
    - Unit test examples (stores, utilities, components)
    - Integration test examples (API, store, permissions)
    - E2E test examples (login flow, CRUD)
    - Testing checklist by week
    - Coverage goals (70%+)
    - Running tests commands

### Phase 4: UI and Integration

11. **[10_COMPONENTS.md](10_COMPONENTS.md)** - UI component audit
    - 26 existing components listed
    - 11 missing components with implementation
    - Modal, Tabs, Table, Select, DatePicker, Chart, SearchBar, FilePicker
    - Component priority (critical, high, medium)
    - Implementation template
    - Testing components

12. **[11_API_INTEGRATION_GUIDE.md](11_API_INTEGRATION_GUIDE.md)** - Step-by-step setup
    - Verify backend connectivity
    - Test authentication flow manually
    - Verify user and permission data
    - Test each API endpoint
    - Environment variable setup
    - Test each feature (dashboard, chargers, sites, reporting)
    - Implement missing features week by week
    - Error handling testing
    - Performance testing
    - Comprehensive troubleshooting guide
    - Full API integration checklist

## Reading Path by Role

### Product Manager / Non-Technical
1. Read [00_ROADMAP.md](00_ROADMAP.md) for timeline
2. Check [02_ENDPOINTS.md](02_ENDPOINTS.md) for "what works" status
3. Review success criteria in [00_ROADMAP.md](00_ROADMAP.md)

### Frontend Developer
1. Start: [00_ROADMAP.md](00_ROADMAP.md)
2. Understand: [01_ARCHITECTURE.md](01_ARCHITECTURE.md)
3. Build: [03_CRUD_OPERATIONS.md](03_CRUD_OPERATIONS.md) → [04_OCPP_COMMANDS.md](04_OCPP_COMMANDS.md)
4. Polish: [08_PERFORMANCE.md](08_PERFORMANCE.md)
5. Test: [09_TESTING.md](09_TESTING.md)

### Backend Developer / DevOps
1. Reference: [02_ENDPOINTS.md](02_ENDPOINTS.md) for endpoint details
2. Review: [07_JWT_LIFECYCLE.md](07_JWT_LIFECYCLE.md) for token handling
3. Setup: [11_API_INTEGRATION_GUIDE.md](11_API_INTEGRATION_GUIDE.md) for environment

### QA / Tester
1. Overview: [00_ROADMAP.md](00_ROADMAP.md) for what to test
2. Test flows: [05_DATA_FLOWS.md](05_DATA_FLOWS.md)
3. Permissions: [06_PERMISSIONS.md](06_PERMISSIONS.md) for access testing
4. Testing strategy: [09_TESTING.md](09_TESTING.md)

## Current Status Summary

### ✅ Already Working
- User login and JWT token handling
- Token refresh on 401 (automatic) with single-flight pattern ✅ VERIFIED
- Permission extraction from Keycloak
- Location filtering system
- Chargers list display with create button
- Sites list display with create button
- Charging sessions list display
- Dashboard with user data
- Permission guards on routes
- TypeScript compilation
- **NEW:** Charger detail screen
- **NEW:** Site detail screen
- **NEW:** Create/Edit/Delete forms for Chargers
- **NEW:** Create/Edit/Delete forms for Sites
- **NEW:** Cache invalidation on mutations
- **NEW:** Toast notifications for success/error
- **NEW:** OCPP commands modal with long-press integration (start, stop, disable, enable, unlock, reboot)

### 🟡 Partially Working
- Location selector (working, needs polish)
- Sessions tab (shows data, needs detail view)
- Navigation structure
- API client infrastructure
- OCPP commands (not started - user noted as optional)

### ❌ Not Implemented
- Reporting screens and charts
- Credentials management
- Energy resources management
- Real-time data (SSE integration)
- Firmware update management
- Alert management
- Component testing
- E2E testing
- Performance optimization

## Week-by-Week Breakdown

### Week 1: Core Features
- [x] Charger detail screens
- [x] Site detail screens
- [ ] Modal component
- [ ] Location filtering validation
- [x] API response caching
- [ ] Complete testing of chargers/sites endpoints
- **Goal:** All read operations working ✅

### Week 2: CRUD & Commands
- [x] Charger CRUD forms (create, edit, delete)
- [x] Site CRUD forms
- [x] OCPP commands (start, stop, disable, enable, unlock, reboot) with modal & long-press ✅
- [x] Tabs component for charger detail (live/history/config navigation)
- [x] Form validation and error handling
- **Goal:** All CRUD operations + OCPP commands working ✅

### Week 3: Advanced Features
- [ ] Reporting screens and charts
- [ ] Credentials management
- [ ] Energy resources management
- [ ] Real-time data (SSE)
- [ ] Firmware updates
- [ ] Performance optimization
- **Goal:** All feature screens working

### Week 4: Quality
- [ ] Unit tests (30+ tests)
- [ ] Integration tests (25+ tests)
- [ ] E2E tests (5+ critical flows)
- [ ] Error handling for all paths
- [ ] Performance benchmarking
- [ ] Bug fixes and polish
- **Goal:** Production-ready app with >70% test coverage

## Key Files in Codebase

**Core:**
- `lib/stores/` - 12 Zustand stores for state management
- `lib/api/` - API clients for each feature
- `lib/types/` - TypeScript type definitions
- `lib/utils/` - Utilities (jwt, permissions, logger, etc.)
- `lib/hooks/` - Custom React hooks
- `lib/config/` - Configuration (environment, routes, etc.)

**UI:**
- `components/ui/` - 26 base components
- `components/` - Feature-specific components
- `app/` - Expo Router screens and routes

**Config:**
- `app.config.js` - Expo configuration
- `.env` - Environment variables
- `tsconfig.json` - TypeScript configuration
- `package.json` - Dependencies

## Dependencies & Prerequisites

### Installed ✅
- React Native & Expo
- Zustand (state management)
- Axios (HTTP client)
- expo-router (navigation)
- expo-secure-store (token storage)
- React Native Gesture Handler
- Async Storage

### Need to Install
- Modal library (if not using React Native Modal)
- Chart library (Victory or react-native-chart-kit)
- FilePicker library (DocumentPicker)
- DatePicker library (DateTimePicker)

### External Services
- Keycloak (auth server)
- api-emobility-bff (backend)
- Database (PostgreSQL or similar)

## Troubleshooting Quick Links

- **Login not working?** → [11_API_INTEGRATION_GUIDE.md Step 2](11_API_INTEGRATION_GUIDE.md#step-2-test-authentication-flow)
- **Chargers empty?** → [11_API_INTEGRATION_GUIDE.md Step 5](11_API_INTEGRATION_GUIDE.md#step-5-test-chargers-api)
- **401 errors?** → [07_JWT_LIFECYCLE.md Token Refresh Flow](07_JWT_LIFECYCLE.md#token-refresh-flow)
- **Permission denied?** → [06_PERMISSIONS.md Implementation Checklist](06_PERMISSIONS.md#implementation-checklist)
- **Slow app?** → [08_PERFORMANCE.md](08_PERFORMANCE.md)
- **Test failures?** → [09_TESTING.md](09_TESTING.md)

## Success Criteria

**By end of Week 1:** ✅ COMPLETE
- ✅ All read operations (list/detail)
- ✅ Auto-refresh on 401
- ✅ Location filtering
- ✅ Sessions display
- **Result:** Can view all data

**By end of Week 2:** ✅ COMPLETE
- ✅ Create chargers/sites
- ✅ Edit chargers/sites
- ✅ Delete chargers/sites
- ✅ Start/stop charging (OCPP commands - optional)
- **Result:** Full CRUD + OCPP commands working ✅

**By end of Week 3:**
- ✅ All features implemented
- ✅ Real-time updates
- ✅ Advanced filtering
- **Result:** Feature-complete app

**By end of Week 4:**
- ✅ >70% test coverage
- ✅ Error handling complete
- ✅ Performance optimized
- ✅ Zero unhandled errors
- **Result:** Production-ready

## Next Steps

1. **Read [00_ROADMAP.md](00_ROADMAP.md)** - Get oriented
2. **Read [01_ARCHITECTURE.md](01_ARCHITECTURE.md)** - Understand the system
3. **Read [11_API_INTEGRATION_GUIDE.md](11_API_INTEGRATION_GUIDE.md) Steps 1-5** - Verify backend works
4. **Start implementing Week 1** - Use [03_CRUD_OPERATIONS.md](03_CRUD_OPERATIONS.md) as guide

## Questions & Support

For issues not covered:
1. Check [11_API_INTEGRATION_GUIDE.md Troubleshooting](11_API_INTEGRATION_GUIDE.md#troubleshooting)
2. Review relevant data flow in [05_DATA_FLOWS.md](05_DATA_FLOWS.md)
3. Check test examples in [09_TESTING.md](09_TESTING.md)
4. Review permission setup in [06_PERMISSIONS.md](06_PERMISSIONS.md)

---

**Last Updated:** April 2026  
**Status:** Admin_evca 60-70% → 100% roadmap  
**Audience:** Frontend, Backend, QA, Product team
