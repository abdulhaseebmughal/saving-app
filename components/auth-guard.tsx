"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/signup', '/forgot-password', '/admin']

  // Routes that are OK for authenticated users (dashboard)
  const dashboardRoutes = ['/']

  useEffect(() => {
    console.log('🛡️ AuthGuard check:', { pathname, hasUser: !!user, loading })

    // Don't redirect while still loading
    if (loading) {
      console.log('⏳ Still loading auth state, waiting...')
      return
    }

    // Check if user should be redirected
    const isPublicRoute = publicRoutes.includes(pathname)
    const isDashboardRoute = dashboardRoutes.includes(pathname)

    if (!user && !isPublicRoute) {
      console.log('❌ No user and not on public route, redirecting to login')
      router.push('/login')
    } else if (user && (isPublicRoute && pathname !== '/admin')) {
      // Redirect logged-in users away from login/signup pages to dashboard
      console.log('✅ User already logged in, redirecting to dashboard')
      router.push('/')
    } else if (user) {
      console.log('✅ User authenticated:', user.email)
    }
  }, [user, loading, router, pathname])

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If on public route or user is authenticated, render children
  const isPublicRoute = publicRoutes.includes(pathname)
  const isDashboardRoute = dashboardRoutes.includes(pathname)

  if (isPublicRoute || user) {
    return <>{children}</>
  }

  // Otherwise show nothing (redirecting)
  return null
}
