/**
 * Admin Dashboard Hook
 */

import { useState, useCallback, useEffect } from 'react'
import { adminAPI } from '@/lib/api/admin.api'
import type { AdminDashboardData } from '@/shared/types'

interface AdminCredentials {
  email: string
  password: string
}

export function useAdminDashboard(credentials: AdminCredentials | null) {
  const [data, setData] = useState<AdminDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!credentials) {
      setError('No credentials provided')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const dashboardData = await adminAPI.getDashboardData(credentials)
      setData(dashboardData)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [credentials])

  const deleteItem = useCallback(
    async (collection: string, itemId: string) => {
      if (!credentials) return false

      try {
        await adminAPI.deleteItem(collection as any, itemId, credentials)
        // Refresh data after delete
        await fetchData()
        return true
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete item'
        setError(message)
        return false
      }
    },
    [credentials, fetchData]
  )

  useEffect(() => {
    if (credentials) {
      fetchData()
    }
  }, [credentials, fetchData])

  return {
    data,
    isLoading,
    error,
    fetchData,
    deleteItem,
  }
}
