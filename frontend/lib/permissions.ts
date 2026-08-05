import { User } from './types'

export const hasRole = (user: User | null, ...roles: string[]): boolean => {
  if (!user || !user.roles) return false
  return roles.some(role => user.roles?.includes(role))
}

export const isAdmin = (user: User | null): boolean => {
  return hasRole(user, 'admin', 'superadmin')
}

export const isManager = (user: User | null): boolean => {
  return hasRole(user, 'manager')
}

export const canCreateTask = (user: User | null): boolean => {
  return hasRole(user, 'admin', 'superadmin', 'manager')
}

export const canEditTask = (user: User | null): boolean => {
  return hasRole(user, 'admin', 'superadmin', 'manager')
}

export const canDeleteTask = (user: User | null): boolean => {
  return hasRole(user, 'admin', 'superadmin', 'manager')
}

export const canAccessUserManagement = (user: User | null): boolean => {
  return hasRole(user, 'admin', 'superadmin')
}
