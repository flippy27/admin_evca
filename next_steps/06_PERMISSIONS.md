# Permissions System - 35 Permissions

**Status:** ✅ Defined in `lib/types/permissions.ts`, ⚠️ Partially enforced.

## Permission Model

**Multi-tenant, role-based access control (RBAC):**
- 35 permissions defined per role
- Extracted from Keycloak JWT claims
- Verified via API on login
- Checked before rendering screens
- Can be combined (AND/OR logic)

## All 35 Permissions

### Chargers Management (10)
```typescript
CHARGERS_VIEW                    // Read charger data
CHARGERS_CREATE                  // Create new charger
CHARGERS_EDIT                    // Edit charger details
CHARGERS_DELETE                  // Delete charger

CHARGERS_OCPP_START_CHARGE       // Start charge command
CHARGERS_OCPP_STOP_CHARGE        // Stop charge command
CHARGERS_OCPP_DISABLE            // Disable charger
CHARGERS_OCPP_ENABLE             // Enable charger
CHARGERS_OCPP_UNLOCK_CONNECTOR   // Unlock connector
CHARGERS_OCPP_REBOOT             // Reboot charger
```

### Sites Management (8)
```typescript
SITES_VIEW                       // View sites
SITES_CREATE                     // Create site
SITES_EDIT                       // Edit site
SITES_DELETE                     // Delete site

LOCATIONS_VIEW                   // View locations
LOCATIONS_EDIT                   // Edit location settings
LOCATIONS_ASSIGN_CHARGERS        // Assign chargers to location
LOCATIONS_MANAGE_ADMINS          // Manage location admins
```

### Charging Sessions (4)
```typescript
SESSIONS_VIEW                    // View charging history
SESSIONS_FILTER                  // Apply session filters
SESSIONS_EXPORT                  // Export session data
SESSIONS_VIEW_VEHICLE_DATA       // See vehicle details (license, RFID)
```

### Reporting (5)
```typescript
REPORTS_VIEW                     // Access reporting module
REPORTS_CHARGER_ANALYTICS        // View charger analytics
REPORTS_ENERGY_ANALYTICS         // View energy consumption
REPORTS_SESSION_ANALYTICS        // View session analytics
REPORTS_EXPORT_PDF               // Export reports to PDF
```

### Credentials (3)
```typescript
CREDENTIALS_VIEW                 // View API credentials
CREDENTIALS_CREATE               // Create new credential
CREDENTIALS_MANAGE               // Rotate/manage credentials
```

### Energy Resources (2)
```typescript
ENERGY_RESOURCES_VIEW            // View energy resource info
ENERGY_RESOURCES_MANAGE          // Configure energy resources
```

### User Management (2)
```typescript
USERS_VIEW                       // List users
USERS_MANAGE                     // Create/edit/delete users
```

### Admin Features (1)
```typescript
ADMIN_PANEL                      // Access admin panel
```

## Current Enforced Locations

### Screen-Level Checks ✅

```typescript
// lib/hooks/usePermissionGuard.ts

const ROUTE_PERMISSIONS = {
  'dashboard': ['DASHBOARD_VIEW'],           // ✅ Enforced
  'chargers': ['CHARGERS_VIEW'],             // ✅ Enforced
  'chargers/[id]': ['CHARGERS_VIEW'],        // ✅ Enforced
  'chargers/create': ['CHARGERS_CREATE'],    // ❌ Not yet
  'chargers/[id]/edit': ['CHARGERS_EDIT'],   // ❌ Not yet
  'sites': ['SITES_VIEW'],                   // ✅ Enforced
  'sites/[id]': ['SITES_VIEW'],              // ❌ Not yet
  'sites/create': ['SITES_CREATE'],          // ❌ Not yet
  'sites/[id]/edit': ['SITES_EDIT'],         // ❌ Not yet
  'profile': ['PROFILE_EDIT'],               // ✅ Enforced
  'reporting': ['REPORTS_VIEW'],             // ✅ Enforced
  'credentials': ['CREDENTIALS_VIEW'],       // ✅ Enforced
  'energy-resources': ['ENERGY_RESOURCES_VIEW'], // ✅ Enforced
}
```

### Action-Level Checks ⚠️

Missing implementation:
- Create button hidden if no CHARGERS_CREATE
- Edit button hidden if no CHARGERS_EDIT
- Delete button hidden if no CHARGERS_DELETE
- OCPP command buttons conditional on permission
- Export button hidden if no EXPORT permission

## Implementation Checklist

### Phase 1: Permission Definitions ✅

```typescript
// lib/types/permissions.ts (ALREADY EXISTS)

export enum Permission {
  // Chargers
  CHARGERS_VIEW = 'CHARGERS_VIEW',
  CHARGERS_CREATE = 'CHARGERS_CREATE',
  CHARGERS_EDIT = 'CHARGERS_EDIT',
  CHARGERS_DELETE = 'CHARGERS_DELETE',
  CHARGERS_OCPP_START_CHARGE = 'CHARGERS_OCPP_START_CHARGE',
  CHARGERS_OCPP_STOP_CHARGE = 'CHARGERS_OCPP_STOP_CHARGE',
  CHARGERS_OCPP_DISABLE = 'CHARGERS_OCPP_DISABLE',
  CHARGERS_OCPP_ENABLE = 'CHARGERS_OCPP_ENABLE',
  CHARGERS_OCPP_UNLOCK_CONNECTOR = 'CHARGERS_OCPP_UNLOCK_CONNECTOR',
  CHARGERS_OCPP_REBOOT = 'CHARGERS_OCPP_REBOOT',
  // ... 25 more
}
```

### Phase 2: Permission Extraction ✅

```typescript
// lib/api/auth.api.ts
export const authApi = {
  getPermissions: async (userId: string, companyId: string) => {
    // GET /bff/users/{userId}/permissions?companyId=X
    // Returns: { payload: [ {resource: "CHARGERS_VIEW", enabled: true}, ... ] }
  }
}
```

### Phase 3: Store Permissions ✅

```typescript
// lib/stores/auth.store.ts
interface AuthState {
  permissions: string[]  // Array of permission strings
  hasPermission: (perm: Permission | Permission[]) => boolean
}

// Check single permission
store.hasPermission(Permission.CHARGERS_VIEW) // true/false

// Check multiple (any)
store.hasPermission([Permission.CHARGERS_EDIT, Permission.CHARGERS_DELETE])

// Check multiple (all)
store.hasPermissions([...]) // NEW METHOD NEEDED
```

### Phase 4: Guard Components ✅ (Partial)

```typescript
// lib/hooks/usePermissionGuard.ts
export function usePermissionGuard(
  requiredPerms?: Permission | Permission[]
) {
  const { permissions, user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.replace('/login')
      return
    }

    if (requiredPerms && !hasPermission(requiredPerms, permissions)) {
      router.replace('/forbidden')
      return
    }
  }, [user, permissions])
}

// Usage in screen:
export default function ChargersScreen() {
  usePermissionGuard(Permission.CHARGERS_VIEW)
  // If user lacks permission, auto-redirects to /forbidden
}
```

### Phase 5: Action-Level Guards ❌ (TODO)

```typescript
// lib/components/PermissionBoundary.tsx
interface PermissionBoundaryProps {
  permissions: Permission | Permission[]
  children: ReactNode
  fallback?: ReactNode  // shown if no permission
}

export function PermissionBoundary({
  permissions,
  children,
  fallback = null
}: PermissionBoundaryProps) {
  const { hasPermission } = useAuthStore()
  
  return hasPermission(permissions) ? children : fallback
}

// Usage:
<PermissionBoundary permissions={Permission.CHARGERS_CREATE}>
  <Button title="Create Charger" onPress={...} />
</PermissionBoundary>

// Show disabled button with tooltip if no permission:
<PermissionBoundary
  permissions={Permission.CHARGERS_DELETE}
  fallback={<Button disabled title="Delete (no permission)" />}
>
  <Button title="Delete" onPress={...} />
</PermissionBoundary>
```

### Phase 6: API Request Guards ❌ (TODO)

```typescript
// Before API call: verify permission
const { createCharger } = useChargersStore()

const handleCreate = async () => {
  if (!useAuthStore.getState().hasPermission(Permission.CHARGERS_CREATE)) {
    Toast.error('You do not have permission to create chargers')
    return
  }
  
  const success = await createCharger(formData)
  // ...
}
```

## Permission Check Utilities

```typescript
// lib/utils/permissions.ts

export function hasPermission(
  required: Permission | Permission[],
  userPermissions: string[]
): boolean {
  const permissions = Array.isArray(required) ? required : [required]
  return permissions.some(p => userPermissions.includes(p))
}

export function hasAllPermissions(
  required: Permission[],
  userPermissions: string[]
): boolean {
  return required.every(p => userPermissions.includes(p))
}

export function hasAnyPermission(
  required: Permission[],
  userPermissions: string[]
): boolean {
  return required.some(p => userPermissions.includes(p))
}

// Usage:
const canEdit = hasPermission(
  Permission.CHARGERS_EDIT,
  useAuthStore.getState().permissions
)

const canManageUsers = hasAllPermissions(
  [Permission.USERS_MANAGE, Permission.USERS_VIEW],
  permissions
)
```

## Role Examples

### Company Admin
```typescript
Permissions: [
  // All charger permissions
  CHARGERS_VIEW, CHARGERS_CREATE, CHARGERS_EDIT, CHARGERS_DELETE,
  CHARGERS_OCPP_START_CHARGE, CHARGERS_OCPP_STOP_CHARGE, 
  CHARGERS_OCPP_DISABLE, CHARGERS_OCPP_ENABLE,
  CHARGERS_OCPP_UNLOCK_CONNECTOR, CHARGERS_OCPP_REBOOT,
  
  // All site permissions
  SITES_VIEW, SITES_CREATE, SITES_EDIT, SITES_DELETE,
  LOCATIONS_VIEW, LOCATIONS_EDIT, LOCATIONS_ASSIGN_CHARGERS,
  
  // All data access
  SESSIONS_VIEW, SESSIONS_EXPORT,
  REPORTS_VIEW, REPORTS_EXPORT_PDF,
  CREDENTIALS_VIEW, CREDENTIALS_MANAGE,
  
  // User management
  USERS_VIEW, USERS_MANAGE,
  
  // Admin panel
  ADMIN_PANEL
]
```

### Site Manager
```typescript
Permissions: [
  // Charger viewing + OCPP commands (but not delete)
  CHARGERS_VIEW,
  CHARGERS_OCPP_START_CHARGE, CHARGERS_OCPP_STOP_CHARGE,
  CHARGERS_OCPP_ENABLE, CHARGERS_OCPP_DISABLE,
  CHARGERS_OCPP_UNLOCK_CONNECTOR,
  
  // Site viewing only
  SITES_VIEW, LOCATIONS_VIEW,
  
  // Session viewing + export
  SESSIONS_VIEW, SESSIONS_EXPORT,
  
  // Reports viewing only
  REPORTS_VIEW,
  
  // No admin access
]
```

### Operator
```typescript
Permissions: [
  // Charger viewing + start/stop
  CHARGERS_VIEW,
  CHARGERS_OCPP_START_CHARGE, CHARGERS_OCPP_STOP_CHARGE,
  
  // Session viewing
  SESSIONS_VIEW,
  
  // No create/edit/delete/other commands
]
```

## Implementation Priority

### Tier 1 (Must Have)
- [x] Screen-level permission guards
- [ ] Action button visibility based on permissions
- [ ] Error message if user lacks permission

### Tier 2 (Should Have)
- [ ] API request validation (verify on client before calling)
- [ ] Permission boundary component
- [ ] Disabled state with tooltip explanation
- [ ] Audit logging of permission checks

### Tier 3 (Nice to Have)
- [ ] Permission inheritance (role hierarchies)
- [ ] Dynamic permission UI generation
- [ ] Permission request workflows
- [ ] Session-based permission caching/refresh

## Testing Permissions

```typescript
// __tests__/permissions.test.ts

describe('Permission Guards', () => {
  it('should allow access with correct permission', () => {
    const user = createMockUser(['CHARGERS_VIEW'])
    expect(hasPermission(Permission.CHARGERS_VIEW, user.permissions)).toBe(true)
  })

  it('should deny access without permission', () => {
    const user = createMockUser([])
    expect(hasPermission(Permission.CHARGERS_VIEW, user.permissions)).toBe(false)
  })

  it('should check multiple permissions with OR logic', () => {
    const user = createMockUser(['CHARGERS_EDIT'])
    const result = hasPermission(
      [Permission.CHARGERS_VIEW, Permission.CHARGERS_EDIT],
      user.permissions
    )
    expect(result).toBe(true)
  })

  it('should check multiple permissions with AND logic', () => {
    const user = createMockUser(['CHARGERS_VIEW', 'CHARGERS_EDIT'])
    const result = hasAllPermissions(
      [Permission.CHARGERS_VIEW, Permission.CHARGERS_EDIT],
      user.permissions
    )
    expect(result).toBe(true)
  })
})
```

---

**Next:** Read `07_JWT_LIFECYCLE.md` for token handling and refresh.
