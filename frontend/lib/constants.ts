// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://kanggo-be.awanbox.biz.id'
export const API_TIMEOUT = 30000

// Auth Configuration
export const AUTH_TOKEN_KEY = 'access_token'
export const AUTH_USER_KEY = 'auth_user'
export const APP_ID = process.env.NEXT_PUBLIC_APP_ID ? parseInt(process.env.NEXT_PUBLIC_APP_ID) : 1

// API Endpoints
export const API_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  REGISTER: '/api/auth/register',
  REFRESH: '/api/auth/refresh',
  ME: '/api/auth/me',
  SUMMARY: '/api/summary',
  TASKS: '/api/tasks',
  USERS: '/api/users',
}

// Task Status
export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
} as const

// Task Priority
export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const

// User Status
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
} as const
