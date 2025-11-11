"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/signup', '/forgot-password', '/admin']

    if (!user && !publicRoutes.includes(pathname)) {
      router.push('/login')
    }
  }, [user, router, pathname])

  // If on public route or user is authenticated, render children
  const publicRoutes = ['/login', '/signup', '/forgot-password', '/admin']
  if (publicRoutes.includes(pathname) || user) {
    return <>{children}</>
  }

  // Otherwise show nothing (will redirect)
  return null
}
