// Auth Types
export interface User {
  id: number
  organizationId: number
  email: string
  name: string
  status: 'active' | 'inactive' | 'suspended' | 'deleted'
  isEmailVerified: number
  lastLoginAt?: string
  lastLoginIp?: string
  createdAt: string
  updatedAt: string
  roles?: string[]
}

export interface AuthResponse {
  user: User
}

export interface LoginRequest {
  email: string
  password: string
  app_id?: number
}

export interface RegisterRequest {
  email: string
  name: string
  password: string
}

// Task Types
export interface Task {
  id: string
  organizationId: number
  taskNumber: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  deadline?: string
  userId: number
  userName?: string
  createdBy?: number
  updatedBy?: number
  createdAt: string
  updatedAt: string
}

export interface CreateTaskRequest {
  title: string
  description?: string
  status?: 'pending' | 'in_progress' | 'done'
  priority?: 'low' | 'medium' | 'high'
  deadline?: string
  userId: number
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  status?: 'pending' | 'in_progress' | 'done'
  priority?: 'low' | 'medium' | 'high'
  deadline?: string
  userId?: number
}

// Dashboard Types
export interface SummaryResponse {
  totalUsers: number
  totalTasks: number
  tasksByStatus: {
    pending: number
    in_progress: number
    done: number
  }
}

// User Management Types
export interface CreateUserRequest {
  name: string
  email: string
  password: string
}

export interface UpdateUserRequest {
  name?: string
  email?: string
  password?: string
  status?: 'active' | 'inactive' | 'suspended'
}
