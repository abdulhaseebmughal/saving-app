"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Sparkles, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

export default function LoginPage() {
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login, user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      router.push('/')
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password.trim()) {
      toast({
        title: "Error",
        description: "Please enter password",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      await login("user", password)
      toast({
        title: "Welcome!",
        description: "Successfully logged in"
      })
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid password",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-7 w-7 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">SaveIt.AI</h1>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Welcome Back</h2>
            <p className="text-sm text-muted-foreground">
              Enter your password to access your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  autoFocus
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Logging in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              SaveIt.AI - Your personal knowledge management system
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
