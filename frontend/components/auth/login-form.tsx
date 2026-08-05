'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { clearLocalStorage, getStorageInfo } from '@/lib/storage-utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { motion } from 'framer-motion'
import { Mail, Lock, Loader2 } from 'lucide-react'
import Link from 'next/link'

export function LoginForm() {
  const router = useRouter()
  const { login, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }

    try {
      await login({
        email,
        password,
        app_id: 1,
      })

      router.push('/dashboard')
    } catch (err: any) {
      console.error('[Log] Login error:', err)

      let errorMessage = 'Login failed. Please try again.'

      if (err.data?.error) {
        errorMessage = err.data.error
      } else if (err.data?.message) {
        errorMessage = err.data.message
      } else if (err.message) {
        errorMessage = err.message
      }

      if (err.name === 'QuotaExceededError' || errorMessage.includes('quota')) {
        const info = getStorageInfo()
        errorMessage = `Storage full (${info?.sizeKB}KB used). Click "Clear Storage" below to fix.`
      }

      setError(errorMessage)
    }
  }

  const handleClearStorage = () => {
    clearLocalStorage()
    setError('')
    alert('localStorage cleared successfully. Please try logging in again.')
  }

  return (
    <Card className="w-full max-w-md border-0 shadow-2xl">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
        <CardDescription className="text-center">Enter your credentials to access the system</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <label htmlFor="email" className="text-sm font-semibold text-gray-700">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="pl-10 h-12"
              />
            </div>
          </motion.div>

          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <label htmlFor="password" className="text-sm font-semibold text-gray-700">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="pl-10 h-12"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-[#e32d31] to-[#c12529] hover:from-[#c12529] hover:to-[#a01f23] text-white font-semibold shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </motion.div>

          <motion.div
            className="text-center pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                href="/register"
                className="font-semibold text-[#e32d31] hover:text-[#c12529] transition-colors"
              >
                Create account
              </Link>
            </p>
          </motion.div>
        </form>
      </CardContent>
    </Card>
  )
}
