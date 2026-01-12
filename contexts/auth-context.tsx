"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://saving-app-backend-six.vercel.app/api'

interface User {
  id: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  verifySignup: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>
  requestLoginOTP: (email: string) => Promise<{ success: boolean; error?: string }>
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateProfile: (name?: string, email?: string) => Promise<{ success: boolean; error?: string }>
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Load user from localStorage on mount
  useEffect(() => {
    console.log('🔄 Loading user from localStorage...')
    const storedToken = localStorage.getItem('saveit_token')
    const storedUser = localStorage.getItem('saveit_user')

    console.log('📦 Found in storage:', {
      hasToken: !!storedToken,
      hasUser: !!storedUser,
      tokenPreview: storedToken?.substring(0, 20) + '...'
    })

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        console.log('✅ Setting user from storage:', parsedUser.email)

        // Ensure cookie is also set (in case it was cleared)
        document.cookie = `auth_token=${storedToken}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`

        setToken(storedToken)
        setUser(parsedUser)
        setLoading(false)

        // Verify token in background (don't block, don't clear on failure)
        fetch(`${API_BASE_URL}/auth/verify`, {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        })
          .then(res => res.json())
          .then(result => {
            console.log('🔐 Token verification result:', result.success)
            if (!result.success) {
              console.warn('⚠️ Token verification failed, but keeping user logged in')
              // Don't clear - let them stay logged in, backend will handle auth errors
            }
          })
          .catch((error) => {
            console.warn('⚠️ Token verification network error, keeping user logged in', error)
          })
      } catch (error) {
        console.error('❌ Error parsing stored user:', error)
        localStorage.removeItem('saveit_token')
        localStorage.removeItem('saveit_user')
        setLoading(false)
      }
    } else {
      console.log('ℹ️ No stored credentials found')
      setLoading(false)
    }
  }, [])

  // Signup - Step 1: Create account and request OTP
  const signup = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        return { success: false, error: result.error || 'Signup failed' }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Network error. Please check your connection.' }
    }
  }

  // Signup - Step 2: Verify OTP and complete signup
  const verifySignup = async (email: string, otp: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, otp })
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        return { success: false, error: result.error || 'Invalid OTP' }
      }

      // Save token and user
      const { token: newToken, user: newUser } = result.data

      if (!newToken || !newUser) {
        return { success: false, error: 'Invalid response from server' }
      }

      localStorage.setItem('saveit_token', newToken)
      localStorage.setItem('saveit_user', JSON.stringify(newUser))

      // Also set as cookie for middleware (30 days expiry)
      document.cookie = `auth_token=${newToken}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`

      setToken(newToken)
      setUser(newUser)

      // Redirect to dashboard - force hard redirect
      window.location.href = '/'
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Network error. Please check your connection.' }
    }
  }

  // Login - Step 1: Request OTP
  const requestLoginOTP = async (email: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        return { success: false, error: result.error || 'Failed to send OTP' }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Network error. Please check your connection.' }
    }
  }

  // Login - Step 2: Verify OTP (already updated)
  const login = async (email: string, otp: string) => {
    try {
      console.log('🔐 Calling verify-login API:', `${API_BASE_URL}/auth/verify-login`)
      console.log('📧 Email:', email)
      console.log('🔢 OTP length:', otp.length)

      const response = await fetch(`${API_BASE_URL}/auth/verify-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, otp })
      })

      console.log('📡 Response status:', response.status, response.statusText)
      const result = await response.json()
      console.log('📦 Response data:', {
        success: result.success,
        hasData: !!result.data,
        hasToken: !!result.data?.token,
        hasUser: !!result.data?.user,
        error: result.error
      })

      if (!response.ok || !result.success) {
        console.error('❌ Login failed:', result.error || 'Unknown error')
        return { success: false, error: result.error || 'Invalid OTP' }
      }

      // Save token and user
      const { token: newToken, user: newUser } = result.data || {}

      if (!newToken || !newUser) {
        console.error('❌ Missing token or user in response')
        return { success: false, error: 'Invalid response from server' }
      }

      console.log('✅ Login successful! Saving credentials...')
      localStorage.setItem('saveit_token', newToken)
      localStorage.setItem('saveit_user', JSON.stringify(newUser))

      // Also set as cookie for middleware (30 days expiry)
      document.cookie = `auth_token=${newToken}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`

      setToken(newToken)
      setUser(newUser)

      console.log('🚀 Redirecting to dashboard...')
      // Force a hard redirect to ensure AuthGuard sees the new user state
      window.location.href = '/'
      return { success: true }
    } catch (error) {
      console.error('🚨 Network error during login:', error)
      return { success: false, error: 'Network error. Please check your connection.' }
    }
  }

  // Forgot Password - Step 1: Request OTP
  const forgotPassword = async (email: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        return { success: false, error: result.error || 'Failed to send OTP' }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Network error. Please check your connection.' }
    }
  }

  // Forgot Password - Step 2: Reset password with OTP
  const resetPassword = async (email: string, otp: string, newPassword: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, otp, newPassword })
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        return { success: false, error: result.error || 'Password reset failed' }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Network error. Please check your connection.' }
    }
  }

  // Update Profile
  const updateProfile = async (name?: string, email?: string) => {
    try {
      if (!token) {
        return { success: false, error: 'Not authenticated' }
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, email })
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        return { success: false, error: result.error || 'Profile update failed' }
      }

      if (result.data?.user) {
        const updatedUser = result.data.user
        localStorage.setItem('saveit_user', JSON.stringify(updatedUser))
        setUser(updatedUser)
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Network error. Please check your connection.' }
    }
  }

  // Change Password
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      if (!token) {
        return { success: false, error: 'Not authenticated' }
      }

      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        return { success: false, error: result.error || 'Password change failed' }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Network error. Please check your connection.' }
    }
  }

  // Logout
  const logout = () => {
    if (token) {
      // Call logout endpoint (optional, for tracking)
      fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).catch(() => {})
    }

    localStorage.removeItem('saveit_token')
    localStorage.removeItem('saveit_user')

    // Clear auth cookie
    document.cookie = 'auth_token=; path=/; max-age=0'

    setToken(null)
    setUser(null)
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        verifySignup,
        requestLoginOTP,
        forgotPassword,
        resetPassword,
        logout,
        updateProfile,
        changePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
