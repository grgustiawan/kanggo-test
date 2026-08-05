import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import './globals.css'
import { AuthProvider } from '@/lib/auth-context'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'KANGGO - Task Management System',
  description: 'A centralized task management system for PT Tenaga Kanggo Indonesia to plan, assign, track, and monitor work progress across teams. It streamlines collaboration, improves productivity, manages task priorities and deadlines, and provides real-time visibility into project execution and team performance.',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
