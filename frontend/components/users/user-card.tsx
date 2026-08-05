'use client'

import { User } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Mail, Calendar, ShieldCheck, UserCheck } from 'lucide-react'
import { motion } from 'framer-motion'

interface UserCardProps {
  user: User
  index: number
  onEdit: (user: User) => void
  onDelete: (user: User) => void
}

export function UserCard({ user, index, onEdit, onDelete }: UserCardProps) {
  const getStatusBadge = (status: User['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-200">Active</Badge>
      case 'inactive':
        return <Badge variant="secondary" className="bg-slate-100 text-slate-700">Inactive</Badge>
      case 'suspended':
        return <Badge variant="destructive" className="bg-amber-500/15 text-amber-700 border-amber-200">Suspended</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getInitials = (name: string) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.3) }}
      className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-sm font-semibold text-slate-400 dark:text-slate-500 w-5 flex-shrink-0">
            {index + 1}.
          </span>
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-rose-500 to-red-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-sm">
            {getInitials(user.name)}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base truncate">
              {user.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              ID: #{user.id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {getStatusBadge(user.status)}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-lg border border-slate-100 dark:border-slate-700">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(user)}
              className="h-7 w-7 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:text-white"
            >
              <Edit className="h-3.5 w-3.5" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(user)}
              className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-50 to-red-50/20 dark:from-slate-950/60 dark:to-red-950/10 border border-slate-100 dark:border-slate-800/80 rounded-xl p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 min-w-0">
            <div className="h-6 w-6 rounded-md bg-white dark:bg-slate-800 flex items-center justify-center text-red-500 border border-slate-100 dark:border-slate-700 flex-shrink-0">
              <Mail className="h-3.5 w-3.5" />
            </div>
            <span className="truncate font-medium">{user.email}</span>
          </div>
          {user.isEmailVerified ? (
            <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex-shrink-0">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified
            </span>
          ) : null}
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-200/40 dark:border-slate-800/60">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            <span>Joined {new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
          {user.roles && user.roles.length > 0 && (
            <span className="font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[10px]">
              {user.roles.join(', ')}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
