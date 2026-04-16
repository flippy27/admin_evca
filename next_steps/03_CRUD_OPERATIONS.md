# CRUD Operations - Create, Read, Update, Delete Forms

**Status:** ✅ Complete - All 8 forms implemented (4 Chargers + 4 Sites)

## Forms Architecture

All CRUD forms follow pattern:
1. Form screen component with validation
2. API call via existing store
3. Toast notification on success/error
4. Navigation back to list on success
5. Loading overlay during submission

## Chargers CRUD

### 1. Create Charger Form ✅

**Route:** `/(app)/chargers/create`
**Status:** Implemented - POST /bff/chargers with nested payload structure

```typescript
// app/(app)/chargers/create.tsx
import React, { useState } from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useChargersStore } from '@/lib/stores/chargers.store'
import { useLocationsStore } from '@/lib/stores/locations.store'
import { Button, Input, Select, Toast, LoadingOverlay } from '@/components/ui'

export default function CreateCharger() {
  const router = useRouter()
  const { createCharger, isLoading, error } = useChargersStore()
  const { selectedLocationIds } = useLocationsStore()
  
  const [formData, setFormData] = useState({
    charger_id: '',
    ocpp_id: '',
    location_id: selectedLocationIds[0] || '',
    charger_type: 'AC', // or 'DC'
    power_kw: 22,
    enabled: true,
  })

  const handleSubmit = async () => {
    if (!formData.charger_id || !formData.ocpp_id) {
      Toast.error('Complete required fields')
      return
    }

    const success = await createCharger(formData)
    if (success) {
      Toast.success('Charger created')
      router.back()
    }
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <Input
          label="Charger ID"
          value={formData.charger_id}
          onChangeText={v => setFormData({...formData, charger_id: v})}
          placeholder="E.g. CHG-001"
          required
        />
        <Input
          label="OCPP ID"
          value={formData.ocpp_id}
          onChangeText={v => setFormData({...formData, ocpp_id: v})}
          placeholder="OCPP identifier"
          required
        />
        <Select
          label="Location"
          value={formData.location_id}
          onValueChange={v => setFormData({...formData, location_id: v})}
          options={selectedLocationIds.map(id => ({
            label: `Location ${id}`,
            value: id
          }))}
        />
        <Select
          label="Type"
          value={formData.charger_type}
          onValueChange={v => setFormData({...formData, charger_type: v})}
          options={[
            { label: 'AC', value: 'AC' },
            { label: 'DC Fast', value: 'DC' }
          ]}
        />
        <Input
          label="Power (kW)"
          value={String(formData.power_kw)}
          onChangeText={v => setFormData({...formData, power_kw: parseFloat(v)})}
          keyboardType="decimal-pad"
          required
        />
        <Button
          title={isLoading ? 'Creating...' : 'Create Charger'}
          onPress={handleSubmit}
          disabled={isLoading}
        />
      </ScrollView>
      <LoadingOverlay visible={isLoading} />
    </>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 }
})
```

**API Call (add to `chargers.api.ts`):**
```typescript
export const chargersApi = {
  create: async (data: CreateChargerRequest) => {
    return await bffClient.post('/bff/chargers', data)
  }
}
```

**Store Method (add to `chargers.store.ts`):**
```typescript
createCharger: async (data: CreateChargerRequest) => {
  set({ chargerLoading: true, chargerError: null })
  try {
    await chargersApi.create(data)
    set({ chargerLoading: false })
    // Refresh list
    const { fetchChargers } = get()
    await fetchChargers(/* current filters */)
    return true
  } catch (error) {
    const err = handleError(error)
    set({ chargerError: err.message, chargerLoading: false })
    return false
  }
}
```

### 2. Edit Charger Form ✅

**Route:** `/(app)/chargers/[id]/edit`
**Status:** Implemented - PUT /bff/chargers/{id} with data pre-population

```typescript
// app/(app)/chargers/[id]/edit.tsx
import { useLocalSearchParams } from 'expo-router'
import { useEffect } from 'react'
import { useChargersStore } from '@/lib/stores/chargers.store'

export default function EditCharger() {
  const { id } = useLocalSearchParams()
  const { selectedCharger, fetchChargerDetail, updateCharger } = useChargersStore()

  useEffect(() => {
    fetchChargerDetail(id as string)
  }, [id])

  // Similar form to Create, but with pre-filled data
  // Handle update instead of create
}
```

**API Call:**
```typescript
export const chargersApi = {
  update: async (id: string, data: UpdateChargerRequest) => {
    return await bffClient.put(`/bff/chargers/${id}`, data)
  }
}
```

**Store Method:**
```typescript
updateCharger: async (id: string, data: UpdateChargerRequest) => {
  // Similar pattern to createCharger
}
```

### 3. Delete Charger ✅

**Implemented:** Dialog confirmation on detail screen with DELETE /bff/chargers/{id}

**Add to charger detail screen:**

```typescript
const { deleteCharger } = useChargersStore()

const handleDelete = () => {
  Alert.alert(
    'Delete Charger?',
    'This action cannot be undone',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const success = await deleteCharger(chargerId)
          if (success) {
            Toast.success('Charger deleted')
            router.back()
          }
        }
      }
    ]
  )
}

// In render:
<Button title="Delete" onPress={handleDelete} style={{backgroundColor: 'red'}} />
```

**API Call:**
```typescript
export const chargersApi = {
  delete: async (id: string) => {
    return await bffClient.delete(`/bff/chargers/${id}`)
  }
}
```

### 4. Charger Detail View

**Route:** `/(app)/chargers/[id]`

```typescript
export default function ChargerDetail() {
  const { id } = useLocalSearchParams()
  const { selectedCharger, fetchChargerDetail, detailLoading } = useChargersStore()

  useEffect(() => {
    fetchChargerDetail(id as string)
  }, [id])

  return (
    <>
      {detailLoading ? (
        <SkeletonCard />
      ) : (
        <ScrollView>
          <Card>
            <Text style={styles.label}>Charger ID</Text>
            <Text>{selectedCharger.charger_id}</Text>
            
            <Text style={styles.label}>OCPP ID</Text>
            <Text>{selectedCharger.ocpp_id}</Text>
            
            {/* ... more fields ... */}
          </Card>

          <Card title="Connectors">
            {selectedCharger.connectors?.map(conn => (
              <View key={conn.connector_id} style={styles.connector}>
                <Text>{conn.name} ({conn.type})</Text>
                <Badge>{conn.status}</Badge>
                <Text>{conn.power_kw}kW</Text>
              </View>
            ))}
          </Card>

          <View style={styles.actions}>
            <Button
              title="Edit"
              onPress={() => router.push(`/chargers/${id}/edit`)}
            />
            <Button
              title="Delete"
              onPress={handleDelete}
              style={{backgroundColor: 'red'}}
            />
          </View>
        </ScrollView>
      )}
    </>
  )
}
```

## Sites CRUD ✅

Implemented same pattern as Chargers:

### 1. Create Site ✅
**Route:** `/(app)/sites/create`
**API:** `POST /bff/sites` with nested address structure

### 2. Edit Site ✅
**Route:** `/(app)/sites/[id]/edit`
**API:** `PUT /bff/sites/{id}` with data pre-population

### 3. Delete Site ✅
**API:** `DELETE /bff/sites/{id}`
**Implemented:** Confirmation alert on detail screen

### 4. Site Detail ✅
**Route:** `/(app)/sites/[id]`
**Fields:** location_name, address, city, country, timezone, coordinates, Edit/Delete buttons

## Implementation Checklist

### Week 1 - Phase 1
- [x] Create Charger form (POST)
- [x] Edit Charger form (PUT)
- [x] Delete Charger with confirmation
- [x] Charger detail screen
- [x] Add create button to chargers list screen
- [x] Add edit button to charger detail
- [ ] Test all 3 operations with real API

### Week 2 - Phase 2
- [x] Create Site form (POST)
- [x] Edit Site form (PUT)
- [x] Delete Site with confirmation
- [x] Site detail screen
- [x] Navigation from list to detail
- [ ] Test with real API

### Week 3 - Validation & Polish
- [ ] Form validation (required fields, format)
- [x] Error messages (show API error in toast)
- [x] Loading states (disable form during submission)
- [ ] Optimistic updates (update list before API response)
- [ ] Undo on error (restore previous value if API fails)

## Form Component Utilities

**Create reusable form utilities:**

```typescript
// lib/hooks/useForm.ts
export function useForm<T>(initialData: T) {
  const [data, setData] = useState(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setValue = <K extends keyof T>(key: K, value: T[K]) => {
    setData(prev => ({ ...prev, [key]: value }))
  }

  const setError = (key: string, message: string) => {
    setErrors(prev => ({ ...prev, [key]: message }))
  }

  const clearError = (key: string) => {
    setErrors(prev => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const reset = () => {
    setData(initialData)
    setErrors({})
  }

  return {
    data,
    errors,
    isSubmitting,
    setValue,
    setError,
    clearError,
    setIsSubmitting,
    reset
  }
}
```

**Use in forms:**
```typescript
const form = useForm(initialCharger)

<Input
  value={form.data.charger_id}
  onChangeText={v => {
    form.setValue('charger_id', v)
    if (v.length < 3) form.setError('charger_id', 'Min 3 chars')
    else form.clearError('charger_id')
  }}
  error={form.errors.charger_id}
/>
```

---

**Next:** Read `04_OCPP_COMMANDS.md` for charge/stop/reboot commands.
