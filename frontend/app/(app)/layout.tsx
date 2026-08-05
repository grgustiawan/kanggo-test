'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bell, Mail, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/api-client'
import { Task } from '@/lib/types'
import { Badge } from '@/components/ui/badge'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, isLoading, user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Task[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {

      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token' && !e.newValue) {

        router.push('/login')
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [router])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        searchTasks()
      } else {
        setSearchResults([])
        setShowDropdown(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const searchTasks = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const response = await apiClient.get<any>(`/api/tasks?search=${encodeURIComponent(searchQuery)}&limit=10`)
      const tasksData = response.data || response
      setSearchResults(Array.isArray(tasksData) ? tasksData : [])
      setShowDropdown(true)
    } catch (error) {
      console.error('[Log] Search failed:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleTaskClick = (taskId: string) => {
    setShowDropdown(false)
    setSearchQuery('')
    router.push(`/tasks?highlight=${taskId}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#e32d31] border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </motion.div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <AppSidebar />
      <main className="flex-1 md:ml-64 flex flex-col min-w-0">
        <motion.div
          className="fixed top-0 right-0 left-0 md:left-64 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 max-w-xl pl-12 md:pl-0" ref={searchRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                  <Input
                    placeholder="Search task"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery && setShowDropdown(true)}
                    className="pl-10 pr-12 md:pr-20 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 md:right-12 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
                  )}
                  <kbd className="hidden md:block absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded">
                    ⌘ F
                  </kbd>

                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50"
                    >
                      {isSearching ? (
                        <div className="p-4 text-center text-gray-500">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                          <p className="text-sm">Searching...</p>
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="py-2">
                          {searchResults.map((task) => (
                            <button
                              key={task.id}
                              onClick={() => handleTaskClick(task.id)}
                              className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-0"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 truncate">{task.title}</p>
                                  <p className="text-sm text-gray-500 truncate mt-1">{task.taskNumber}</p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <Badge
                                    variant="outline"
                                    className={
                                      task.priority === 'high'
                                        ? 'bg-red-50 text-red-700 border-red-200'
                                        : task.priority === 'medium'
                                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                          : 'bg-blue-50 text-blue-700 border-blue-200'
                                    }
                                  >
                                    {task.priority}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className={
                                      task.status === 'done'
                                        ? 'bg-green-50 text-green-700 border-green-200'
                                        : task.status === 'in_progress'
                                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                                          : 'bg-gray-50 text-gray-700 border-gray-200'
                                    }
                                  >
                                    {task.status}
                                  </Badge>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          <p className="text-sm">No tasks found</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 ml-6">
                <motion.button
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Mail className="h-5 w-5 text-gray-600" />
                </motion.button>

                <motion.button
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Bell className="h-5 w-5 text-gray-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </motion.button>

                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                  <Avatar className="h-10 w-10 border-2 border-[#e32d31]">
                    <AvatarFallback className="bg-gradient-to-br from-[#e32d31] to-[#c12529] text-white font-semibold">
                      {user?.name ? (
                        user.name.split(' ').length >= 2
                          ? (user.name.split(' ')[0][0] + user.name.split(' ')[1][0]).toUpperCase()
                          : user.name.substring(0, 2).toUpperCase()
                      ) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block">
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex-1 overflow-y-auto mt-[73px]">
          <AnimatePresence mode="wait">
            <motion.div
              className="w-full mx-auto p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
