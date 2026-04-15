# Implementation Plan

Detailed roadmap to align **admin_evca** with **ui-emobility-web** feature parity.

## Phase 1: Foundation & Robustness (Critical)

### 1.1 Missing UI Components

**Create in `components/ui/`:**

- [ ] `Modal.tsx` - Alert/dialog modal (react-native Pressable + position absolute)
- [ ] `Tabs.tsx` - Tab navigation (state-based switching)
- [ ] `Table.tsx` - Data table with rows/cells
- [ ] `Select.tsx` - Dropdown picker (FlatList-based)
- [ ] `Checkbox.tsx` - Checkbox input
- [ ] `ErrorBoundary.tsx` - Error boundary wrapper
- [ ] `List.tsx` - Reusable list with lazy loading
- [ ] `SearchBar.tsx` - Search input with debounce
- [ ] `Pagination.tsx` - Pagination controls
- [ ] `Chart.tsx` - Basic chart wrapper (expo-chart or react-native-chart)

**Update `ComponentShowcase.tsx`:**
- [ ] Add all new components to showcase with examples

**Priority:** HIGH - blocks all detail screens and tables

### 1.2 Permission Guard Hook

**Create `lib/hooks/usePermissions.ts`:**
```ts
export function usePermissionGuard(requiredPermissions: string[], type: 'oneOf' | 'all' = 'oneOf'): boolean {
  const user = useAuthStore(state => state.user);
  const router = useRouter();
  
  const hasAccess = type === 'oneOf'
    ? requiredPermissions.some(p => user?.permissions?.includes(p))
    : requiredPermissions.every(p => user?.permissions?.includes(p));
  
  if (!hasAccess) {
    // Redirect to forbidden or fallback
    router.replace('/forbidden');
    return false;
  }
  
  return true;
}
```

**Create `app/(app)/_forbiddenGuard.tsx`:**
- [ ] Wrap app screens with permission checks
- [ ] Implement route fallback logic

**Priority:** HIGH - security critical

### 1.3 Error Handling & Logging

**Create `lib/services/logger.ts`:**
```ts
export const logger = {
  error(msg: string, error?: unknown) { console.error(msg, error); },
  warn(msg: string) { console.warn(msg); },
  info(msg: string) { console.info(msg); },
};
```

**Create `lib/services/errorHandler.ts`:**
```ts
export function handleError(error: unknown, toast: ToastFn) {
  if (axios.isAxiosError(error)) {
    const msg = error.response?.data?.message || error.message;
    toast.error(msg);
  } else {
    toast.error('An unexpected error occurred');
  }
  logger.error('Error:', error);
}
```

**Update `lib/api/client.ts`:**
- [ ] Add response error interceptor
- [ ] Extract error message and show toast

**Priority:** HIGH - prevents silent failures

### 1.4 Token Refresh Mechanism

**Update `lib/api/client.ts`:**
- [ ] Add interceptor to catch 401 responses
- [ ] Call `refreshAccessToken` from auth.store
- [ ] Retry original request with new token
- [ ] If refresh fails, redirect to login

**Update `lib/stores/auth.store.ts`:**
- [ ] Implement `refreshAccessToken` action (call `/auth/refresh-token`)

**Priority:** HIGH - session continuity

---

## Phase 2: API Integration (Core Features)

### 2.1 Chargers Feature - Complete

**Step 1: Create types**
- [ ] Create `lib/types/charger.types.ts`
- [ ] Copy charger models from web (web: `/features/chargers/models/`)
- [ ] Include: Charger, Connector, ChargerSession, OcppConfig

**Step 2: Update API client**
- [ ] Implement `lib/api/chargers.api.ts` (list, detail, live, history, config endpoints)
- [ ] Add pagination, filtering parameters
- [ ] Add error handling

**Step 3: Update Zustand store**
- [ ] Enhance `lib/stores/chargers.store.ts`
- [ ] Add: fetchList, fetchDetail, fetchLive, fetchHistory, updateConfig
- [ ] Handle loading/error states
- [ ] Cache management (don't refetch same data)

**Step 4: Update screens**
- [ ] `app/(app)/chargers/index.tsx` - Replace mock data with real API
  - [ ] Fetch on mount
  - [ ] Add loading/error states
  - [ ] Add pagination/infinite scroll
  - [ ] Add search/filter
- [ ] `app/(app)/chargers/[id]/live.tsx` - Create detail screen
  - [ ] Show charger status, power output, connector status
  - [ ] Real-time data (polling every 5s or WebSocket)
  - [ ] Connector detail on tap
- [ ] `app/(app)/chargers/[id]/history.tsx` - Create history screen
  - [ ] Date range picker (24h, 7d, 30d, custom)
  - [ ] Chart visualization
  - [ ] Sessions table
- [ ] `app/(app)/chargers/[id]/configuration.tsx` - Create config screen
  - [ ] Display OCPP settings
  - [ ] Edit form with validation
  - [ ] Save logic with success/error feedback

**Priority:** HIGHEST - main feature

### 2.2 Sites Feature - Complete

**Step 1: Create types**
- [ ] Create `lib/types/site.types.ts`
- [ ] Models: Site, SiteDetail

**Step 2: Create API client**
- [ ] Create `lib/api/sites.api.ts` (list, detail endpoints)

**Step 3: Create store**
- [ ] Create `lib/stores/sites.store.ts`

**Step 4: Create screens**
- [ ] `app/(app)/sites/index.tsx` - Sites list
  - [ ] Table with: name, location, charger count, status
  - [ ] API integration (replace stub)
  - [ ] Tap to detail
- [ ] `app/(app)/sites/[id]/profile.tsx` - Site detail
  - [ ] Info card: name, address, charger count
  - [ ] Chargers table at site
  - [ ] Edit button (if permitted)

**Priority:** HIGH

### 2.3 Profile Feature

**Step 1: Create API client**
- [ ] Create `lib/api/profile.api.ts` (getProfile, updateProfile, changePassword)

**Step 2: Create store**
- [ ] Create `lib/stores/profile.store.ts`

**Step 3: Update screen**
- [ ] `app/(app)/profile/index.tsx`
  - [ ] Display current user info (from auth.store.user)
  - [ ] Edit form: email, name
  - [ ] Change password section
  - [ ] Logout button

**Priority:** MEDIUM

### 2.4 Dashboard - Real Data

**Step 1: Create dashboard store**
- [ ] Create `lib/stores/dashboard.store.ts`
- [ ] Fetch: charger counts, site counts, energy usage

**Step 2: Update screen**
- [ ] `app/(app)/dashboard/index.tsx`
  - [ ] Replace mock stats with real API data
  - [ ] Add refresh on pull-down
  - [ ] Add loading states

**Priority:** MEDIUM

---

## Phase 3: Advanced Features

### 3.1 Reporting

**Screens to create:**
- [ ] `app/(app)/reporting/index.tsx` - Reports list
- [ ] `app/(app)/reporting/[id].tsx` - Report detail (modal)

**Features:**
- [ ] List with date range filter
- [ ] Generate new report
- [ ] Download/share

### 3.2 Credentials

**Screen:**
- [ ] `app/(app)/credentials/index.tsx`

**Features:**
- [ ] List API keys/tokens
- [ ] Create new credential
- [ ] Revoke credential

### 3.3 Energy Resources

**Screen:**
- [ ] `app/(app)/energy-resources/index.tsx`

**Features:**
- [ ] List energy sources
- [ ] Detail view

---

## Phase 4: Polish & Robustness

### 4.1 Data Validation

- [ ] Add form validation (react-hook-form or zod)
- [ ] Validate API responses against types
- [ ] Show field-level error messages

### 4.2 Loading & Empty States

- [ ] Skeleton loaders for data tables
- [ ] Empty state UI (no chargers found, etc.)
- [ ] Error state UI (failed to load data)

### 4.3 Offline Support (Optional)

- [ ] Detect network changes (NetInfo)
- [ ] Show offline indicator
- [ ] Queue failed requests (background sync)

### 4.4 Real-time Updates (Optional)

- [ ] WebSocket for live charger data
- [ ] Fallback to polling (every 5s)
- [ ] Implement in charger live/detail screens

---

## Implementation Order

**Do in this order** (dependencies):

1. ✅ Phase 1.1 - UI Components (Modal, Tabs, Table, etc.)
2. ✅ Phase 1.2 - Permission guards
3. ✅ Phase 1.3 - Error handling
4. ✅ Phase 1.4 - Token refresh
5. → Phase 2.1 - Chargers (full feature)
6. → Phase 2.2 - Sites (full feature)
7. → Phase 2.3 - Profile
8. → Phase 2.4 - Dashboard real data
9. → Phase 3 - Reporting, Credentials, Energy
10. → Phase 4 - Polish

**Estimated effort:**
- Phase 1: 2 days
- Phase 2.1: 3 days
- Phase 2.2: 2 days
- Phase 2.3: 1 day
- Phase 2.4: 1 day
- Phase 3: 2 days
- Phase 4: 1 day

**Total: ~12 days** for production-ready app

---

## Testing Strategy (Parallel)

- [ ] Unit tests for stores and API clients
- [ ] Integration tests for API flows
- [ ] Manual testing on iOS/Android
- [ ] Permission-based navigation testing
- [ ] Error scenario testing (network down, 401, 422, etc.)

---

## Deployment Checklist

Before shipping:
- [ ] All screens implemented and tested
- [ ] Permission guards working
- [ ] Error handling comprehensive
- [ ] No console warnings/errors
- [ ] Loading states on all API calls
- [ ] Responsive on small screens
- [ ] Dark mode working
- [ ] i18n keys complete
- [ ] Token refresh working
- [ ] Network resilience tested
