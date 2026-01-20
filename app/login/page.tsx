"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

export default function LoginPage() {
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { requestLoginOTP, login, user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Please enter your email",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    const result = await requestLoginOTP(email)

    if (result.success) {
      setStep('otp')
      toast({
        title: "OTP Sent",
        description: "Check your email for the 6-digit OTP code",
        duration: 5000
      })
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to send OTP. Please try again.",
        variant: "destructive"
      })
    }

    setIsLoading(false)
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!otp.trim() || otp.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter the 6-digit OTP",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    console.log('Attempting login with:', { email, otp: otp.substring(0, 2) + '****' })
    const result = await login(email, otp)
    console.log('Login result:', result)

    if (result.success) {
      toast({
        title: "Success",
        description: "Login successful. Redirecting...",
      })
    } else {
      console.error('Login failed:', result.error)
      toast({
        title: "Login Failed",
        description: result.error || "Invalid OTP. Please try again.",
        variant: "destructive"
      })
    }

    setIsLoading(false)
  }

  const handleResendOTP = async () => {
    setIsLoading(true)
    try {
      await requestLoginOTP(email)
      toast({
        title: "OTP Resent",
        description: "Check your email for a new OTP code",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend OTP",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div style={{borderRadius: '5px'}} className="bg-white border border-[#e5e5e5] p-8 shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#1a1a1a] mb-1">SaveIt.AI</h1>
            <p className="text-sm text-[#666666]">
              {step === 'email' ? 'Login Verification' : 'SaveIt.AI Authentication'}
            </p>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-[#1a1a1a] mb-2">
              {step === 'email' ? 'Welcome Back' : 'Enter OTP'}
            </h2>
            <p className="text-sm text-[#666666]">
              {step === 'email'
                ? 'Enter your email to receive an OTP'
                : `Enter the OTP sent to ${email}`}
            </p>
          </div>

          {step === 'email' && (
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#1a1a1a] mb-2">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending OTP...</span>
                  </div>
                ) : (
                  "Continue"
                )}
              </Button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div style={{borderRadius: '5px'}} className="bg-[#f5f5f5] border border-[#e5e5e5] p-4 mb-4">
                <p className="text-sm text-[#1a1a1a] text-center">
                  Check your email for the 6-digit OTP code
                </p>
              </div>

              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-[#1a1a1a] mb-2">
                  OTP Code
                </label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-lg tracking-widest h-12"
                  disabled={isLoading}
                  autoFocus
                  maxLength={6}
                />
              </div>

              <div style={{borderRadius: '5px'}} className="bg-[#f5f5f5] border border-[#e5e5e5] p-3">
                <p className="text-xs text-[#666666] text-center">
                  Valid for 10 minutes
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-11"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Verifying...</span>
                  </div>
                ) : (
                  "Verify & Login"
                )}
              </Button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setStep('email')
                    setOtp("")
                  }}
                  className="text-[#666666] hover:text-[#1a1a1a] transition-colors"
                  disabled={isLoading}
                >
                  Change Email
                </button>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  className="text-[#1a1a1a] hover:text-[#666666] transition-colors font-medium"
                  disabled={isLoading}
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e5e5e5]"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-[#666666]">or</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-[#666666]">
              Don't have an account?{' '}
              <Link href="/signup" className="text-[#1a1a1a] hover:text-[#666666] font-medium">
                Sign up
              </Link>
            </p>
          </div>

          {step === 'email' && (
            <div className="text-center mt-4">
              <Link
                href="/forgot-password"
                className="text-sm text-[#666666] hover:text-[#1a1a1a] transition-colors"
              >
                Forgot your password?
              </Link>
            </div>
          )}

          <div style={{borderRadius: '5px'}} className="mt-6 bg-[#f5f5f5] border border-[#e5e5e5] p-3">
            <p className="text-xs text-[#666666] text-center">
              Security Notice
            </p>
            <p className="text-xs text-[#666666] text-center mt-1">
              Never share this OTP with anyone. SaveIt.AI staff will never ask for your OTP.
            </p>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-[#666666]">
              This is an automated message from SaveIt.AI
            </p>
            <p className="text-xs text-[#666666] mt-1">
              Your personal knowledge management system
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
