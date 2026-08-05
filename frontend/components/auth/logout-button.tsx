'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { motion } from 'framer-motion'

export function LogoutButton() {
  const router = useRouter()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Button 
        variant="ghost" 
        onClick={handleLogout} 
        className="w-full justify-start gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
      >
        <LogOut className="h-5 w-5" />
        Logout
      </Button>
    </motion.div>
  )
}
