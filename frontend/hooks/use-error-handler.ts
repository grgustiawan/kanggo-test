import { useCallback } from 'react'

export interface APIError {
  status?: number
  data?: {
    error?: string
    message?: string
    detail?: string
  }
  message?: string
}

export function useErrorHandler() {
  const handleError = useCallback((error: any): string => {
    console.error('[Log] Error caught by handler:', error)

    if (error.data) {
      if (error.data.detail) {
        return error.data.detail
      }
      if (error.data.error) {
        return error.data.error
      }
      if (error.data.message) {
        return error.data.message
      }
    }

    if (error.message) {
      return error.message
    }

    return 'An unexpected error occurred. Please try again.'
  }, [])

  const handleFieldError = useCallback((errors: Record<string, string[]>): Record<string, string> => {
    const result: Record<string, string> = {}
    for (const [field, messages] of Object.entries(errors)) {
      result[field] = messages[0] || 'Invalid input'
    }
    return result
  }, [])

  return {
    handleError,
    handleFieldError,
  }
}
