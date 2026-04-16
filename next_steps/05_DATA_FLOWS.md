# Data Flow Diagrams - Screen-by-Screen

**Shows:**
- What API calls happen
- Call order and dependencies
- Data transformations
- Error handling paths
- Caching/refresh logic

## 1. Login Screen → Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│ Login Screen (/auth/login)                                  │
└────────────────┬────────────────────────────────────────────┘
                 │ User enters email + password
                 ▼
        ┌─────────────────────┐
        │ POST /auth/login     │
        │ {username, password} │
        └────────┬────────────┘
                 │ Returns: access_token, refresh_token
                 ▼
        ┌────────────────────────┐
        │ Decode JWT             │
        │ Extract claims:        │
        │ - user_id_local        │
        │ - company_id_local     │
        │ - email, name          │
        │ - roles                │
        └────────┬───────────────┘
                 │
                 ▼
        ┌──────────────────────────────┐
        │ POST /bff/users/{userId}/    │
        │ permissions?companyId=X      │
        │                              │
        │ Returns 35 permissions array │
        └────────┬─────────────────────┘
                 │
                 ▼
        ┌──────────────────────────────┐
        │ Store in SecureStore:        │
        │ - access_token               │
        │ - refresh_token              │
        │ - expires_at                 │
        │                              │
        │ Store in auth.store:         │
        │ - user {id, company, email}  │
        │ - permissions array          │
        │ - isAuthenticated = true     │
        └────────┬─────────────────────┘
                 │
                 ▼
        ┌──────────────────┐
        │ Navigate to      │
        │ Dashboard        │
        └──────────────────┘
```

## 2. Dashboard Screen

```
┌──────────────────────────────────────┐
│ Dashboard (/dashboard)               │
│ on component mount (useEffect)       │
└───────────┬──────────────────────────┘
            │
            ├─► Check if user logged in
            │   ├─ YES: Continue
            │   └─ NO: Redirect to /login
            │
            ├─► Check permissions (DASHBOARD_VIEW)
            │   ├─ YES: Render dashboard
            │   └─ NO: Redirect to /forbidden
            │
            ├─► If first load or user changed:
            │   │
            │   ▼
            │  GET /bff/users/{userId}/locations
            │  ?companyId=X&enabled=true
            │   │
            │   ├─ Success: 
            │   │   - Store locations in locations.store
            │   │   - Auto-select all locations
            │   │   - Set selectedLocationIds
            │   │
            │   └─ Error: Show toast, skip location filter
            │
            └─► When selectedLocationIds changes:
                │
                ▼
               POST /bff/chargers/company
               {
                 payload: { location_ids: [11, 12, 13] },
                 pagination: { page: 1, per_page: 20 }
               }
                │
                ├─ Success:
                │   - Store chargers in chargers.store
                │   - Display count, status summary
                │   - Show on-map visualization (if available)
                │
                └─ Error: Show empty state with retry button

            (Also fetch sites, energy resources, etc. in parallel)
            
┌──────────────────────────────────────┐
│ Dashboard Render                     │
├──────────────────────────────────────┤
│ Header                               │
│ - Welcome message (user name)        │
│ - Company name                       │
│                                      │
│ Location Selector                    │
│ - Dropdown showing selected count    │
│ - Click to open multi-select modal   │
│                                      │
│ Statistics Cards                     │
│ - Total chargers: 42                 │
│ - Available: 38                      │
│ - Charging: 3                        │
│ - Faulted: 1                         │
│ - Energy this month: 8,523 kWh       │
│                                      │
│ Quick Access Buttons                 │
│ - View Chargers                      │
│ - View Sites                         │
│ - View Sessions                      │
│ - Reports                            │
│                                      │
│ Recent Activity Feed (if available)  │
│ - Last 5 charging sessions           │
│ - Last 5 system alerts               │
│                                      │
│ Action Buttons                       │
│ - Create Charger                     │
│ - Create Site                        │
│ - View Live Status (SSE)             │
└──────────────────────────────────────┘
```

## 3. Chargers Screen

```
┌─────────────────────────────────────┐
│ Chargers (/chargers)                │
│ with Tabs (list, sessions, config)  │
└────────────┬──────────────────────────┘
             │ onScreenFocus (on each tab switch)
             │
             ├─► activeTab === 'list'
             │   │
             │   ▼
             │  POST /bff/chargers/company
             │  {
             │    payload: {
             │      location_ids: [11, 12],
             │      charger_type?: 'AC' | 'DC'
             │    },
             │    filters: { status: 'available' },
             │    pagination: { page: 1, per_page: 20 },
             │    sort: { by: 'charger_id', order: 'ASC' }
             │  }
             │   │
             │   ├─ Success:
             │   │   - Store chargers list
             │   │   - Display in table/list
             │   │   - Enable infinite scroll
             │   │   - Show status badges
             │   │
             │   └─ Error: Show retry button
             │
             ├─► activeTab === 'sessions'
             │   │
             │   ▼
             │  POST /bff/charging-session/company
             │  {
             │    payload: {
             │      location_ids: [11, 12],
             │      date_start: '2024-04-01',
             │      date_end: '2024-04-30'
             │    },
             │    pagination: { page: 1, per_page: 20 },
             │    sort: { by: 'session_start', order: 'DESC' }
             │  }
             │   │
             │   ├─ Success: Show sessions table
             │   └─ Error: Show empty state
             │
             └─► activeTab === 'config'
                 │
                 ▼
                GET /bff/chargers/{id}/config (for selected)
                │
                ├─ Success: Show config form
                └─ Error: Show read-only view

┌─────────────────────────────────────┐
│ Chargers List Tab Render            │
├─────────────────────────────────────┤
│ Location Selector (multi-select)    │
│ - Currently: 2 selected              │
│ - Click to open location picker     │
│                                      │
│ Filter Bar (collapsible)            │
│ - Status: [All] [Available] [Fault] │
│ - Type: [AC] [DC]                   │
│ - Power range: [slider]             │
│                                      │
│ Chargers Table/List                 │
│ Columns: Charger ID | Status | Type │
│          Power | Connectors | Actions │
│                                      │
│ Row Actions:                        │
│ - View Detail (→ /chargers/[id])    │
│ - Edit                              │
│ - Delete (with confirm)             │
│ - Start Charge                      │
│ - Stop Charge                       │
│ - Disable/Enable                    │
│ - Unlock Connector                  │
│ - Reboot                            │
│                                      │
│ Pagination / Infinite Scroll        │
│ - Load more button                  │
│ - Or auto-load on scroll            │
│                                      │
│ Create Charger Button               │
│ (→ /chargers/create)                │
└─────────────────────────────────────┘
```

## 4. Charger Detail Screen

```
┌────────────────────────────────────────┐
│ Charger Detail (/chargers/[id])       │
│ on component mount                     │
└──────────┬───────────────────────────────┘
           │
           ├─► Check permission (CHARGERS_VIEW)
           │   ├─ YES: Continue
           │   └─ NO: Redirect to /forbidden
           │
           └─► GET /bff/chargers/{id}
               │
               ├─ Success:
               │   - Store in chargers.store.selectedCharger
               │   - Render detail view (see below)
               │   - Optional: Start polling for live data
               │
               └─ Error: Show error toast + back button

┌──────────────────────────────────────────┐
│ Charger Detail Render                    │
├──────────────────────────────────────────┤
│ Header                                   │
│ - Charger ID (large)                     │
│ - Status badge (available/charging/etc)  │
│ - Location name (link to site detail)    │
│                                          │
│ Details Section                          │
│ - OCPP ID                                │
│ - Type (AC/DC)                           │
│ - Power: 22 kW                           │
│ - Enabled: Yes/No                        │
│ - Last updated: 2024-04-15 14:32:10     │
│                                          │
│ Connectors Card                          │
│ - Connector 1: Socket A2 (AC 22kW)      │
│   Status: Available                      │
│   Last session: 2 hours ago             │
│ - Connector 2: CCS (DC Fast)             │
│   Status: Charging (45% done)           │
│   Current power: 45 kW                   │
│   Vehicle: License ABC-123              │
│                                          │
│ Quick Actions (Bottom)                   │
│ ┌──────────────────────────────────────┐│
│ │ [Start Charge] [Stop Charge]         ││
│ │ [Disable] [Unlock] [Reboot]          ││
│ │ [Edit] [Delete]                      ││
│ └──────────────────────────────────────┘│
│                                          │
│ Tabs (expandable):                       │
│ - Live Data (real-time via SSE)         │
│ - History (recent sessions)             │
│ - Config (settings)                     │
│ - Alerts (if any)                       │
└──────────────────────────────────────────┘
```

## 5. Sites Screen

```
Similar to Chargers screen:

┌─────────────────────────────────────┐
│ Sites (/sites)                      │
│ on screen focus                     │
└────────────┬────────────────────────┘
             │
             ▼
        POST /bff/sites/company
        {
          payload: { location_ids: [11, 12] },
          pagination: { page: 1, per_page: 20 }
        }
             │
             ├─ Success:
             │   - Display sites list
             │   - Show charger count per site
             │   - Show enabled/disabled status
             │
             └─ Error: Show retry button

┌────────────────────────────────┐
│ Sites List Render              │
├────────────────────────────────┤
│ Location Selector              │
│ Filter Bar                      │
│                                 │
│ Sites Table/List               │
│ - Site Name | City | Country   │
│ - Chargers | Connectors        │
│ - Enabled | Last Updated       │
│ - Actions (View, Edit, Delete) │
│                                 │
│ Create Site Button             │
└────────────────────────────────┘

Each row click → /sites/[id] detail
```

## 6. Reporting Screen

```
┌─────────────────────────────────────┐
│ Reporting (/reporting)              │
│ on screen focus                     │
└────────────┬────────────────────────┘
             │
             ├─ Populate filters:
             │  - Date range picker
             │  - Location selector
             │  - Charger selector
             │  - Export format (CSV/PDF)
             │
             └─ When user clicks "Generate Report":
                │
                ▼
           POST /bff/reporting/chargers
           POST /bff/reporting/sessions
           POST /bff/reporting/sites
           (multiple in parallel)
                │
                ├─ Success:
                │   - Aggregate results
                │   - Display charts
                │   - Show summary stats
                │   - Enable export button
                │
                └─ Error: Show error toast

Export flow:
- User clicks "Export"
- POST /bff/reporting/pdf-export
- Download PDF to device
- Show "Saved to Downloads" toast
```

## 7. Profile Screen

```
┌────────────────────────────────┐
│ Profile (/profile)             │
│ on component mount             │
└──────────┬──────────────────────┘
           │
           ├─► Check permission (PROFILE_EDIT)
           │   ├─ YES: Render form
           │   └─ NO: Redirect to /forbidden
           │
           └─► Display current user data
               (from auth.store, no API call needed)
               
               When user edits field:
               │
               ├─ Validate input
               │
               └─ When user clicks "Save":
                  │
                  ▼
             PUT /bff/users/{userId}/profile
             {
               email: string
               name: string
               phone?: string
               timezone?: string
             }
                  │
                  ├─ Success:
                  │   - Update auth.store
                  │   - Show "Profile updated" toast
                  │   - Disable save button
                  │
                  └─ Error: Show validation errors
```

## 8. Energy Resources Screen

```
┌──────────────────────────────────────┐
│ Energy Resources (/energy-resources) │
│ on screen focus                      │
└─────────────┬────────────────────────┘
              │
              ▼
         POST /bff/energy/company
         {
           payload: { location_ids: [11, 12] },
           pagination: { page: 1, per_page: 20 }
         }
              │
              ├─ Success:
              │   - Display energy resources table
              │   - Show status (active/inactive)
              │   - Show consumption graphs
              │
              └─ Error: Show retry button

When user clicks resource:
- GET /bff/energy/{id}
- GET /bff/energy/{id}/consumption
- Display detail view with charts
```

## Infinite Scroll Implementation

```
User scrolls to bottom of list
         │
         ▼
Trigger load more:
- If at bottom AND page < totalPages
- currentPage++
- POST /bff/xxx/company (with page = currentPage)
         │
         ├─ Success:
         │   - Get new items from res.data.payload
         │   - Append to existing list: [...prevItems, ...newItems]
         │   - Update pagination state
         │   - User sees more items
         │
         └─ Error: Show retry button
```

## Error Recovery Flows

```
All screens:
┌──────────────────────────────┐
│ API call fails (4xx/5xx)     │
│ ├─ 401: Token expired        │
│ │  └─ Auto-refresh token     │
│ │     └─ Retry original call │
│ │        └─ If retry fails:  │
│ │           └─ Logout +      │
│ │              Redirect      │
│ │              to /login     │
│ │                            │
│ ├─ 403: Forbidden            │
│ │  └─ User lacks permission  │
│ │     └─ Redirect to         │
│ │        /forbidden          │
│ │        (show message)      │
│ │                            │
│ └─ 5xx: Server error         │
│    └─ Show error toast       │
│       + Retry button         │
└──────────────────────────────┘
```

---

**Next:** Read `06_PERMISSIONS.md` for 35 permissions and enforcement.
