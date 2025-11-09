"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Public routes that don't require authentication
    const publicRoutes = ['/login']

    if (!isLoading && !user && !publicRoutes.includes(pathname)) {
      router.push('/login')
    }
  }, [user, isLoading, router, pathname])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // If on public route or user is authenticated, render children
  const publicRoutes = ['/login']
  if (publicRoutes.includes(pathname) || user) {
    return <>{children}</>
  }

  // Otherwise show nothing (will redirect)
  return null
}
