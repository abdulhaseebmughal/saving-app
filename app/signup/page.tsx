"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

export default function SignupPage() {
  const [step, setStep] = useState<'details' | 'otp'>('details')
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { signup, verifySignup, user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name",
        variant: "destructive"
      })
      return
    }

    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Please enter your email",
        variant: "destructive"
      })
      return
    }

    if (!password.trim() || password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      await signup(name, email, password)
      setStep('otp')
      toast({
        title: "OTP Sent",
        description: "Check your email for the 6-digit OTP code",
        duration: 5000
      })
    } catch (error: any) {
      console.error('Signup error:', error)
      toast({
        title: "Error",
        description: error.message || "Signup failed. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
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

    try {
      await verifySignup(email, otp)
      toast({
        title: "Success",
        description: "Account created successfully. Redirecting...",
      })
    } catch (error: any) {
      console.error('OTP verification error:', error)
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid OTP. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setIsLoading(true)
    try {
      await signup(name, email, password)
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
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] grid place-items-center p-4 sm:p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[90%] sm:max-w-[26rem] my-auto"
      >
        <div className="bg-[#111111] border border-[#222222] rounded-2xl p-5 sm:p-7">
          <div className="flex items-center justify-center gap-2.5 mb-6">
            <img src="/sav-icon.png" alt="SaveIt.AI" className="w-8 h-8 rounded-lg" />
            <h1 className="text-xl font-semibold text-white">SaveIt.AI</h1>
          </div>

          <div className="text-center mb-5">
            <h2 className="text-lg font-medium text-white mb-1">
              {step === 'details' ? 'Create Account' : 'Verify Email'}
            </h2>
            <p className="text-sm text-gray-400">
              {step === 'details' ? 'Sign up to start saving' : `Code sent to ${email}`}
            </p>
          </div>

          {step === 'details' && (
            <form onSubmit={handleSignup} className="space-y-3.5">
              <div>
                <label htmlFor="name" className="block text-xs font-medium text-gray-400 mb-1.5">Name</label>
                <Input id="name" type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)}
                  className="h-10 bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-gray-500 focus:border-[#3a3a3a] focus:ring-0" disabled={isLoading} autoFocus />
              </div>
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="h-10 bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-gray-500 focus:border-[#3a3a3a] focus:ring-0" disabled={isLoading} />
              </div>
              <div>
                <label htmlFor="password" className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
                <Input id="password" type="password" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="h-10 bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-gray-500 focus:border-[#3a3a3a] focus:ring-0" disabled={isLoading} />
              </div>
              <Button type="submit" className="w-full h-10 bg-white hover:bg-gray-100 text-black font-medium flex items-center justify-center gap-2 mt-1" disabled={isLoading}>
                {isLoading ? (<><div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />Creating...</>) : (<>Sign Up <span>→</span></>)}
              </Button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-xs font-medium text-gray-400 mb-1.5">OTP Code</label>
                <Input id="otp" type="text" placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-lg tracking-[0.3em] h-11 bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-gray-600 focus:border-[#3a3a3a] focus:ring-0" disabled={isLoading} autoFocus maxLength={6} />
                <p className="text-xs text-gray-500 text-center mt-1.5">Valid for 10 minutes</p>
              </div>
              <Button type="submit" className="w-full h-10 bg-white hover:bg-gray-100 text-black font-medium" disabled={isLoading || otp.length !== 6}>
                {isLoading ? (<><div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />Verifying...</>) : "Create Account"}
              </Button>
              <div className="flex justify-between text-xs">
                <button type="button" onClick={() => setStep('details')} className="text-gray-500 hover:text-white" disabled={isLoading}>Back</button>
                <button type="button" onClick={handleResendOTP} className="text-gray-300 hover:text-white font-medium" disabled={isLoading}>Resend</button>
              </div>
            </form>
          )}

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#222]" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-[#111111] px-2 text-gray-600">or</span></div>
          </div>

          <p className="text-center text-sm text-gray-400">
            Have an account? <Link href="/login" className="text-white hover:text-gray-300">Login</Link>
          </p>

          <p className="text-center text-xs text-gray-600 mt-6">SaveIt.AI · Your knowledge system</p>
        </div>
      </motion.div>
    </div>
  )
}
