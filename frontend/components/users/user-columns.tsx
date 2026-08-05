import { Column } from '@/components/ui/data-table'
import { User } from '@/lib/types'
import { Badge } from '@/components/ui/badge'

export const userColumns: Column<User>[] = [
  {
    key: 'id',
    label: 'ID',
    render: (user) => (
      <span className="font-mono text-sm text-gray-600">#{user.id}</span>
    ),
  },
  {
    key: 'name',
    label: 'Name',
    render: (user) => (
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-[#e32d31] to-[#c12529] text-white font-semibold text-sm">
          {user.name
            ? user.name.split(' ').length >= 2
              ? (user.name.split(' ')[0][0] + user.name.split(' ')[1][0]).toUpperCase()
              : user.name.substring(0, 2).toUpperCase()
            : 'U'}
        </div>
        <span className="font-medium text-gray-900">{user.name}</span>
      </div>
    ),
  },
  {
    key: 'email',
    label: 'Email',
    render: (user) => (
      <span className="text-gray-600">{user.email}</span>
    ),
  },
  {
    key: 'status',
    label: 'Status',
    render: (user) => {
      const statusColors = {
        active: 'bg-green-100 text-green-700 border-green-200',
        inactive: 'bg-gray-100 text-gray-700 border-gray-200',
        suspended: 'bg-red-100 text-red-700 border-red-200',
        deleted: 'bg-red-100 text-red-700 border-red-200',
      }
      
      return (
        <Badge
          variant="outline"
          className={statusColors[user.status] || statusColors.inactive}
        >
          {user.status}
        </Badge>
      )
    },
  },
  {
    key: 'createdAt',
    label: 'Created',
    render: (user) => (
      <span className="text-sm text-gray-500">
        {new Date(user.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </span>
    ),
  },
]
