"use client"

/**
 * SSR-safe localStorage hook
 * Only accesses localStorage on client-side to avoid "localStorage is not defined" errors
 */

export function useLocalStorage<T>(key: string, initialValue?: T) {
  // Only runs on client
  const isClient = typeof window !== "undefined"

  const getValue = (key: string): T | null => {
    if (!isClient) return null

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : (initialValue ?? null)
    } catch (error) {
      console.warn(`[useLocalStorage] Error reading ${key}:`, error)
      return initialValue ?? null
    }
  }

  const setValue = (key: string, value: T): void => {
    if (!isClient) return

    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn(`[useLocalStorage] Error writing ${key}:`, error)
    }
  }

  const removeValue = (key: string): void => {
    if (!isClient) return

    try {
      window.localStorage.removeItem(key)
    } catch (error) {
      console.warn(`[useLocalStorage] Error removing ${key}:`, error)
    }
  }

  return { getValue, setValue, removeValue }
}
