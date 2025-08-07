import { useState, useEffect, useCallback } from 'react'

/**
 * Custom hook to replace @github/spark useKV with localStorage persistence
 */
export function useKV<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  // Initialize state with stored value or default
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      if (stored !== null) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.warn(`Failed to parse stored value for key "${key}":`, error)
    }
    return defaultValue
  })

  // Update localStorage when state changes
  const setValue = useCallback((value: T) => {
    try {
      setState(value)
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Failed to store value for key "${key}":`, error)
    }
  }, [key])

  // Listen for localStorage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          const newValue = JSON.parse(event.newValue)
          setState(newValue)
        } catch (error) {
          console.warn(`Failed to parse updated value for key "${key}":`, error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key])

  return [state, setValue]
}