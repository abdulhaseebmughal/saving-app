/**
 * Optimized API Client
 * Direct communication with backend, no proxy needed
 */

import { API_CONFIG, AUTH_CONFIG } from '@/lib/constants'
import type { ApiResponse } from '@/shared/types'

class APIClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    const token = this.getToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(AUTH_CONFIG.TOKEN_KEY)
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          error: `HTTP ${response.status}: ${response.statusText}`,
        }))
        throw new Error(error.error || error.message || 'Request failed')
      }

      const data: ApiResponse<T> = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Request failed')
      }

      return data.data as T
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error)
      throw error
    }
  }

  // GET request
  async get<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  // POST request
  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // PUT request
  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // DELETE request
  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  // Upload file
  async upload<T = any>(endpoint: string, file: File): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)

    const url = `${this.baseUrl}${endpoint}`
    const headers: HeadersInit = {}

    const token = this.getToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: 'Upload failed',
      }))
      throw new Error(error.error || 'Upload failed')
    }

    const data: ApiResponse<T> = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Upload failed')
    }

    return data.data as T
  }
}

export const apiClient = new APIClient()

// Convenience exports for specific endpoints
export const itemsAPI = {
  getAll: () => apiClient.get('/items'),
  getOne: (id: string) => apiClient.get(`/item/${id}`),
  save: (data: any) => apiClient.post('/save', data),
  update: (id: string, data: any) => apiClient.put(`/item/${id}`, data),
  delete: (id: string) => apiClient.delete(`/item/${id}`),
  getStats: () => apiClient.get('/stats'),
}

export const notesAPI = {
  getAll: () => apiClient.get('/notes'),
  create: (data: any) => apiClient.post('/notes', data),
  update: (id: string, data: any) => apiClient.put(`/notes/${id}`, data),
  delete: (id: string) => apiClient.delete(`/notes/${id}`),
}

export const diaryNotesAPI = {
  getAll: () => apiClient.get('/diary-notes'),
  create: (data: any) => apiClient.post('/diary-notes', data),
  update: (id: string, data: any) => apiClient.put(`/diary-notes/${id}`, data),
  delete: (id: string) => apiClient.delete(`/diary-notes/${id}`),
}

export const projectsAPI = {
  getAll: () => apiClient.get('/projects'),
  create: (data: any) => apiClient.post('/projects', data),
  update: (id: string, data: any) => apiClient.put(`/projects/${id}`, data),
  delete: (id: string) => apiClient.delete(`/projects/${id}`),
}

export const organizationsAPI = {
  getAll: () => apiClient.get('/organizations'),
  create: (data: any) => apiClient.post('/organizations', data),
  update: (id: string, data: any) => apiClient.put(`/organizations/${id}`, data),
  delete: (id: string) => apiClient.delete(`/organizations/${id}`),
}

export const industriesAPI = {
  getAll: () => apiClient.get('/industries'),
  create: (data: any) => apiClient.post('/industries', data),
  update: (id: string, data: any) => apiClient.put(`/industries/${id}`, data),
  delete: (id: string) => apiClient.delete(`/industries/${id}`),
}

export const filesAPI = {
  getAll: () => apiClient.get('/files'),
  upload: (file: File) => apiClient.upload('/files/upload', file),
  delete: (id: string) => apiClient.delete(`/files/${id}`),
}

export const authAPI = {
  signup: (data: any) => apiClient.post('/auth/signup', data),
  verifySignup: (data: any) => apiClient.post('/auth/verify-signup', data),
  login: (data: any) => apiClient.post('/auth/login', data),
  verifyLogin: (data: any) => apiClient.post('/auth/verify-login', data),
  forgotPassword: (data: any) => apiClient.post('/auth/forgot-password', data),
  resetPassword: (data: any) => apiClient.post('/auth/reset-password', data),
  updateProfile: (data: any) => apiClient.put('/auth/profile', data),
  changePassword: (data: any) => apiClient.put('/auth/change-password', data),
  logout: () => apiClient.post('/auth/logout'),
  verify: () => apiClient.get('/auth/verify'),
}
