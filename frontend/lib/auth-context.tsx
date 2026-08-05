'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { apiClient } from './api-client'
import { safeSetItem } from './storage-utils'
import type { User, LoginRequest, AuthResponse, RegisterRequest } from './types'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('auth_user')

      if (savedUser && savedUser !== 'undefined') {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
      } else {
        localStorage.removeItem('auth_user')
      }
    } catch (error) {
      console.error('[Log] Failed to restore auth state:', error)
      localStorage.removeItem('auth_user')
    } finally {
      setIsLoading(false)
    }

    const handleUnauthorized = () => {
      setUser(null)
    }

    window.addEventListener('auth:unauthorized', handleUnauthorized)

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized)
    }
  }, [])

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true)
    try {
      const response = await apiClient.post<any>('/api/auth/login', {
        email: credentials.email,
        password: credentials.password,
      })

      let userData: User

      if (response.data) {
        userData = response.data.user
      } else {
        userData = response.user
      }

      if (!userData) {
        throw new Error('Invalid response from server: missing user data')
      }

      if (!userData.email) {
        throw new Error('Invalid user data: missing email')
      }

      setUser(userData)

      const userSaved = safeSetItem('auth_user', JSON.stringify(userData))

      if (!userSaved) {
        console.warn('[Log] Session will work but may not persist after refresh')
      }
    } catch (error) {
      console.error('[Log] Login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterRequest) => {
    setIsLoading(true)
    try {
      const response = await apiClient.post<any>('/api/auth/register', {
        name: (data as any).name,
        email: data.email,
        password: data.password,
      })

      let userData: User

      if (response.data) {
        userData = response.data.user
      } else {
        userData = response.user
      }

      if (!userData) {
        throw new Error('Invalid response from server: missing user data')
      }

      setUser(userData)

      const userSaved = safeSetItem('auth_user', JSON.stringify(userData))

      if (!userSaved) {
        console.warn('[Log] Session will work but may not persist after refresh')
      }
    } catch (error) {
      console.error('[Log] Registration failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await apiClient.post('/api/auth/logout')
    } catch (error) {
      console.error('[Log] Logout API call failed:', error)
    } finally {
      setToken(null)
      setUser(null)
      localStorage.removeItem('auth_user')
    }
  }

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    setUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
