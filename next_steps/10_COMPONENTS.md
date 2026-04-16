# UI Components Audit

**Status:** 26 components implemented, 11 missing.

## Existing Components (26)

### Layout Components ✅
- [x] SafeAreaView - Safe area wrapper
- [x] View - Basic container
- [x] ScrollView - Scrollable container
- [x] FlatList - Efficient list rendering

### Text Components ✅
- [x] Text - Basic text display
- [x] Heading (h1-h6) - Title hierarchy
- [x] Paragraph - Body text

### Interactive Components ✅
- [x] Button - Click action
- [x] Input - Text input field
- [x] Switch - Toggle switch
- [x] Checkbox - Multi-select option

### Data Display ✅
- [x] Card - Content container
- [x] Badge - Status indicator
- [x] Separator - Visual divider
- [x] Drawer - Side navigation menu
- [x] Alert - Alert message
- [x] Toast - Notification popup

### Utility Components ✅
- [x] LoadingOverlay - Loading spinner
- [x] SkeletonCard - Loading placeholder
- [x] ErrorBoundary - Error handling (partial)
- [x] ComponentShowcase - Dev component browser

### Feature Components ✅
- [x] LocationSelector - Location multi-select
- [x] StartChargeButton - OCPP command
- [x] (2 others in progress)

## Missing Components (11)

### High Priority (Week 1)

#### 1. Modal / Bottom Sheet
```typescript
// components/ui/Modal.tsx
interface ModalProps {
  visible: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'small' | 'medium' | 'large'
}

export function Modal({ visible, onClose, title, children }: ModalProps) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView>
        {title && <Text style={styles.title}>{title}</Text>}
        {children}
        <Button title="Close" onPress={onClose} />
      </SafeAreaView>
    </Modal>
  )
}

// Usage
<Modal visible={showDetail} onClose={() => setShowDetail(false)}>
  <ChargerDetail chargerId={id} />
</Modal>
```

**Priority:** Critical - Needed for charger/site detail views

#### 2. Tabs Component
```typescript
// components/ui/Tabs.tsx
interface TabsProps {
  tabs: Array<{ label: string; content: ReactNode }>
  activeTab?: number
  onTabChange?: (index: number) => void
}

export function Tabs({ tabs, activeTab = 0, onTabChange }: TabsProps) {
  const [active, setActive] = useState(activeTab)

  return (
    <View>
      <View style={styles.tabBar}>
        {tabs.map((tab, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => {
              setActive(i)
              onTabChange?.(i)
            }}
          >
            <Text style={active === i ? styles.activeTab : styles.tab}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {tabs[active].content}
    </View>
  )
}

// Usage
<Tabs
  tabs={[
    { label: 'Live', content: <LiveData /> },
    { label: 'History', content: <SessionHistory /> },
    { label: 'Config', content: <Config /> }
  ]}
/>
```

**Priority:** Critical - Charger detail uses tabs

#### 3. Table Component
```typescript
// components/ui/Table.tsx
interface TableProps {
  columns: Array<{ key: string; title: string; width?: string | number }>
  data: Array<Record<string, any>>
  onRowPress?: (row: Record<string, any>) => void
}

export function Table({ columns, data, onRowPress }: TableProps) {
  return (
    <ScrollView horizontal>
      <View>
        {/* Header row */}
        <View style={styles.headerRow}>
          {columns.map(col => (
            <Text key={col.key} style={[styles.cell, { width: col.width }]}>
              {col.title}
            </Text>
          ))}
        </View>

        {/* Data rows */}
        {data.map((row, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => onRowPress?.(row)}
          >
            <View style={styles.row}>
              {columns.map(col => (
                <Text key={col.key} style={[styles.cell, { width: col.width }]}>
                  {row[col.key]}
                </Text>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}

// Usage
<Table
  columns={[
    { key: 'charger_id', title: 'ID' },
    { key: 'status', title: 'Status' },
    { key: 'power_kw', title: 'Power' }
  ]}
  data={chargers}
  onRowPress={(row) => router.push(`/chargers/${row.charger_id}`)}
/>
```

**Priority:** Critical - List views need table UI

#### 4. Select / Dropdown Component
```typescript
// components/ui/Select.tsx
interface SelectProps {
  label?: string
  value: string | string[]
  onValueChange: (value: string) => void
  options: Array<{ label: string; value: string }>
  multiple?: boolean
}

export function Select({
  label,
  value,
  onValueChange,
  options,
  multiple = false
}: SelectProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <View>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity onPress={() => setExpanded(!expanded)}>
        <View style={styles.selectBox}>
          <Text>
            {Array.isArray(value)
              ? value.map(v => options.find(o => o.value === v)?.label).join(', ')
              : options.find(o => o.value === value)?.label}
          </Text>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.dropdown}>
          {options.map(option => (
            <TouchableOpacity
              key={option.value}
              onPress={() => {
                onValueChange(option.value)
                setExpanded(false)
              }}
            >
              <Text style={styles.option}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  )
}

// Usage (already implemented but verify)
<Select
  label="Charger Type"
  value={type}
  onValueChange={setType}
  options={[
    { label: 'AC', value: 'AC' },
    { label: 'DC', value: 'DC' }
  ]}
/>
```

**Priority:** High - Used in forms

#### 5. DatePicker Component
```typescript
// components/ui/DatePicker.tsx
interface DatePickerProps {
  label?: string
  value: Date | null
  onChange: (date: Date) => void
  minDate?: Date
  maxDate?: Date
}

export function DatePicker({
  label,
  value,
  onChange,
  minDate,
  maxDate
}: DatePickerProps) {
  const [show, setShow] = useState(false)

  return (
    <View>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity onPress={() => setShow(true)}>
        <Text style={styles.dateText}>
          {value ? value.toLocaleDateString() : 'Select date'}
        </Text>
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display="spinner"
          onChange={(event, selectedDate) => {
            if (selectedDate) {
              onChange(selectedDate)
            }
            setShow(false)
          }}
          minimumDate={minDate}
          maximumDate={maxDate}
        />
      )}
    </View>
  )
}

// Usage
<DatePicker
  label="Start Date"
  value={startDate}
  onChange={setStartDate}
  maxDate={new Date()}
/>
```

**Priority:** High - Reporting needs date range

### Medium Priority (Week 2)

#### 6. Chart Component
```typescript
// components/ui/Chart.tsx (using Victory or react-native-chart-kit)
interface ChartProps {
  type: 'line' | 'bar' | 'pie' | 'donut'
  data: Array<{ label: string; value: number }>
  title?: string
  xAxisLabel?: string
  yAxisLabel?: string
}

export function Chart({ type, data, title }: ChartProps) {
  return (
    <Card title={title}>
      {type === 'line' && <LineChart data={transformData(data)} />}
      {type === 'bar' && <BarChart data={transformData(data)} />}
      {type === 'pie' && <PieChart data={transformData(data)} />}
    </Card>
  )
}

// Usage
<Chart
  type="line"
  title="Energy Consumption"
  data={[
    { label: 'Mon', value: 45 },
    { label: 'Tue', value: 52 },
    { label: 'Wed', value: 48 }
  ]}
/>
```

**Priority:** Medium - Dashboard/reporting

#### 7. SearchBar Component
```typescript
// components/ui/SearchBar.tsx
interface SearchBarProps {
  placeholder?: string
  value: string
  onChange: (text: string) => void
  onSearch?: (text: string) => void
}

export function SearchBar({
  placeholder,
  value,
  onChange,
  onSearch
}: SearchBarProps) {
  return (
    <View style={styles.searchBar}>
      <Icon name="search" />
      <Input
        placeholder={placeholder}
        value={value}
        onChangeText={onChange}
      />
      {value && (
        <TouchableOpacity onPress={() => onChange('')}>
          <Icon name="close" />
        </TouchableOpacity>
      )}
    </View>
  )
}

// Usage
<SearchBar
  placeholder="Search chargers..."
  value={searchText}
  onChange={setSearchText}
/>
```

**Priority:** Medium - List filtering

#### 8. FilePicker Component
```typescript
// components/ui/FilePicker.tsx
interface FilePickerProps {
  onFilePicked: (file: File) => void
  accept?: string[]
}

export function FilePicker({ onFilePicked, accept }: FilePickerProps) {
  return (
    <TouchableOpacity onPress={async () => {
      const result = await DocumentPicker.pick({
        type: accept || ['*/*']
      })
      onFilePicked(result)
    }}>
      <View style={styles.filePicker}>
        <Icon name="upload" />
        <Text>Choose File</Text>
      </View>
    </TouchableOpacity>
  )
}

// Usage
<FilePicker
  accept={['application/pdf']}
  onFilePicked={(file) => uploadFirmware(file)}
/>
```

**Priority:** Medium - Firmware upload

#### 9. Pagination Component
```typescript
// components/ui/Pagination.tsx
interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  loading?: boolean
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  loading = false
}: PaginationProps) {
  return (
    <View style={styles.pagination}>
      <Button
        disabled={page === 1 || loading}
        onPress={() => onPageChange(page - 1)}
        title="← Previous"
      />
      <Text>{page} / {totalPages}</Text>
      <Button
        disabled={page === totalPages || loading}
        onPress={() => onPageChange(page + 1)}
        title="Next →"
      />
    </View>
  )
}

// Usage
<Pagination
  page={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
  loading={isLoading}
/>
```

**Priority:** Medium - Pagination UI (using infinite scroll is better)

### Low Priority (Week 3)

#### 10. List Component
```typescript
// components/ui/List.tsx
interface ListProps {
  items: Array<{ id: string; title: string; subtitle?: string }>
  onItemPress: (id: string) => void
}

export function List({ items, onItemPress }: ListProps) {
  return (
    <FlatList
      data={items}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => onItemPress(item.id)}>
          <View style={styles.listItem}>
            <Text style={styles.title}>{item.title}</Text>
            {item.subtitle && <Text style={styles.subtitle}>{item.subtitle}</Text>}
          </View>
        </TouchableOpacity>
      )}
    />
  )
}
```

#### 11. ErrorBoundary (Complete)
```typescript
// Wrap entire app to catch render errors
<ErrorBoundary>
  <RootNavigator />
</ErrorBoundary>
```

## Component Implementation Priority

| Component | Priority | Status | Week |
|-----------|----------|--------|------|
| Modal | 🔴 Critical | ❌ Missing | 1 |
| Tabs | 🔴 Critical | ❌ Missing | 1 |
| Table | 🔴 Critical | ❌ Missing | 1 |
| Select | 🟡 High | 🟡 Partial | 1 |
| DatePicker | 🟡 High | ❌ Missing | 1-2 |
| Chart | 🟡 High | ❌ Missing | 2 |
| SearchBar | 🟡 High | ❌ Missing | 2 |
| FilePicker | 🟡 High | ❌ Missing | 2 |
| Pagination | 🟢 Medium | ❌ Missing | 2-3 |
| List | 🟢 Medium | ❌ Missing | 2-3 |
| ErrorBoundary | 🔴 Critical | 🟡 Partial | 1 |

## Implementation Template

All components follow pattern:

```typescript
// components/ui/ComponentName.tsx
import React, { useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'

interface ComponentNameProps {
  // Props...
}

export function ComponentName(props: ComponentNameProps) {
  return (
    <View style={styles.container}>
      {/* Implementation */}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    // Styles
  }
})

// Export from components/ui/index.ts
export { ComponentName } from './ComponentName'
```

## Testing Components

All components have tests:

```typescript
// __tests__/components/ui/ComponentName.test.tsx
import { render, screen } from '@testing-library/react-native'
import { ComponentName } from '@/components/ui'

describe('ComponentName', () => {
  it('should render', () => {
    render(<ComponentName {...props} />)
    expect(screen.getByText('Expected text')).toBeTruthy()
  })
})
```

---

**Next:** Read `11_API_INTEGRATION_GUIDE.md` for step-by-step API setup.
