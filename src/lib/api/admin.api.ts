/**
 * Admin API Client
 * Optimized and type-safe admin operations
 */

import type { AdminDashboardData, ApiResponse, Collection } from '@/shared/types'
import { API_CONFIG } from '@/lib/constants'

interface AdminCredentials {
  email: string
  password: string
}

class AdminAPI {
  private baseUrl: string

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL
  }

  /**
   * Fetch admin dashboard data
   */
  async getDashboardData(credentials: AdminCredentials): Promise<AdminDashboardData> {
    const response = await fetch(`${this.baseUrl}/admin/dashboard`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Admin-Email': credentials.email,
        'Admin-Password': credentials.password,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch dashboard data' }))
      throw new Error(error.error || 'Authentication failed')
    }

    const data: ApiResponse<AdminDashboardData> = await response.json()

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to load dashboard')
    }

    return data.data
  }

  /**
   * Delete item from any collection
   */
  async deleteItem(
    collection: Collection,
    itemId: string,
    credentials: AdminCredentials
  ): Promise<void> {
    const response = await fetch(`${this.baseUrl}/admin/${collection}/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Admin-Email': credentials.email,
        'Admin-Password': credentials.password,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to delete item' }))
      throw new Error(error.error || 'Delete failed')
    }

    const data: ApiResponse = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Failed to delete item')
    }
  }

  /**
   * Verify admin credentials (without fetching data)
   */
  async verifyCredentials(credentials: AdminCredentials): Promise<boolean> {
    try {
      await this.getDashboardData(credentials)
      return true
    } catch {
      return false
    }
  }
}

export const adminAPI = new AdminAPI()
