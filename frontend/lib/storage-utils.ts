/**
 * Utility functions for localStorage management
 */

export function clearLocalStorage() {
  if (typeof window === 'undefined') return

  try {
    localStorage.clear()
    console.log('[Log] localStorage cleared successfully')
  } catch (error) {
    console.error('[Log] Failed to clear localStorage:', error)
  }
}

export function getStorageSize(): number {
  if (typeof window === 'undefined') return 0

  let total = 0
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length
    }
  }
  return total
}

export function getStorageInfo() {
  if (typeof window === 'undefined') return null

  const size = getStorageSize()
  const items = Object.keys(localStorage).length

  return {
    size,
    sizeKB: (size / 1024).toFixed(2),
    items,
    keys: Object.keys(localStorage),
  }
}

export function safeSetItem(key: string, value: string): boolean {
  if (typeof window === 'undefined') return false

  try {
    localStorage.setItem(key, value)
    return true
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('[Log] localStorage quota exceeded, attempting aggressive cleanup...')

      try {
        const allKeys = Object.keys(localStorage)
        allKeys.forEach(k => {
          if (k !== key) {
            localStorage.removeItem(k)
          }
        })

        localStorage.setItem(key, value)
        console.log('[Log] Successfully saved after aggressive cleanup')
        return true
      } catch (retryError) {
        console.error('[Log] Still failed after aggressive cleanup:', retryError)

        try {
          localStorage.clear()
          localStorage.setItem(key, value)
          console.log('[Log] Successfully saved after full clear')
          return true
        } catch (finalError) {
          console.error('[Log] Failed even after full clear. localStorage may be disabled or token too large:', finalError)
          return false
        }
      }
    }

    console.error('[Log] Failed to save to localStorage:', error)
    return false
  }
}
