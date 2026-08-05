'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Task } from '@/lib/types'
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/lib/auth-context'
import { canCreateTask, canEditTask, canDeleteTask } from '@/lib/permissions'
import { DataTable, Column } from '@/components/ui/data-table'
import { taskColumns } from '@/components/tasks/task-columns'
import { TaskFormDialog } from '@/components/tasks/task-form-dialog'
import { TaskCard } from '@/components/tasks/task-card'
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Plus, Edit, Trash2, Search, Loader2, CheckSquare } from 'lucide-react'
import { toast } from 'sonner'

export default function TasksPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const fetchTasks = useCallback(async (targetCursor: string | null = null, targetPage = 1, isAppend = false, targetPageSize = pageSize) => {
    if (isAppend) {
      setIsLoadingMore(true)
    } else {
      setIsLoading(true)
    }

    try {
      const mode = window.innerWidth >= 768 ? 'desktop' : 'mobile'
      let endpoint = statusFilter === 'all'
        ? `/api/tasks?limit=${targetPageSize}&mode=${mode}`
        : `/api/tasks?status=${statusFilter}&limit=${targetPageSize}&mode=${mode}`

      if (searchQuery) {
        endpoint += `&search=${encodeURIComponent(searchQuery)}`
      }

      if (mode === 'mobile' && targetCursor) {
        endpoint += `&cursor=${encodeURIComponent(targetCursor)}`
      } else if (mode === 'desktop') {
        endpoint += `&page=${targetPage}`
      }

      const response = await apiClient.get<any>(endpoint)
      const tasksData = response.data || []
      const more = response.hasMore ?? false
      const cursor = response.nextCursor ?? null
      const total = response.total ?? 0

      if (mode === 'mobile') {
        setTasks((prev) => (isAppend ? [...prev, ...tasksData] : tasksData))
        setHasMore(more)
        setNextCursor(cursor)
      } else {
        setTasks(tasksData)
        setTotalItems(total)
        setPage(targetPage)
      }
    } catch (error: any) {
      console.error('[Log] Failed to fetch tasks:', error)
      toast.error('Failed to load tasks')
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }, [statusFilter, searchQuery, pageSize])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks(null, 1, false)
    }, 400)
    return () => clearTimeout(timer)
  }, [statusFilter, searchQuery, fetchTasks])

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && nextCursor && window.innerWidth < 768) {
      fetchTasks(nextCursor, 1, true)
    }
  }, [fetchTasks, hasMore, isLoadingMore, nextCursor])

  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: handleLoadMore,
    hasMore,
    isLoading: isLoading || isLoadingMore,
  })

  const handleCreate = useCallback(() => {
    setSelectedTask(null)
    setFormOpen(true)
  }, [])

  const handleEdit = useCallback((task: Task) => {
    setSelectedTask(task)
    setFormOpen(true)
  }, [])

  const handleDeleteClick = useCallback((task: Task) => {
    setSelectedTask(task)
    setDeleteOpen(true)
  }, [])

  const handleDeleteConfirm = async () => {
    if (!selectedTask) return

    try {
      await apiClient.delete(`/api/tasks/${selectedTask.id}`)
      toast.success('Task deleted successfully')
      fetchTasks(null, 1, false)
    } catch (error: any) {
      console.error('[Log] Failed to delete task:', error)
      toast.error('Failed to delete task')
    } finally {
      setDeleteOpen(false)
      setSelectedTask(null)
    }
  }

  const handleFormSuccess = useCallback(() => {
    toast.success(selectedTask ? 'Task updated successfully' : 'Task created successfully')
    fetchTasks(null, 1, false)
  }, [selectedTask, fetchTasks])

  const columnsWithActions: Column<Task>[] = useMemo(() => [
    ...taskColumns,
    {
      key: 'actions',
      label: 'Actions',
      render: (task) => (
        <div className="flex items-center gap-2">
          {canEditTask(user) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(task)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {canDeleteTask(user) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteClick(task)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ], [user, handleEdit, handleDeleteClick])

  const canEdit = canEditTask(user)
  const canDelete = canDeleteTask(user)

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Task Management</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Manage and track all your tasks</p>
        </div>
        {canCreateTask(user) && (
          <Button
            onClick={handleCreate}
            className="bg-gradient-to-r from-[#e32d31] to-[#c12529] hover:from-[#c12529] hover:to-[#a01f23] shadow-sm flex-shrink-0"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            <span>Add Task</span>
          </Button>
        )}
      </div>

      <div className="hidden md:block">
        <Card className="animate-fade-in-up">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Tasks</CardTitle>
              <CardDescription>View and manage all tasks in the system</CardDescription>
            </div>
            <div className="w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              data={tasks}
              columns={columnsWithActions}
              searchable
              searchPlaceholder="Search tasks..."
              onSearch={setSearchQuery}
              isLoading={isLoading}
              serverSide={true}
              totalItems={totalItems}
              pageSize={pageSize}
              currentPage={page}
              onPageChange={(p) => fetchTasks(null, p, false, pageSize)}
              onPageSizeChange={(size) => {
                setPageSize(size)
                fetchTasks(null, 1, false, size)
              }}
            />
          </CardContent>
        </Card>
      </div>

      <div className="block md:hidden space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl text-sm"
            />
          </div>
          <div className="w-36 flex-shrink-0">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl text-xs h-10">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading && tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-red-600 mb-2" />
            <p className="text-sm font-medium">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-6">
            <CheckSquare className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-2" />
            <h3 className="font-semibold text-slate-700 dark:text-slate-200">No tasks found</h3>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task, idx) => (
              <TaskCard
                key={task.id}
                task={task}
                index={idx}
                canEdit={canEdit}
                canDelete={canDelete}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            ))}

            <div ref={sentinelRef} className="py-4 flex justify-center">
              {isLoadingMore && (
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-white dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                  <span>Loading more tasks...</span>
                </div>
              )}
              {!hasMore && tasks.length > 0 && (
                <p className="text-xs text-slate-400 dark:text-slate-600 py-2">
                  Showing all {tasks.length} tasks
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        task={selectedTask}
        onSuccess={handleFormSuccess}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task{' '}
              <span className="font-semibold">{selectedTask?.title}</span>.
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
