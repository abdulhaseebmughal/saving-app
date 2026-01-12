/**
 * Next.js Middleware for Authentication
 * Runs on the edge before page renders
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/_next',
  '/favicon.ico',
  '/manifest.json',
  '/sw.js',
  '/api',
]

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/board',
  '/notes',
  '/files',
  '/packages',
  '/projects',
  '/profile',
  '/settings',
  '/components',
]

// Admin route
const ADMIN_ROUTE = '/admin'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check for auth token in cookies or headers
  const token = request.cookies.get('auth_token')?.value ||
                request.headers.get('authorization')?.replace('Bearer ', '')

  // Admin route: Allow access (auth happens on client)
  if (pathname.startsWith(ADMIN_ROUTE)) {
    return NextResponse.next()
  }

  // Protected routes: Redirect to login if no token
  if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    if (!token) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
  }

  // Home page: Allow if authenticated, redirect to login if not
  if (pathname === '/') {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
