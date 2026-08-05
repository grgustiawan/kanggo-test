import { Column } from '@/components/ui/data-table'
import { Task } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react'

export const taskColumns: Column<Task>[] = [
  {
    key: 'taskNumber',
    label: 'Task #',
    sortable: true,
    render: (task) => (
      <span className="font-mono text-sm text-gray-600">{task.taskNumber}</span>
    ),
  },
  {
    key: 'title',
    label: 'Title',
    render: (task) => (
      <div className="max-w-md">
        <p className="font-medium text-gray-900 truncate">{task.title}</p>
        {task.description && (
          <p className="text-sm text-gray-500 truncate">{task.description}</p>
        )}
      </div>
    ),
  },
  {
    key: 'userName',
    label: 'Assigned To',
    render: (task) => (
      <span className="text-sm font-medium text-gray-700">
        {task.userName || 'Unassigned'}
      </span>
    ),
  },
  {
    key: 'status',
    label: 'Status',
    render: (task) => {
      const statusConfig = {
        pending: {
          label: 'Pending',
          className: 'bg-gray-100 text-gray-700 border-gray-200',
          icon: AlertCircle,
        },
        in_progress: {
          label: 'In Progress',
          className: 'bg-blue-100 text-blue-700 border-blue-200',
          icon: Clock,
        },
        done: {
          label: 'Done',
          className: 'bg-green-100 text-green-700 border-green-200',
          icon: CheckCircle2,
        },
      }

      const config = statusConfig[task.status]
      const Icon = config.icon

      return (
        <Badge variant="outline" className={config.className}>
          <Icon className="mr-1 h-3 w-3" />
          {config.label}
        </Badge>
      )
    },
  },
  {
    key: 'priority',
    label: 'Priority',
    render: (task) => {
      const priorityColors = {
        low: 'bg-gray-100 text-gray-700 border-gray-200',
        medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        high: 'bg-red-100 text-red-700 border-red-200',
      }

      return (
        <Badge variant="outline" className={priorityColors[task.priority]}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </Badge>
      )
    },
  },
  {
    key: 'deadline',
    label: 'Deadline',
    sortable: true,
    render: (task) => {
      if (!task.deadline) {
        return <span className="text-sm text-gray-400">No deadline</span>
      }

      const deadline = new Date(task.deadline)
      const now = new Date()
      const isOverdue = deadline < now && task.status !== 'done'

      return (
        <span
          className={`text-sm ${
            isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'
          }`}
        >
          {deadline.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      )
    },
  },
  {
    key: 'createdAt',
    label: 'Created',
    sortable: true,
    render: (task) => (
      <span className="text-sm text-gray-500">
        {new Date(task.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </span>
    ),
  },
]
