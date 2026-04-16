# Admin_evca Completion Roadmap

**Status:** 60-70% complete. This document maps complete path to 100% production-ready.

## Immediate Actions (Week 1)

### 1. Core API Integration
- [ ] Verify JWT token flow with real backend
- [ ] Test charging sessions endpoint (`POST /bff/charging-session/company`)
- [ ] Test chargers list with location filters
- [ ] Test sites list with location filters
- [ ] Implement 401 token refresh auto-retry

### 2. Location-Based Filtering
- [ ] Location selector dropdown working (done - verify in chargers/sites)
- [ ] Multi-select with "Select All" option
- [ ] Persist selection in Zustand store
- [ ] Apply filters to all list endpoints

### 3. Missing CRUD Forms
- [ ] Create Charger form (POST `/bff/chargers`)
- [ ] Edit Charger form (PUT `/bff/chargers/{id}`)
- [ ] Delete Charger (DELETE `/bff/chargers/{id}`)
- [ ] Same CRUD for Sites
- [ ] Add navigation to forms from list screens

### 4. Charging Sessions Complete
- [ ] Sessions list displaying (done - verify data)
- [ ] Session detail modal/sheet
- [ ] Session filters (date, location, status)
- [ ] Session export to CSV

## Phase 2 (Week 2-3)

### 5. OCPP Commands
- [ ] Start Charge command
- [ ] Stop Charge command
- [ ] Disable Charger command
- [ ] Enable Charger command
- [ ] Unlock Connector command
- [ ] Reboot Charger command
- [ ] Update Firmware command

### 6. Advanced Features
- [ ] Real-time charger status (SSE integration)
- [ ] Firmware update management
- [ ] Connector management
- [ ] Alerts and notifications
- [ ] Report generation (PDF export)

### 7. UI Polish
- [ ] Add all missing components (Modal, Tabs, DatePicker, etc.)
- [ ] Implement data tables for list views
- [ ] Add search/filter UI
- [ ] Add sorting UI
- [ ] Pagination with infinite scroll

## Phase 3 (Week 4)

### 8. Testing & Documentation
- [ ] Unit tests for stores
- [ ] Integration tests for API calls
- [ ] E2E tests for critical flows
- [ ] Component documentation
- [ ] API integration documentation

### 9. Performance & Robustness
- [ ] Implement request cancellation on unmount
- [ ] Add retry logic with exponential backoff
- [ ] Cache API responses where appropriate
- [ ] Offline detection and fallback UI
- [ ] Error boundaries on all screens

### 10. Security & Compliance
- [ ] Verify HMAC permission verification
- [ ] Secure token storage (already using expo-secure-store)
- [ ] SSL pinning if needed
- [ ] Permission checks on all routes (done)
- [ ] Audit logging

## Files to Create/Modify

| File | Status | Notes |
|------|--------|-------|
| `01_ARCHITECTURE.md` | Create | Architecture comparison web/mobile/api |
| `02_ENDPOINTS.md` | Create | All 152 BFF endpoints with examples |
| `03_CRUD_OPERATIONS.md` | Create | Missing create/edit/delete forms |
| `04_OCPP_COMMANDS.md` | Create | OCPP protocol commands |
| `05_DATA_FLOWS.md` | Create | Screen-by-screen data flow diagrams |
| `06_PERMISSIONS.md` | Create | 35 permissions and enforcement |
| `07_JWT_LIFECYCLE.md` | Create | Token handling, refresh, claims |
| `08_PERFORMANCE.md` | Create | Optimization strategies |
| `09_TESTING.md` | Create | Testing strategy |
| `10_COMPONENTS.md` | Create | UI component audit |
| `11_API_INTEGRATION_GUIDE.md` | Create | Step-by-step API integration |

## Success Criteria

**Week 1 (Functionality):**
- ✅ All API endpoints callable
- ✅ Token refresh automatic
- ✅ Location filtering working end-to-end
- ✅ Charging sessions display complete

**Week 2-3 (Feature Parity):**
- ✅ All CRUD operations working
- ✅ OCPP commands implemented
- ✅ Advanced features implemented
- ✅ UI visually matches web app

**Week 4 (Quality):**
- ✅ Test coverage > 70%
- ✅ Zero unhandled errors
- ✅ Offline mode graceful degradation
- ✅ Performance optimized (< 3s load times)

## Key Assumptions

1. Backend (api-emobility-bff) fully operational at configured URL
2. User has valid Keycloak account with assigned permissions
3. Mobile app runs on iOS 14+ or Android 10+
4. Network connectivity available (offline mode secondary)
5. Company structure with location-based filtering required

## Dependencies

- **Backend:** api-emobility-bff running and healthy
- **Auth:** Keycloak integration configured
- **Shared Types:** `/Users/idhemax/proyects/shared-types` synced
- **UI Web:** `/Users/idhemax/proyects/ui-emobility-web` reference implementation

## Questions to Clarify

1. Rate limiting strategy? (currently no limits observed)
2. Offline mode requirements? (currently online-only)
3. Caching strategy? (currently no caching)
4. Real-time updates via SSE or polling? (SSE configured but not integrated)
5. Export formats needed? (CSV, PDF, Excel?)
6. Multilingual support? (currently hardcoded es/en)
7. Dark mode support? (currently light only)
8. Progressive Web App on web? (not applicable for mobile)

---

**Next:** Read `01_ARCHITECTURE.md` for detailed system design.
