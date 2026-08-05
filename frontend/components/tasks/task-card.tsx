'use client'

import { Task } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Clock, User as UserIcon, CheckCircle2, AlertCircle, PlayCircle, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'

interface TaskCardProps {
  task: Task
  index: number
  canEdit: boolean
  canDelete: boolean
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

export function TaskCard({ task, index, canEdit, canDelete, onEdit, onDelete }: TaskCardProps) {
  const getStatusBadge = (status: Task['status']) => {
    switch (status) {
      case 'done':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/25 border-emerald-200 dark:border-emerald-800 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Done
          </Badge>
        )
      case 'in_progress':
        return (
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 hover:bg-amber-500/25 border-amber-200 dark:border-amber-800 gap-1">
            <PlayCircle className="h-3 w-3" />
            In Progress
          </Badge>
        )
      case 'pending':
      default:
        return (
          <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        )
    }
  }

  const getPriorityBadge = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-200 font-semibold text-[10px]">High</Badge>
      case 'medium':
        return <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200 text-[10px]">Medium</Badge>
      case 'low':
      default:
        return <Badge variant="secondary" className="text-[10px]">Low</Badge>
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.3) }}
      className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <span className="text-sm font-semibold text-slate-400 dark:text-slate-500 pt-0.5 flex-shrink-0">
            {index + 1}.
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded border border-red-100 dark:border-red-900/50 flex-shrink-0">
                {task.taskNumber || `#${task.id}`}
              </span>
              {getPriorityBadge(task.priority)}
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base leading-snug break-words">
              {task.title}
            </h3>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {getStatusBadge(task.status)}
          {(canEdit || canDelete) && (
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-lg border border-slate-100 dark:border-slate-700">
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(task)}
                  className="h-7 w-7 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:text-white"
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span className="sr-only">Edit</span>
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(task)}
                  className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="sr-only">Delete</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-50 to-red-50/20 dark:from-slate-950/60 dark:to-red-950/10 border border-slate-100 dark:border-slate-800/80 rounded-xl p-3 flex flex-col gap-2.5">
        {task.description ? (
          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        ) : (
          <p className="text-xs text-slate-400 dark:text-slate-500 italic">
            No description provided
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/40 dark:border-slate-800/60">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="h-5 w-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
              <UserIcon className="h-3 w-3 text-slate-600 dark:text-slate-300" />
            </div>
            <span className="truncate text-[11px] font-medium text-slate-700 dark:text-slate-300">
              {task.userName || `User #${task.userId}`}
            </span>
          </div>

          {task.deadline && (
            <div className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium flex-shrink-0">
              <Calendar className="h-3.5 w-3.5" />
              <span>{new Date(task.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
