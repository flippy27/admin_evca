/**
 * Simple in-memory cache for API responses
 * TTL: Time to live in milliseconds
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class ResponseCache {
  private cache = new Map<string, CacheEntry<any>>()

  /**
   * Set cache entry with TTL
   * @param key Cache key
   * @param data Data to cache
   * @param ttl Time to live in ms (default: 5 minutes)
   */
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  /**
   * Get cache entry if not expired
   * @param key Cache key
   * @returns Cached data or null if expired/missing
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const age = Date.now() - entry.timestamp
    if (age > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  /**
   * Check if key exists and not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null
  }

  /**
   * Clear specific cache entry
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Clear cache entries matching pattern
   * @param pattern Regex pattern or string prefix
   */
  clearPattern(pattern: RegExp | string): void {
    const regex = typeof pattern === 'string' ? new RegExp(`^${pattern}`) : pattern

    for (const [key] of this.cache) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Get cache stats (for debugging)
   */
  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        age: Date.now() - entry.timestamp,
        ttl: entry.ttl,
        expired: Date.now() - entry.timestamp > entry.ttl,
      })),
    }
  }
}

export const apiCache = new ResponseCache()
