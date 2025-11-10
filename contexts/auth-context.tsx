"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  username: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://saving-app-backend-six.vercel.app/api'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem('saveit_token')
    const storedUser = localStorage.getItem('saveit_user')

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Login failed')
      }

      // Handle email confirmation flow
      if (result.data.awaitingConfirmation) {
        const tempToken = result.data.tempToken

        // Poll for confirmation every 3 seconds
        const pollInterval = setInterval(async () => {
          try {
            const checkResponse = await fetch(`${API_BASE_URL}/auth/check-confirmation`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ tempToken })
            })

            const checkResult = await checkResponse.json()

            if (checkResult.confirmed && checkResult.data) {
              clearInterval(pollInterval)

              const { token: finalToken, user: newUser } = checkResult.data

              // Store token and user
              localStorage.setItem('saveit_token', finalToken)
              localStorage.setItem('saveit_user', JSON.stringify(newUser))

              setToken(finalToken)
              setUser(newUser)

              // Redirect to dashboard
              router.push('/')
            } else if (checkResult.expired) {
              clearInterval(pollInterval)
              throw new Error('Login confirmation expired. Please try again.')
            }
          } catch (pollError) {
            clearInterval(pollInterval)
            console.error('Confirmation poll error:', pollError)
          }
        }, 3000)

        // Stop polling after 10 minutes
        setTimeout(() => clearInterval(pollInterval), 10 * 60 * 1000)

        return
      }

      // Direct login (if email confirmation disabled)
      const { token: newToken, user: newUser } = result.data

      // Store token and user
      localStorage.setItem('saveit_token', newToken)
      localStorage.setItem('saveit_user', JSON.stringify(newUser))

      setToken(newToken)
      setUser(newUser)

      // Redirect to dashboard
      router.push('/')
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('saveit_token')
    localStorage.removeItem('saveit_user')
    setToken(null)
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
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
