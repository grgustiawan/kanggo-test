'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { canAccessUserManagement } from '@/lib/permissions'
import { LogoutButton } from '@/components/auth/logout-button'
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Menu,
  X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const menuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'User Management',
    href: '/users',
    icon: Users,
  },
  {
    title: 'Task Management',
    href: '/tasks',
    icon: CheckSquare,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const visibleMenuItems = menuItems.filter(item => {
    if (item.href === '/users') {
      return canAccessUserManagement(user)
    }
    return true
  })

  const sidebarContent = (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-white">
      <motion.div
        className="p-6 border-b border-gray-200"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <div className='w-12 h-12 rounded-lg overflow-hidden'>
                <img src="/logo.png" alt="logo" className="w-12 h-12 object-contain" />
              </div>
            </motion.div>

            <div className='flex flex-col gap-0'>
              <h1 className="font-bold text-lg text-gray-900">KANGGO</h1>
              <span className='text-sm text-gray-400 -mt-1'>Task Management</span>
            </div>
          </Link>
          <button
            className="md:hidden p-2 text-gray-500 hover:text-gray-700"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </motion.div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        <div className="px-3 mb-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Menu</p>
        </div>
        {visibleMenuItems.map((item, index) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-[#e32d31] text-white shadow-lg shadow-[#e32d31]/30'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.title}
              </Link>
            </motion.div>
          )
        })}
      </nav>

      <motion.div
        className="p-4 border-t border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <LogoutButton />
      </motion.div>
    </div>
  )

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-[18px] left-4 z-40 p-1.5 bg-white rounded-md border border-gray-200 shadow-sm text-gray-600 hover:bg-gray-50 focus:outline-none"
      >
        <Menu className="h-5 w-5" />
      </button>

      <aside className="hidden md:block fixed left-0 top-0 w-64 h-screen border-r border-gray-200 shadow-sm z-30">
        {sidebarContent}
      </aside>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 bg-gray-900/50 z-40 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed left-0 top-0 w-[280px] h-screen shadow-xl z-50 overflow-hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
