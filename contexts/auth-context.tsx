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
  login: (email: string, otp: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  verifySignup: (email: string, otp: string) => Promise<void>
  requestLoginOTP: (email: string) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<void>
  logout: () => void
  updateProfile: (name?: string, email?: string) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Load user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('saveit_token')
    const storedUser = localStorage.getItem('saveit_user')

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))

      // Verify token is still valid
      fetch(`${API_BASE_URL}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${storedToken}`
        }
      })
        .then(res => res.json())
        .then(result => {
          if (!result.success) {
            // Token invalid, clear storage
            localStorage.removeItem('saveit_token')
            localStorage.removeItem('saveit_user')
            setToken(null)
            setUser(null)
          }
        })
        .catch(() => {
          // Network error, keep using cached data
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  // Signup - Step 1: Create account and request OTP
  const signup = async (name: string, email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password })
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Signup failed')
    }

    return result
  }

  // Signup - Step 2: Verify OTP and complete signup
  const verifySignup = async (email: string, otp: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, otp })
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'OTP verification failed')
    }

    // Save token and user
    const { token: newToken, user: newUser } = result.data

    localStorage.setItem('saveit_token', newToken)
    localStorage.setItem('saveit_user', JSON.stringify(newUser))

    setToken(newToken)
    setUser(newUser)

    // Redirect to dashboard
    router.push('/')
  }

  // Login - Step 1: Request OTP
  const requestLoginOTP = async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Failed to send OTP')
    }

    return result
  }

  // Login - Step 2: Verify OTP and complete login
  const login = async (email: string, otp: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, otp })
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Login failed')
    }

    // Save token and user
    const { token: newToken, user: newUser } = result.data

    localStorage.setItem('saveit_token', newToken)
    localStorage.setItem('saveit_user', JSON.stringify(newUser))

    setToken(newToken)
    setUser(newUser)

    // Redirect to dashboard
    router.push('/')
  }

  // Forgot Password - Step 1: Request OTP
  const forgotPassword = async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Failed to send OTP')
    }

    return result
  }

  // Forgot Password - Step 2: Reset password with OTP
  const resetPassword = async (email: string, otp: string, newPassword: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, otp, newPassword })
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Password reset failed')
    }

    return result
  }

  // Update Profile
  const updateProfile = async (name?: string, email?: string) => {
    if (!token) throw new Error('Not authenticated')

    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, email })
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Profile update failed')
    }

    if (result.data?.user) {
      const updatedUser = result.data.user
      localStorage.setItem('saveit_user', JSON.stringify(updatedUser))
      setUser(updatedUser)
    }

    return result
  }

  // Change Password
  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!token) throw new Error('Not authenticated')

    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Password change failed')
    }

    return result
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
