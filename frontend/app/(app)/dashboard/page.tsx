'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api-client'
import { StatsCard } from '@/components/dashboard/stats-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { AlertCircle, TrendingUp, Users, Clock } from 'lucide-react'

const projectProgress = [
  { name: 'Completed', value: 41, color: '#10b981' },
  { name: 'In Progress', value: 35, color: '#f59e0b' },
  { name: 'Pending', value: 24, color: '#e5e7eb' },
]

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTasks: 0,
    tasksPending: 0,
    tasksInProgress: 0,
    tasksDone: 0,
  })
  const [recentTasks, setRecentTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [timeTracking, setTimeTracking] = useState({
    hours: 1,
    minutes: 24,
    seconds: 8,
    isRunning: false,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get('/api/summary')

        setStats({
          totalUsers: response.totalUsers || 0,
          totalTasks: response.totalTasks || 0,
          tasksPending: response.tasksByStatus?.pending || 0,
          tasksInProgress: response.tasksByStatus?.in_progress || 0,
          tasksDone: response.tasksByStatus?.done || 0,
        })
        setRecentTasks(response.recentTasks || [])
        setLoading(false)
      } catch (err: any) {
        setError('Failed to load dashboard data')
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  useEffect(() => {
    if (timeTracking.isRunning) {
      const interval = setInterval(() => {
        setTimeTracking(prev => {
          let newSeconds = prev.seconds + 1
          let newMinutes = prev.minutes
          let newHours = prev.hours

          if (newSeconds >= 60) {
            newSeconds = 0
            newMinutes += 1
          }
          if (newMinutes >= 60) {
            newMinutes = 0
            newHours += 1
          }

          return {
            ...prev,
            seconds: newSeconds,
            minutes: newMinutes,
            hours: newHours,
          }
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [timeTracking.isRunning])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Plan, prioritize, and accomplish your tasks with ease.
          </p>
        </div>
        <div className="flex items-center gap-3">
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          subtitle="Active users"
          color="emerald"
        />
        <StatsCard
          title="Total Tasks"
          value={stats.totalTasks}
          icon={TrendingUp}
          subtitle="All tasks"
          color="blue"
        />
        <StatsCard
          title="In Progress"
          value={stats.tasksInProgress}
          icon={Clock}
          subtitle="Tasks in progress"
          color="purple"
        />
        <StatsCard
          title="Completed Tasks"
          value={stats.tasksDone}
          icon={AlertCircle}
          subtitle="Finished tasks"
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Team Collaboration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTasks.length === 0 && !loading && (
                  <p className="text-center text-gray-500 py-4">No recent tasks</p>
                )}
                {recentTasks.map((task) => {
                  const statusMap: Record<string, { label: string; className: string }> = {
                    done: { label: 'Completed', className: 'bg-green-100 text-green-700' },
                    in_progress: { label: 'In Progress', className: 'bg-yellow-100 text-yellow-700' },
                    pending: { label: 'Pending', className: 'bg-purple-100 text-purple-700' },
                  }
                  const statusInfo = statusMap[task.status] || { label: task.status, className: 'bg-gray-100 text-gray-700' }

                  return (
                    <div
                      key={task.id}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#e32d31] flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {task.assigneeName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">{task.assigneeName}</p>
                        <p className="text-sm text-gray-500 truncate">Working on: {task.title}</p>
                      </div>
                      <span className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium',
                        statusInfo.className
                      )}>
                        {statusInfo.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-0 shadow-lg h-[408px]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Project Progress</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="relative w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={projectProgress}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {projectProgress.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-gray-900">41%</span>
                  <span className="text-sm text-gray-500">Project Ended</span>
                </div>
              </div>
              <div className="flex gap-4 mt-4">
                {projectProgress.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-xs text-gray-600">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
