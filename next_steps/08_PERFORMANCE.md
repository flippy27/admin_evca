# Performance Optimization Roadmap

**Current Status:** Baseline established. No optimization yet.

## Performance Baseline

```
Chargers list load:    ~2-3 seconds
Sessions list load:    ~2-3 seconds
Charger detail:        ~1 second
Sites list load:       ~2-3 seconds
```

**Goals:**
- Initial screen load: < 2 seconds
- Paginated loads: < 1 second
- Navigation: < 300ms
- Charger detail: < 500ms

## 1. Request Optimization

### Batch Multiple Requests

**Current:** Sequential API calls
```typescript
// SLOW: 3 requests, 6+ seconds total
await fetchChargers()  // 2s
await fetchSites()     // 2s
await fetchSessions()  // 2s
```

**Optimized:** Parallel requests
```typescript
// FAST: 3 requests, 2 seconds total (longest one wins)
await Promise.all([
  fetchChargers(),
  fetchSites(),
  fetchSessions()
])
```

### Request Debouncing

```typescript
// lib/hooks/useDebounce.ts

export function useDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

// Usage: Debounce filter changes
const debouncedFilters = useDebounce(filters, 500)

useEffect(() => {
  fetchChargers(debouncedFilters)  // Only called after 500ms idle
}, [debouncedFilters])
```

### Request Cancellation

```typescript
// Cancel pending requests when component unmounts
useEffect(() => {
  const controller = new AbortController()

  const fetchData = async () => {
    try {
      const response = await fetch(url, {
        signal: controller.signal
      })
      // ...
    } catch (error) {
      if (error.name === 'AbortError') {
        logger.info('Request cancelled')
      }
    }
  }

  fetchData()

  return () => controller.abort()  // Cancel on unmount
}, [])
```

## 2. Data Caching

### Cache API Responses

```typescript
// lib/api/cache.ts

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number  // Time to live in ms
}

class ResponseCache {
  private cache = new Map<string, CacheEntry<any>>()

  set<T>(key: string, data: T, ttl: number = 60000) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  clear() {
    this.cache.clear()
  }
}

export const responseCache = new ResponseCache()
```

**Usage:**

```typescript
export const chargersApi = {
  list: async (request: ChargersRequest) => {
    const cacheKey = `chargers-${JSON.stringify(request)}`
    
    // Check cache
    const cached = responseCache.get(cacheKey)
    if (cached) {
      logger.info('Using cached chargers')
      return cached
    }

    // Fetch fresh data
    const response = await bffClient.post('/bff/chargers/company', request)
    
    // Cache for 5 minutes
    responseCache.set(cacheKey, response, 5 * 60000)
    
    return response
  }
}
```

### Cache Invalidation

```typescript
// Invalidate cache on mutations
export const chargersStore = create((set) => ({
  createCharger: async (data) => {
    const res = await chargersApi.create(data)
    
    // Clear all charger caches
    responseCache.clear()  // or clear specific keys
    
    // Refresh list
    await useChargersStore.getState().fetchChargers()
    return true
  }
}))
```

## 3. Component Optimization

### Memoize Components

```typescript
// Prevent re-renders of expensive components
import { memo } from 'react'

const ChargerListItem = memo(({ charger, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Card>
        <Text>{charger.charger_id}</Text>
        <Badge>{charger.status}</Badge>
      </Card>
    </TouchableOpacity>
  )
}, (prevProps, nextProps) => {
  // Return true if props are same (don't re-render)
  return (
    prevProps.charger.id === nextProps.charger.id &&
    prevProps.onPress === nextProps.onPress
  )
})

export default ChargerListItem
```

### useMemo for Expensive Calculations

```typescript
// Cache computed values
import { useMemo } from 'react'

function ChargerStats({ chargers }) {
  const stats = useMemo(() => {
    return {
      total: chargers.length,
      available: chargers.filter(c => c.status === 'available').length,
      charging: chargers.filter(c => c.status === 'charging').length,
      faulted: chargers.filter(c => c.status === 'faulted').length
    }
  }, [chargers])

  return (
    <View>
      <Text>Total: {stats.total}</Text>
      <Text>Available: {stats.available}</Text>
    </View>
  )
}
```

### useCallback for Event Handlers

```typescript
// Prevent function recreation on each render
import { useCallback } from 'react'

function ChargerList() {
  const handlePress = useCallback((id) => {
    router.push(`/chargers/${id}`)
  }, [router])

  return (
    <FlatList
      data={chargers}
      renderItem={({ item }) => (
        <ChargerListItem
          charger={item}
          onPress={() => handlePress(item.id)}
        />
      )}
    />
  )
}
```

## 4. List Virtualization

**Problem:** Rendering 100+ list items = slow
**Solution:** Render only visible items

```typescript
// Use FlatList with virtualization (React Native handles this)
<FlatList
  data={chargers}
  keyExtractor={item => item.id}
  renderItem={({ item }) => <ChargerListItem charger={item} />}
  windowSize={10}  // Keep 10 items off-screen buffered
  initialNumToRender={20}  // Render first 20 items
  maxToRenderPerBatch={10}  // Render 10 at a time
  onEndReachedThreshold={0.8}  // Start loading at 80% scroll
  onEndReached={() => loadMore()}
/>
```

## 5. Image Optimization

### Lazy Loading Images

```typescript
// Don't load images until visible
import FastImage from 'react-native-fast-image'

<FastImage
  source={{ uri: chargerImageUrl }}
  style={{ width: 100, height: 100 }}
  onLoad={() => logger.info('Image loaded')}
  onError={() => logger.error('Image failed')}
/>
```

### Progressive Image Loading

```typescript
// Show blurred placeholder while loading
import { Image } from 'react-native'

<Image
  source={require('./placeholder.png')}
  blurRadius={5}
  style={{ width: 100, height: 100 }}
/>

// Then load full image on top
<Image source={{ uri: fullImageUrl }} />
```

## 6. Data Pagination

### Infinite Scroll (Already Implemented)

```typescript
// Load items on-demand as user scrolls
<FlatList
  data={chargers}
  onEndReached={() => {
    if (page < totalPages) {
      fetchChargers({ page: page + 1 })
    }
  }}
  onEndReachedThreshold={0.5}
/>
```

### Server-Side Filtering

```typescript
// Filter on backend, not client
// ❌ SLOW: Fetch 10,000 items, filter in app
const filtered = chargers.filter(c => c.status === 'available')

// ✅ FAST: Tell backend to filter
const response = await fetchChargers({
  filters: { status: 'available' }
})
```

## 7. Network Optimization

### Reduce Payload Size

```typescript
// ❌ SLOW: Include all fields
POST /bff/chargers/company
Response: {
  charger_id, ocpp_id, location_id, status, type, power_kw,
  enabled, created_at, updated_at, config {...},
  connectors: [{...}], history: [{...}], alerts: [{...}]
  // 50+ fields total
}

// ✅ FAST: Request only needed fields
POST /bff/chargers/company?fields=charger_id,status,power_kw
Response: {
  charger_id, status, power_kw  // Just 3 fields
}
```

### Compress Requests

```typescript
// Axios already compresses, but verify in headers
bffClient.interceptors.request.use(config => {
  config.headers['Content-Encoding'] = 'gzip'
  return config
})
```

## 8. Memory Management

### Clear Old Data

```typescript
// Don't keep old pages in memory
useEffect(() => {
  return () => {
    // On unmount, clear cached data
    useChargersStore.setState({ chargers: [] })
  }
}, [])
```

### Monitor Memory Usage

```typescript
// Track memory in development
import { Platform } from 'react-native'

if (__DEV__) {
  const interval = setInterval(() => {
    if (Platform.OS === 'android') {
      const memory = require('react-native').NativeModules
        .PlatformConstants.Memo ry
      console.log('Memory:', memory)
    }
  }, 5000)

  return () => clearInterval(interval)
}
```

## 9. Startup Time Optimization

### Split Code Loading

```typescript
// Don't load all screens on startup
// Expo Router: Lazy route loading
<Stack.Screen
  name="chargers"
  options={{
    lazy: true  // Load only when navigated to
  }}
/>
```

### Preload Critical Data

```typescript
// Load user/permissions immediately
// Defer chargers/sites until needed

useEffect(() => {
  // Critical: Restore auth session
  restoreAuthSession()
}, [])

// On screen focus: Load data
useEffect(() => {
  if (isFocused && !chargers.length) {
    fetchChargers()  // Load when screen visible
  }
}, [isFocused])
```

## 10. Debug Performance

### React Native Profiler

```typescript
// Wrap expensive operations
import { PerformanceObserver, performance } from 'react-native'

const startTime = performance.now()
await fetchChargers()
const duration = performance.now() - startTime

logger.info(`Fetched in ${duration}ms`)
```

### Measure Component Render Time

```typescript
import { PerformanceObserver } from 'react-native'

function ChargerList() {
  useEffect(() => {
    const observer = new PerformanceObserver(list => {
      list.getEntries().forEach(entry => {
        console.log(`${entry.name}: ${entry.duration}ms`)
      })
    })

    observer.observe({ entryTypes: ['measure'] })

    return () => observer.disconnect()
  }, [])

  // ...
}
```

## Optimization Checklist

### Week 1
- [ ] Implement response caching (5-10min TTL)
- [ ] Parallelize dashboard API calls
- [ ] Add request debouncing for filter changes
- [ ] Implement request cancellation on unmount
- [ ] Measure baseline performance

### Week 2
- [ ] Memoize list item components
- [ ] Optimize list rendering with windowSize
- [ ] Implement lazy loading for detail screens
- [ ] Add image lazy loading where applicable
- [ ] Benchmark improvements

### Week 3
- [ ] Implement server-side filtering
- [ ] Reduce API payload size
- [ ] Optimize startup sequence
- [ ] Monitor memory usage
- [ ] Set performance budgets

## Performance Budget

**Target metrics:**
- First contentful paint: < 2s
- Time to interactive: < 3s
- FlatList scroll FPS: 60 FPS (no jank)
- API response: < 1s (p95)
- Memory: < 100MB (typical usage)

---

**Next:** Read `09_TESTING.md` for testing strategy.
