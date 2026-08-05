'use client'

import { useState, useEffect, useCallback } from 'react'
import { User } from '@/lib/types'
import { apiClient } from '@/lib/api-client'
import { DataTable, Column } from '@/components/ui/data-table'
import { userColumns } from '@/components/users/user-columns'
import { UserFormDialog } from '@/components/users/user-form-dialog'
import { UserCard } from '@/components/users/user-card'
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, Edit, Trash2, Search, Loader2, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')

  const [totalItems, setTotalItems] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const fetchUsers = useCallback(async (targetPage = 1, targetCursor: string | null = null, isAppend = false, targetPageSize = pageSize) => {
    if (isAppend) {
      setIsLoadingMore(true)
    } else {
      setIsLoading(true)
    }

    try {
      const mode = window.innerWidth >= 768 ? 'desktop' : 'mobile'
      let endpoint = `/api/users?limit=${targetPageSize}&mode=${mode}`

      if (mode === 'desktop') {
        endpoint += `&page=${targetPage}`
      } else if (targetCursor) {
        endpoint += `&cursor=${encodeURIComponent(targetCursor)}`
      }

      if (searchQuery) {
        endpoint += `&search=${encodeURIComponent(searchQuery)}`
      }
      const response = await apiClient.get<any>(endpoint)
      const usersData = response.data || []
      const more = response.hasMore ?? false
      const cursor = response.nextCursor ?? null
      const total = response.total ?? 0

      if (mode === 'mobile') {
        setUsers((prev) => (isAppend ? [...prev, ...usersData] : usersData))
        setHasMore(more)
        setNextCursor(cursor)
      } else {
        setUsers(usersData)
        setTotalItems(total)
      }
      setPage(targetPage)
    } catch (error: any) {
      console.error('[Log] Failed to fetch users:', error)
      toast.error('Failed to load users')
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }, [searchQuery, pageSize])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1, null, false)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery, fetchUsers])

  const [nextCursor, setNextCursor] = useState<string | null>(null)

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && nextCursor && window.innerWidth < 768) {
      fetchUsers(1, nextCursor, true)
    }
  }, [fetchUsers, hasMore, isLoadingMore, nextCursor])

  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: handleLoadMore,
    hasMore,
    isLoading: isLoading || isLoadingMore,
  })

  const handleCreate = () => {
    setSelectedUser(null)
    setFormOpen(true)
  }

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setFormOpen(true)
  }

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user)
    setDeleteOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return

    try {
      await apiClient.delete(`/api/users/${selectedUser.id}`)
      toast.success('User deleted successfully')
      fetchUsers(1, null, false)
    } catch (error: any) {
      console.error('[Log] Failed to delete user:', error)
      toast.error('Failed to delete user')
    } finally {
      setDeleteOpen(false)
      setSelectedUser(null)
    }
  }

  const handleFormSuccess = () => {
    toast.success(selectedUser ? 'User updated successfully' : 'User created successfully')
    fetchUsers(1, null, false)
  }

  const columnsWithActions: Column<User>[] = [
    ...userColumns,
    {
      key: 'actions',
      label: 'Actions',
      render: (user) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(user)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteClick(user)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6 pb-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Manage system users and permissions</p>
          </div>
          <Button
            onClick={handleCreate}
            className="bg-gradient-to-r from-[#e32d31] to-[#c12529] hover:from-[#c12529] hover:to-[#a01f23] shadow-sm flex-shrink-0"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            <span>Add User</span>
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="hidden md:block"
      >
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>View and manage all system users</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={users}
              columns={columnsWithActions}
              searchable
              searchPlaceholder="Search users..."
              onSearch={setSearchQuery}
              isLoading={isLoading}
              serverSide={true}
              totalItems={totalItems}
              pageSize={pageSize}
              currentPage={page}
              onPageChange={(p) => fetchUsers(p, null, false, pageSize)}
              onPageSizeChange={(size) => {
                setPageSize(size)
                fetchUsers(1, null, false, size)
              }}
            />
          </CardContent>
        </Card>
      </motion.div>

      <div className="block md:hidden space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl"
          />
        </div>

        {isLoading && users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-red-600 mb-2" />
            <p className="text-sm font-medium">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-6">
            <Users className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-2" />
            <h3 className="font-semibold text-slate-700 dark:text-slate-200">No users found</h3>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((user, idx) => (
              <UserCard
                key={user.id}
                user={user}
                index={idx}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            ))}

            <div ref={sentinelRef} className="py-4 flex justify-center">
              {isLoadingMore && (
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-white dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                  <span>Loading more users...</span>
                </div>
              )}
              {!hasMore && users.length > 0 && (
                <p className="text-xs text-slate-400 dark:text-slate-600 py-2">
                  Showing all {users.length} users
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        user={selectedUser}
        onSuccess={handleFormSuccess}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user{' '}
              <span className="font-semibold">{selectedUser?.name || selectedUser?.email}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 rounded-xl"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
