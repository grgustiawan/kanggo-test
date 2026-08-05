'use client'

import { useState, useEffect } from 'react'
import { Task, CreateTaskRequest, UpdateTaskRequest } from '@/lib/types'
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/lib/auth-context'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Loader2, Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task | null
  onSuccess: () => void
}

export function TaskFormDialog({ open, onOpenChange, task, onSuccess }: TaskFormDialogProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [comboboxOpen, setComboboxOpen] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending' as 'pending' | 'in_progress' | 'done',
    priority: 'medium' as 'low' | 'medium' | 'high',
    userId: 0,
    deadline: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'pending',
        priority: task.priority || 'medium',
        userId: task.userId || user?.id || 0,
        deadline: task.deadline ? task.deadline.split('T')[0] : '',
      })
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        userId: user?.id || 0,
        deadline: '',
      })
    }
    setErrors({})
    
    if (open) {
      apiClient.get('/api/users').then((res: any) => {
        setUsers(Array.isArray(res.data) ? res.data : [])
      }).catch(console.error)
    }
  }, [task, open, user])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters'
    }

    if (!formData.userId || formData.userId === 0) {
      newErrors.userId = 'Assigned user is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const deadlineValue = formData.deadline 
        ? new Date(formData.deadline + 'T00:00:00.000Z').toISOString()
        : undefined

      if (task) {
        const updateData: UpdateTaskRequest = {
          title: formData.title,
          description: formData.description || undefined,
          status: formData.status,
          priority: formData.priority,
          userId: formData.userId,
          deadline: deadlineValue,
        }
        await apiClient.put(`/api/tasks/${task.id}`, updateData)
      } else {
        const createData: CreateTaskRequest = {
          title: formData.title,
          description: formData.description || undefined,
          status: formData.status,
          priority: formData.priority,
          userId: formData.userId,
          deadline: deadlineValue,
        }
        await apiClient.post('/api/tasks', createData)
      }

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      console.error('[Log] Failed to save task:', error)
      if (error.data?.error) {
        setErrors({ submit: error.data.error })
      } else {
        setErrors({ submit: 'Failed to save task. Please try again.' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          <DialogDescription>
            {task ? 'Update task details below.' : 'Fill in the details to create a new task.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter task title"
              disabled={isLoading}
            />
            {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter task description (optional)"
              disabled={isLoading}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label>Assigned User</Label>
              <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={comboboxOpen}
                    className="w-full justify-between font-normal"
                    disabled={isLoading || !!task}
                  >
                    {formData.userId && users.length > 0
                      ? users.find((u) => u.id === formData.userId)?.name || 'Select user...'
                      : 'Select user...'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-0">
                  <Command>
                    <CommandInput placeholder="Search user..." />
                    <CommandList>
                      <CommandEmpty>No user found.</CommandEmpty>
                      <CommandGroup>
                        {users.map((u) => (
                          <CommandItem
                            key={u.id}
                            value={u.name}
                            onSelect={() => {
                              setFormData({ ...formData, userId: u.id })
                              setComboboxOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.userId === u.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {u.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors.userId && <p className="text-sm text-red-600">{errors.userId}</p>}
            </div>
          </div>

          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-[#e32d31] to-[#c12529] hover:from-[#c12529] hover:to-[#a01f23]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {task ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>{task ? 'Update Task' : 'Create Task'}</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
