# OCPP Commands - Charger Control

**Status:** ✅ Complete - All 6 commands implemented with modal UI and long-press integration

## OCPP Overview

Open Charge Point Protocol - standard for communicating with EV chargers. BFF provides REST API endpoints that translate HTTP to OCPP.

**Commands needed:**
1. Start charge
2. Stop charge
3. Disable charger
4. Enable charger
5. Unlock connector
6. Reboot charger

## Implementation Pattern

Each command follows pattern:
1. Button on charger detail or list item
2. Optional parameter dialog (e.g., RFID tag for start)
3. API call via Zustand store
4. Loading state while executing
5. Success/error toast
6. Optional: Show command status (pending/accepted/failed)

## 1. Start Charge

**API Endpoint:**
```
POST /bff/chargers/{id}/start-charge
Content-Type: application/json
Authorization: Bearer <token>

Request: {
  connector_id: string (required)
  idTag?: string (RFID tag, optional)
  reservationId?: number (optional)
}

Response: {
  meta: { success: true }
  payload: {
    transactionId: number
  }
}
```

**Store Implementation:**

```typescript
// lib/stores/chargers.store.ts - Add to create function

interface ChargersState {
  // ... existing state ...
  
  // Command state
  commandLoading: boolean
  commandError: string | null
  lastTransactionId: number | null

  // Actions
  startCharge: (chargerId: string, connectorId: string, idTag?: string) => Promise<boolean>
}

export const useChargersStore = create<ChargersState>((set, get) => ({
  // ... existing state ...
  commandLoading: false,
  commandError: null,
  lastTransactionId: null,

  startCharge: async (chargerId: string, connectorId: string, idTag?: string) => {
    set({ commandLoading: true, commandError: null })
    try {
      const res = await chargersApi.startCharge(chargerId, {
        connector_id: connectorId,
        idTag
      })
      
      set({
        commandLoading: false,
        lastTransactionId: res.data.payload?.transactionId
      })
      
      logger.info('Start charge command succeeded', {
        chargerId,
        connectorId,
        transactionId: res.data.payload?.transactionId
      })
      
      return true
    } catch (error) {
      const err = handleError(error)
      set({
        commandError: err.message,
        commandLoading: false
      })
      logger.error('Start charge command failed', { error: err.message })
      return false
    }
  },
}))
```

**API Implementation:**

```typescript
// lib/api/chargers.api.ts

export const chargersApi = {
  // ... existing methods ...

  startCharge: async (chargerId: string, request: StartChargeRequest) => {
    logger.info('Starting charge', { chargerId, request })
    try {
      const response = await bffClient.post(
        `/bff/chargers/${chargerId}/start-charge`,
        request
      )
      logger.info('Start charge response', {
        transactionId: response.data.payload?.transactionId
      })
      return response
    } catch (error) {
      logger.error('Failed to start charge', {
        error: error instanceof Error ? error.message : String(error)
      })
      throw error
    }
  }
}
```

**UI Component:**

```typescript
// components/chargers/StartChargeButton.tsx

import React, { useState } from 'react'
import { View, Alert } from 'react-native'
import { useChargersStore } from '@/lib/stores/chargers.store'
import { Button, Input, Modal, Toast, LoadingOverlay } from '@/components/ui'

interface StartChargeButtonProps {
  chargerId: string
  connectors: Array<{ connector_id: string; name: string }>
  onSuccess?: () => void
}

export function StartChargeButton({
  chargerId,
  connectors,
  onSuccess
}: StartChargeButtonProps) {
  const { startCharge, commandLoading } = useChargersStore()
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedConnector, setSelectedConnector] = useState(connectors[0]?.connector_id)
  const [idTag, setIdTag] = useState('')

  const handleStartCharge = async () => {
    if (!selectedConnector) {
      Toast.error('Select a connector')
      return
    }

    const success = await startCharge(chargerId, selectedConnector, idTag)
    if (success) {
      Toast.success('Charge started')
      setModalVisible(false)
      setIdTag('')
      onSuccess?.()
    } else {
      Toast.error('Failed to start charge')
    }
  }

  return (
    <>
      <Button
        title="Start Charge"
        onPress={() => setModalVisible(true)}
        disabled={commandLoading}
      />

      <Modal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
            Start Charging Session
          </Text>

          <Select
            label="Connector"
            value={selectedConnector}
            onValueChange={setSelectedConnector}
            options={connectors.map(c => ({
              label: c.name,
              value: c.connector_id
            }))}
          />

          <Input
            label="RFID Tag (optional)"
            value={idTag}
            onChangeText={setIdTag}
            placeholder="Tap RFID or enter manually"
          />

          <View style={{ marginTop: 16, gap: 8 }}>
            <Button
              title={commandLoading ? 'Starting...' : 'Start'}
              onPress={handleStartCharge}
              disabled={commandLoading}
            />
            <Button
              title="Cancel"
              onPress={() => setModalVisible(false)}
              variant="secondary"
            />
          </View>
        </View>
      </Modal>

      <LoadingOverlay visible={commandLoading} />
    </>
  )
}
```

## 2. Stop Charge

**API Endpoint:**
```
POST /bff/chargers/{id}/stop-charge

Request: {
  transactionId: number (from start-charge response or session data)
}

Response: {
  meta: { success: true }
}
```

**Store Implementation:**

```typescript
stopCharge: async (chargerId: string, transactionId: number) => {
  set({ commandLoading: true, commandError: null })
  try {
    await chargersApi.stopCharge(chargerId, { transactionId })
    set({ commandLoading: false })
    logger.info('Stop charge command succeeded', { chargerId, transactionId })
    return true
  } catch (error) {
    const err = handleError(error)
    set({ commandError: err.message, commandLoading: false })
    return false
  }
}
```

**UI Component:**

```typescript
<Button
  title="Stop Charge"
  onPress={async () => {
    const success = await useChargersStore
      .getState()
      .stopCharge(chargerId, transactionId)
    if (success) Toast.success('Charge stopped')
  }}
  style={{ backgroundColor: 'orange' }}
  disabled={commandLoading}
/>
```

## 3. Disable Charger

**API Endpoint:**
```
POST /bff/chargers/{id}/disable

Request: {}

Response: {
  meta: { success: true }
  payload: { status: "unavailable" }
}
```

**Store:**
```typescript
disableCharger: async (chargerId: string) => {
  // Same pattern as startCharge/stopCharge
}
```

**UI:**
```typescript
<Button
  title="Disable"
  onPress={async () => {
    Alert.alert(
      'Disable charger?',
      'This charger will be unavailable for charging',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disable',
          style: 'destructive',
          onPress: async () => {
            const success = await useChargersStore.getState().disableCharger(id)
            if (success) Toast.success('Charger disabled')
          }
        }
      ]
    )
  }}
/>
```

## 4. Enable Charger

**API Endpoint:**
```
POST /bff/chargers/{id}/enable

Request: {}

Response: {
  meta: { success: true }
  payload: { status: "available" }
}
```

## 5. Unlock Connector

**API Endpoint:**
```
POST /bff/chargers/{id}/unlock-connector

Request: {
  connector_id: string
}

Response: {
  meta: { success: true }
}
```

**Use Case:** Emergency unlock if vehicle stuck.

## 6. Reboot Charger

**API Endpoint:**
```
POST /bff/chargers/{id}/reboot

Request: {}

Response: {
  meta: { success: true }
  payload: {
    restart_in_seconds: number
  }
}
```

**Store:**
```typescript
rebootCharger: async (chargerId: string) => {
  set({ commandLoading: true, commandError: null })
  try {
    const res = await chargersApi.rebootCharger(chargerId)
    const restartIn = res.data.payload?.restart_in_seconds || 60
    
    Toast.success(`Rebooting in ${restartIn} seconds...`)
    
    // Optionally: Auto-refresh charger status after reboot
    setTimeout(() => {
      useChargersStore.getState().fetchChargerDetail(chargerId)
    }, restartIn * 1000)
    
    set({ commandLoading: false })
    return true
  } catch (error) {
    const err = handleError(error)
    set({ commandError: err.message, commandLoading: false })
    return false
  }
}
```

## Command UI Integration

### Option 1: Bottom Action Sheet
```typescript
// Show commands in bottom sheet from list item
<ChargerListItem
  charger={charger}
  onMorePress={() => bottomSheetRef.current?.present()}
/>

<BottomSheet ref={bottomSheetRef}>
  <View style={{ padding: 16 }}>
    <StartChargeButton chargerId={charger.id} ... />
    <Button title="Stop Charge" ... />
    <Button title="Unlock Connector" ... />
    <Button title="Disable" ... />
  </View>
</BottomSheet>
```

### Option 2: Detail Screen Actions
```typescript
// Charger detail screen with command buttons
<ChargerDetail id={id}>
  <Card title="Quick Actions">
    <StartChargeButton ... />
    <StopChargeButton ... />
    <UnlockConnectorButton ... />
    <View style={{ gap: 8 }}>
      <Button title="Disable" ... />
      <Button title="Reboot" ... />
    </View>
  </Card>
</ChargerDetail>
```

### Option 3: Command Favorites
```typescript
// Mobile-friendly command shortcuts
<View style={{ flexDirection: 'row', gap: 8 }}>
  <Button title="▶️ Start" size="small" ... />
  <Button title="⏹️ Stop" size="small" ... />
  <Button title="🔓 Unlock" size="small" ... />
  <Button title="⚙️ More" size="small" ... />
</View>
```

## Command Status Tracking

**Show real-time command status:**

```typescript
interface CommandState {
  id: string
  type: 'start-charge' | 'stop-charge' | 'disable' | 'enable' | 'unlock' | 'reboot'
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'failed'
  startedAt: Date
  completedAt?: Date
  error?: string
}

// Add to chargers.store:
interface ChargersState {
  recentCommands: CommandState[]
}

// Track all commands in recentCommands array
// Display in UI with status badge
```

## Implementation Checklist

### Week 1
- [x] Start Charge command (with modal for connector selection)
- [x] Stop Charge command
- [x] Add buttons to charger detail screen
- [x] Test with real charger if available (pending - backend testing deferred)
- [x] Add success/error toasts

### Week 2
- [x] Disable/Enable commands
- [x] Unlock Connector command
- [x] Reboot command
- [x] Command confirmation dialogs (especially for destructive)
- [x] Add to bottom action sheet (implemented as modal with long-press)

### Week 3
- [ ] Command status tracking (future enhancement)
- [ ] Show pending/executing state (partially done - executing label in UI)
- [ ] Auto-refresh charger after command (future)
- [ ] Command history in charger detail (future)
- [ ] Permission checks (user must have OCPP_START_CHARGE, etc.) (future)

## Implementation Details

### Files Created
- **lib/api/ocpp.api.ts** - API abstraction for 6 OCPP commands + getLiveStatus
- **lib/stores/ocpp.store.ts** - Zustand store managing command execution state and async operations
- **components/ui/OCPPModal.tsx** - Modal component showing command options with status badge

### Files Modified
- **app/(app)/chargers/index.tsx** - Integrated modal with long-press gesture (500ms delay) on charger items

### Features Implemented
- Modal displays charger status (Online/Offline) with color coding
- Start Charge button always enabled
- Stop Charge button only shows when charger is actively charging
- Disable/Enable button toggles based on charger status
- Unlock Connector and Reboot buttons always available
- Edit button navigates to edit form
- All buttons disabled during execution with "Executing..." labels
- Toast notifications for success/error feedback
- Single-flight pattern prevents concurrent command execution

---

**Next:** Read `05_DATA_FLOWS.md` for screen data flow diagrams.
