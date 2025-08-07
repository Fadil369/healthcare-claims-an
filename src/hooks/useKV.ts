import { useState, useEffect } from 'react'

/**
 * A simple key-value hook that persists data to localStorage
 * This replaces the @github/spark useKV hook functionality
 */
export function useKV<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        return JSON.parse(item)
      }
    } catch (error) {
      console.warn(`Failed to load ${key} from localStorage:`, error)
    }
    return defaultValue
  })

  const setValue = (value: T) => {
    try {
      setState(value)
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Failed to save ${key} to localStorage:`, error)
    }
  }

  // Sync with other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setState(JSON.parse(e.newValue))
        } catch (error) {
          console.warn(`Failed to sync ${key} from storage event:`, error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key])

  return [state, setValue]
}