import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface StatsCardProps {
  title: string
  value: string | number
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  subtitle?: string
  className?: string
  color?: 'emerald' | 'blue' | 'purple' | 'orange'
}

const colorClasses = {
  emerald: {
    bg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    text: 'text-emerald-600',
    iconBg: 'bg-emerald-100',
  },
  blue: {
    bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
    text: 'text-blue-600',
    iconBg: 'bg-blue-100',
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-500 to-purple-600',
    text: 'text-purple-600',
    iconBg: 'bg-purple-100',
  },
  orange: {
    bg: 'bg-gradient-to-br from-orange-500 to-orange-600',
    text: 'text-orange-600',
    iconBg: 'bg-orange-100',
  },
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  className,
  color = 'emerald',
}: StatsCardProps) {
  const colors = colorClasses[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card className={cn('overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300', className)}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
            </div>
            {Icon && (
              <motion.div 
                className={cn('rounded-xl p-3', colors.iconBg)}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <Icon className={cn('h-6 w-6', colors.text)} />
              </motion.div>
            )}
          </div>
          
          <div className="space-y-2">
            <motion.div 
              className="flex items-baseline gap-2"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className="text-4xl font-bold text-gray-900">{value}</span>
            </motion.div>
            
            <div className="flex items-center gap-2">
              {trend && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold',
                    trend.isPositive 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  )}
                >
                  {trend.isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </motion.div>
              )}
              {subtitle && (
                <span className="text-xs text-gray-500">{subtitle}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
