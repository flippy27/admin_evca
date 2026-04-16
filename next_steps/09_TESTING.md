# Testing Strategy

**Status:** ❌ No tests. Jest configured but not implemented.

## Testing Pyramid

```
        /\
       /  \  E2E Tests (10%)
      /    \ - Critical user flows
     /------\
    /        \  Integration Tests (30%)
   /          \ - API calls, store mutations, navigation
  /            \
 /              \ Unit Tests (60%)
/________________\ - Functions, components, utilities
```

**Current:** 0% coverage
**Target:** >70% coverage (>80% critical paths)

## Testing Setup

**Already installed:**
- Jest (test framework)
- React Native Testing Library (component testing)
- Zustand testing utilities (store testing)

**Need to install:**
```bash
npm install --save-dev @testing-library/jest-native jest-mock-axios
```

## Unit Tests

### 1. Store Tests

```typescript
// __tests__/stores/auth.store.test.ts

import { useAuthStore } from '@/lib/stores/auth.store'
import { describe, it, expect, beforeEach } from '@jest/globals'

describe('Auth Store', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      permissions: [],
      isAuthenticated: false
    })
  })

  it('should set user on login', () => {
    const user = {
      userId: 'user-123',
      companyId: 'company-456',
      email: 'user@company.com',
      fullName: 'John Doe'
    }

    useAuthStore.setState({ user, isAuthenticated: true })

    expect(useAuthStore.getState().user).toEqual(user)
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
  })

  it('should set permissions', () => {
    const permissions = ['CHARGERS_VIEW', 'SITES_VIEW']
    
    useAuthStore.setState({ permissions })
    
    expect(useAuthStore.getState().permissions).toEqual(permissions)
  })

  it('should check permission correctly', () => {
    useAuthStore.setState({
      permissions: ['CHARGERS_VIEW', 'CHARGERS_CREATE']
    })

    const hasPermission = useAuthStore
      .getState()
      .hasPermission('CHARGERS_VIEW')
    
    expect(hasPermission).toBe(true)
  })

  it('should return false for missing permission', () => {
    useAuthStore.setState({ permissions: [] })
    
    const hasPermission = useAuthStore
      .getState()
      .hasPermission('CHARGERS_DELETE')
    
    expect(hasPermission).toBe(false)
  })

  it('should clear user on logout', () => {
    useAuthStore.setState({
      user: { userId: '123', companyId: '456', email: 'user@company.com', fullName: 'John' },
      isAuthenticated: true
    })

    useAuthStore.getState().logout()

    expect(useAuthStore.getState().user).toBe(null)
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })
})
```

### 2. Utility Tests

```typescript
// __tests__/utils/jwt.test.ts

import { decodeJWT, getJWTClaims } from '@/lib/utils/jwt'

describe('JWT Utils', () => {
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
    'eyJ1c2VyX2lkX2xvY2FsIjoiMTIzNDU2IiwiY29tcGFueV9pZF9sb2NhbCI6' +
    'YWJjZGVmIiwiZW1haWwiOiJ1c2VyQGNvbXBhbnkuY29tIn0.' +
    'signature'

  it('should decode JWT payload', () => {
    const payload = decodeJWT(mockToken)
    
    expect(payload.user_id_local).toBe('123456')
    expect(payload.company_id_local).toBe('abcdef')
  })

  it('should extract JWT claims', () => {
    const claims = getJWTClaims(mockToken)
    
    expect(claims).toEqual({
      userId: '123456',
      companyId: 'abcdef',
      email: 'user@company.com',
      fullName: null,  // Not in mock token
      roles: []
    })
  })

  it('should return null for invalid token', () => {
    const claims = getJWTClaims('invalid-token')
    expect(claims).toBe(null)
  })
})
```

### 3. Permission Utils Tests

```typescript
// __tests__/utils/permissions.test.ts

import {
  hasPermission,
  hasAllPermissions,
  hasAnyPermission
} from '@/lib/utils/permissions'

describe('Permission Utils', () => {
  const userPermissions = [
    'CHARGERS_VIEW',
    'CHARGERS_CREATE',
    'SITES_VIEW'
  ]

  it('should check single permission', () => {
    expect(hasPermission('CHARGERS_VIEW', userPermissions)).toBe(true)
    expect(hasPermission('CHARGERS_DELETE', userPermissions)).toBe(false)
  })

  it('should check ANY of multiple permissions', () => {
    const result = hasAnyPermission(
      ['CHARGERS_VIEW', 'CHARGERS_DELETE'],
      userPermissions
    )
    expect(result).toBe(true)  // Has CHARGERS_VIEW
  })

  it('should check ALL permissions', () => {
    const result = hasAllPermissions(
      ['CHARGERS_VIEW', 'CHARGERS_CREATE'],
      userPermissions
    )
    expect(result).toBe(true)

    const result2 = hasAllPermissions(
      ['CHARGERS_VIEW', 'CHARGERS_DELETE'],
      userPermissions
    )
    expect(result2).toBe(false)  // Missing CHARGERS_DELETE
  })
})
```

## Component Tests

### 1. Button Component

```typescript
// __tests__/components/ui/Button.test.tsx

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react-native'
import { Button } from '@/components/ui'

describe('Button', () => {
  it('should render button with title', () => {
    render(<Button title="Click me" onPress={() => {}} />)
    
    expect(screen.getByText('Click me')).toBeTruthy()
  })

  it('should call onPress when pressed', () => {
    const onPress = jest.fn()
    
    render(<Button title="Click me" onPress={onPress} />)
    
    fireEvent.press(screen.getByText('Click me'))
    
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', () => {
    const onPress = jest.fn()
    
    render(
      <Button title="Click me" onPress={onPress} disabled={true} />
    )
    
    fireEvent.press(screen.getByText('Click me'))
    
    expect(onPress).not.toHaveBeenCalled()
  })
})
```

### 2. PermissionBoundary Component

```typescript
// __tests__/components/PermissionBoundary.test.tsx

import React from 'react'
import { render, screen } from '@testing-library/react-native'
import { PermissionBoundary } from '@/components'
import { useAuthStore } from '@/lib/stores/auth.store'

jest.mock('@/lib/stores/auth.store')

describe('PermissionBoundary', () => {
  it('should render children if user has permission', () => {
    useAuthStore.mockReturnValue({
      hasPermission: () => true
    })

    render(
      <PermissionBoundary permissions="CHARGERS_VIEW">
        <Text>Protected Content</Text>
      </PermissionBoundary>
    )

    expect(screen.getByText('Protected Content')).toBeTruthy()
  })

  it('should render fallback if user lacks permission', () => {
    useAuthStore.mockReturnValue({
      hasPermission: () => false
    })

    render(
      <PermissionBoundary
        permissions="CHARGERS_VIEW"
        fallback={<Text>Unauthorized</Text>}
      >
        <Text>Protected Content</Text>
      </PermissionBoundary>
    )

    expect(screen.getByText('Unauthorized')).toBeTruthy()
    expect(screen.queryByText('Protected Content')).toBeFalsy()
  })
})
```

## Integration Tests

### 1. API Integration

```typescript
// __tests__/api/chargers.api.test.ts

import { chargersApi } from '@/lib/api/chargers.api'
import axios from 'axios'

jest.mock('axios')

describe('Chargers API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch chargers with location filter', async () => {
    const mockResponse = {
      data: {
        payload: [
          { charger_id: 'CHG-001', status: 'available' },
          { charger_id: 'CHG-002', status: 'charging' }
        ],
        pagination: {
          page: 1,
          per_page: 20,
          total: 2,
          total_pages: 1
        }
      }
    }

    axios.post.mockResolvedValue(mockResponse)

    const response = await chargersApi.list({
      payload: {
        location_ids: ['11', '12']
      },
      pagination: {
        page: 1,
        per_page: 20
      }
    })

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/bff/chargers/company'),
      expect.any(Object)
    )
    expect(response.data.payload).toHaveLength(2)
  })

  it('should handle API errors', async () => {
    const mockError = new Error('Network error')
    axios.post.mockRejectedValue(mockError)

    await expect(chargersApi.list({})).rejects.toThrow('Network error')
  })
})
```

### 2. Store Integration

```typescript
// __tests__/stores/chargers.store.test.ts

import { useChargersStore } from '@/lib/stores/chargers.store'
import { chargersApi } from '@/lib/api/chargers.api'

jest.mock('@/lib/api/chargers.api')

describe('Chargers Store Integration', () => {
  beforeEach(() => {
    useChargersStore.setState({ chargers: [] })
    jest.clearAllMocks()
  })

  it('should fetch and store chargers', async () => {
    const mockResponse = {
      data: {
        payload: [
          { charger_id: 'CHG-001', status: 'available' }
        ],
        pagination: { page: 1, total_pages: 1 }
      }
    }

    chargersApi.list.mockResolvedValue(mockResponse)

    await useChargersStore.getState().fetchChargers({})

    expect(useChargersStore.getState().chargers).toHaveLength(1)
    expect(useChargersStore.getState().chargers[0].charger_id).toBe('CHG-001')
  })

  it('should handle fetch errors', async () => {
    chargersApi.list.mockRejectedValue(new Error('API error'))

    await useChargersStore.getState().fetchChargers({})

    expect(useChargersStore.getState().chargersError).toBe('API error')
  })

  it('should append items on page > 1 (infinite scroll)', async () => {
    // Set initial chargers
    useChargersStore.setState({
      chargers: [{ charger_id: 'CHG-001' }]
    })

    const mockResponse = {
      data: {
        payload: [{ charger_id: 'CHG-002' }],
        pagination: { page: 2, total_pages: 3 }
      }
    }

    chargersApi.list.mockResolvedValue(mockResponse)

    await useChargersStore.getState().fetchChargers({
      pagination: { page: 2, per_page: 20 }
    })

    const chargers = useChargersStore.getState().chargers
    expect(chargers).toHaveLength(2)
    expect(chargers[0].charger_id).toBe('CHG-001')
    expect(chargers[1].charger_id).toBe('CHG-002')
  })
})
```

## E2E Tests (Detox)

```typescript
// e2e/login.e2e.ts

describe('Login Flow', () => {
  beforeAll(async () => {
    await device.launchApp()
  })

  beforeEach(async () => {
    await device.reloadReactNative()
  })

  it('should login and navigate to dashboard', async () => {
    // Find email input and type
    await element(by.id('email-input')).typeText('user@company.com')

    // Find password input and type
    await element(by.id('password-input')).typeText('password123')

    // Tap login button
    await element(by.id('login-button')).tap()

    // Wait for dashboard to appear
    await waitFor(element(by.text('Dashboard')))
      .toBeVisible()
      .withTimeout(5000)

    // Verify chargers section visible
    expect(element(by.text('Available Chargers'))).toBeVisible()
  })

  it('should show error on invalid credentials', async () => {
    await element(by.id('email-input')).typeText('invalid@company.com')
    await element(by.id('password-input')).typeText('wrongpassword')
    await element(by.id('login-button')).tap()

    await waitFor(element(by.text('Invalid credentials')))
      .toBeVisible()
      .withTimeout(5000)
  })
})
```

## Testing Checklist

### Week 1: Unit Tests
- [ ] Auth store tests (30 tests)
- [ ] Permission utility tests (15 tests)
- [ ] JWT utility tests (10 tests)
- [ ] UI component tests (Button, Input, etc.)
- [ ] Coverage: 20%

### Week 2: Integration Tests
- [ ] API integration tests (20 tests)
- [ ] Store integration tests (25 tests)
- [ ] Permission boundary tests (10 tests)
- [ ] Error handling tests (15 tests)
- [ ] Coverage: 50%

### Week 3: E2E Tests
- [ ] Login flow test
- [ ] Chargers list test
- [ ] Charger detail test
- [ ] CRUD operations test
- [ ] Permission enforcement test
- [ ] Coverage: 70%+

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test auth.store.test.ts

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch

# Run E2E tests with Detox
detox test e2e --configuration ios.sim.release --cleanup
```

## Coverage Goals

```
Statements:   > 70%
Branches:     > 65%
Functions:    > 70%
Lines:        > 70%

Critical paths (auth, permissions, API): 100%
```

---

**Next:** Read `10_COMPONENTS.md` for UI component audit.
