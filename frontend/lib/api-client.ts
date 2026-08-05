import { API_BASE_URL, API_TIMEOUT } from './constants'
import { safeSetItem } from './storage-utils'

export class APIClient {
  private static instance: APIClient
  private baseURL: string
  private token: string | null = null
  private timeout: number
  private isRefreshing: boolean = false

  private constructor() {
    this.baseURL = API_BASE_URL
    this.timeout = API_TIMEOUT
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('access_token')
    }
  }

  static getInstance(): APIClient {
    if (!APIClient.instance) {
      APIClient.instance = new APIClient()
    }
    return APIClient.instance
  }

  setToken(token: string | null) {
    this.token = token
    if (typeof window === 'undefined') return

    if (token) {
      const saved = safeSetItem('access_token', token)
      if (!saved) {
        console.warn('[Log] Token not saved to localStorage, but will work for this session')
      }
    } else {
      try {
        localStorage.removeItem('access_token')
      } catch (error) {
        console.error('[Log] Failed to remove token from localStorage:', error)
      }
    }
  }

  getToken(): string | null {
    return this.token
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    return headers
  }

  private createAbortController(): { controller: AbortController; timeoutId: NodeJS.Timeout } {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    return { controller, timeoutId }
  }

  private handleUnauthorized() {
    this.token = null

    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('auth_user')

        window.dispatchEvent(new CustomEvent('auth:unauthorized'))
      } catch (error) {
        console.error('[Log] Failed to clear localStorage:', error)
      }

      window.location.replace('/login')
    }
  }

  private async refreshToken(): Promise<boolean> {
    if (this.isRefreshing) {
      return false
    }

    this.isRefreshing = true

    try {
      const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        console.log('[Log] Token refreshed successfully')
        this.isRefreshing = false
        return true
      }

      console.warn('[Log] Token refresh failed with status:', response.status)
      this.isRefreshing = false
      return false
    } catch (error) {
      console.error('[Log] Token refresh error:', error)
      this.isRefreshing = false
      return false
    }
  }

  async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
    isRetryAfterRefresh: boolean = false
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const { controller, timeoutId } = this.createAbortController()

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        credentials: 'include',
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      })

      clearTimeout(timeoutId)

      if (response.status === 401) {
        console.error('[Log] 401 Unauthorized response received')

        if (!isRetryAfterRefresh && endpoint !== '/api/auth/refresh') {
          console.log('[Log] Attempting token refresh before logout...')
          const refreshed = await this.refreshToken()

          if (refreshed) {
            console.log('[Log] Token refreshed, retrying original request...')
            return this.request<T>(endpoint, options, true)
          }
        }

        this.handleUnauthorized()
        const error = new Error('Session expired. Please login again.')
          ; (error as any).status = 401
        throw error
      }

      let data: any
      const contentType = response.headers.get('content-type')

      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json()
        } catch (parseError) {
          console.error('[Log] Failed to parse JSON response:', parseError)
          const error = new Error('Invalid JSON response from server')
            ; (error as any).status = response.status
          throw error
        }
      } else {
        const text = await response.text()
        console.warn('[Log] Non-JSON response received:', text.substring(0, 200))
        data = { message: text }
      }

      if (!response.ok) {
        const error = new Error(
          data.detail || data.message || `HTTP ${response.status}: ${response.statusText}`
        )
          ; (error as any).status = response.status
          ; (error as any).data = data
        console.error(`[Log] API Error:`, error, data)
        throw error
      }

      return data as T
    } catch (error: any) {
      clearTimeout(timeoutId)

      if (error.name === 'AbortError') {
        const timeoutError = new Error('Request timeout. Please try again.')
          ; (timeoutError as any).status = 408
        console.error(`[Log] API Timeout: ${endpoint}`)
        throw timeoutError
      }

      console.error(`[Log] API request failed to ${endpoint}:`, error)
      throw error
    }
  }

  async get<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T = any>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async put<T = any>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = APIClient.getInstance()
