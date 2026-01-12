/**
 * Admin Authentication Hook
 */

import { useState, useCallback } from 'react'
import { adminAPI } from '@/lib/api/admin.api'
import { ADMIN_CONFIG } from '@/lib/config/admin.config'

interface AdminCredentials {
  email: string
  password: string
}

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [credentials, setCredentials] = useState<AdminCredentials | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const creds = { email, password }
      const isValid = await adminAPI.verifyCredentials(creds)

      if (isValid) {
        setIsAuthenticated(true)
        setCredentials(creds)
        return true
      } else {
        setError('Invalid admin credentials')
        return false
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed'
      setError(message)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setIsAuthenticated(false)
    setCredentials(null)
    setError(null)
  }, [])

  const autoLogin = useCallback(async () => {
    const email = ADMIN_CONFIG.email
    const password = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || ''

    if (email && password) {
      await login(email, password)
    }
  }, [login])

  return {
    isAuthenticated,
    credentials,
    isLoading,
    error,
    login,
    logout,
    autoLogin,
  }
}
