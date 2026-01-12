/**
 * Admin Page - Optimized and Secure
 * All hardcoded credentials removed, using environment variables
 */

'use client'

import dynamic from 'next/dynamic'
import { useAdminAuth } from '@/src/features/admin/hooks/useAdminAuth'
import { useAdminDashboard } from '@/src/features/admin/hooks/useAdminDashboard'
import Loader from '@/components/loader'

// Lazy load admin components for better performance
const AdminLogin = dynamic(
  () => import('@/src/features/admin/components/AdminLogin').then(mod => ({ default: mod.AdminLogin })),
  { loading: () => <Loader /> }
)

const AdminDashboardContent = dynamic(
  () => import('@/src/features/admin/components/AdminDashboardContent').then(mod => ({ default: mod.AdminDashboardContent })),
  { loading: () => <Loader /> }
)

export default function AdminPage() {
  const {
    isAuthenticated,
    credentials,
    isLoading: isAuthLoading,
    error: authError,
    login,
    logout,
  } = useAdminAuth()

  const {
    data,
    isLoading: isDashboardLoading,
    error: dashboardError,
    fetchData,
    deleteItem,
  } = useAdminDashboard(credentials)

  // Show login if not authenticated
  if (!isAuthenticated) {
    return (
      <AdminLogin
        onLogin={login}
        isLoading={isAuthLoading}
        error={authError}
      />
    )
  }

  // Show loader while fetching dashboard data
  if (!data && isDashboardLoading) {
    return <Loader />
  }

  // Show error if dashboard failed to load
  if (dashboardError || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-destructive">Error Loading Dashboard</h2>
          <p className="text-muted-foreground">{dashboardError || 'Failed to load data'}</p>
          <button
            onClick={() => fetchData()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <AdminDashboardContent
      data={data}
      onDelete={deleteItem}
      onRefresh={fetchData}
      onLogout={logout}
      isLoading={isDashboardLoading}
    />
  )
}
