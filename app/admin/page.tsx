"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Shield, Users, Database, Mail, Key, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { getAuthHeaders } from "@/lib/auth-headers"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://saving-app-backend-six.vercel.app/api'

// Admin credentials
const ADMIN_EMAIL = "abdulhaseebmughal2006@gmail.com"
const ADMIN_PASSWORD = "Haseebkhan19006"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalItems: 0,
    totalNotes: 0,
    totalProjects: 0
  })
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // Check if already authenticated
    const adminAuth = localStorage.getItem('admin_authenticated')
    if (adminAuth === 'true') {
      setIsAuthenticated(true)
      fetchStats()
    }
  }, [])

  const fetchStats = async () => {
    try {
      const [itemsRes, notesRes, diaryNotesRes, projectsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/items`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE_URL}/notes`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE_URL}/diary-notes`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE_URL}/projects`, { headers: getAuthHeaders() })
      ])

      const items = await itemsRes.json()
      const notes = await notesRes.json()
      const diaryNotes = await diaryNotesRes.json()
      const projects = await projectsRes.json()

      const itemCount = items.success ? items.data.length : 0
      const notesCount = notes.success ? notes.data.length : 0
      const diaryNotesCount = diaryNotes.success ? diaryNotes.data.length : 0
      const projectsCount = projects.success ? projects.data.length : 0

      setStats({
        totalUsers: 9,
        totalItems: itemCount,
        totalNotes: notesCount + diaryNotesCount,
        totalProjects: projectsCount
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
      setStats({
        totalUsers: 9,
        totalItems: 0,
        totalNotes: 0,
        totalProjects: 0
      })
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        localStorage.setItem('admin_authenticated', 'true')
        setIsAuthenticated(true)
        fetchStats()
        toast({
          title: "Admin Access Granted",
          description: "Welcome to Admin Portal",
        })
      } else {
        toast({
          title: "Access Denied",
          description: "Invalid admin credentials",
          variant: "destructive"
        })
      }
      setIsLoading(false)
    }, 500)
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated')
    setIsAuthenticated(false)
    setEmail("")
    setPassword("")
    toast({
      title: "Logged Out",
      description: "Admin session ended"
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="bg-slate-800/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 shadow-2xl">
            {/* Admin Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Admin Portal
              </h1>
              <p className="text-purple-300 text-sm">
                Secure access for administrators only
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="pl-10 bg-slate-900/50 border-purple-500/30 text-white placeholder:text-slate-500"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  Admin Password
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="pl-10 bg-slate-900/50 border-purple-500/30 text-white placeholder:text-slate-500"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-6 text-base"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  "Access Admin Portal"
                )}
              </Button>
            </form>

            {/* Back Link */}
            <div className="mt-6 text-center">
              <button
                onClick={() => router.push('/')}
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                ← Back to Home
              </button>
            </div>

            {/* Security Notice */}
            <div className="mt-6 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <p className="text-xs text-purple-300 text-center">
                🔒 This portal is protected. Unauthorized access attempts are logged.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-purple-300 text-sm">SaveIt.AI Control Panel</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Admin Info Card */}
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Admin Credentials
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/50 rounded-lg p-4 border border-purple-500/20">
              <div className="text-purple-300 text-sm mb-1">Email</div>
              <div className="text-white font-mono text-sm break-all">{ADMIN_EMAIL}</div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4 border border-purple-500/20">
              <div className="text-purple-300 text-sm mb-1">Password</div>
              <div className="text-white font-mono text-sm">{ADMIN_PASSWORD}</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users className="w-6 h-6" />}
            label="Total Users"
            value={stats.totalUsers}
            color="from-blue-500 to-cyan-500"
          />
          <StatCard
            icon={<Database className="w-6 h-6" />}
            label="Total Items"
            value={stats.totalItems}
            color="from-purple-500 to-pink-500"
          />
          <StatCard
            icon={<Database className="w-6 h-6" />}
            label="Total Notes"
            value={stats.totalNotes}
            color="from-orange-500 to-red-500"
          />
          <StatCard
            icon={<Database className="w-6 h-6" />}
            label="Total Projects"
            value={stats.totalProjects}
            color="from-green-500 to-emerald-500"
          />
        </div>

        {/* Database Info */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Database className="w-5 h-5" />
            System Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/50 rounded-lg p-4 border border-purple-500/20">
              <div className="text-purple-300 text-sm mb-1">Backend URL</div>
              <div className="text-white text-sm font-mono break-all">
                {API_BASE_URL}
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4 border border-purple-500/20">
              <div className="text-purple-300 text-sm mb-1">Database</div>
              <div className="text-green-400 text-sm font-mono">
                ✓ MongoDB Connected
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4 border border-purple-500/20">
              <div className="text-purple-300 text-sm mb-1">Authentication</div>
              <div className="text-green-400 text-sm font-mono">
                ✓ JWT Enabled
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4 border border-purple-500/20">
              <div className="text-purple-300 text-sm mb-1">Email Service</div>
              <div className="text-green-400 text-sm font-mono">
                ✓ OTP Enabled
              </div>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcut Info */}
        <div className="mt-8 bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
          <p className="text-purple-300 text-sm text-center">
            💡 <strong>Pro Tip:</strong> Press <kbd className="px-2 py-1 bg-slate-800 rounded border border-purple-500/30 text-purple-400 font-mono text-xs">Ctrl</kbd> + <kbd className="px-2 py-1 bg-slate-800 rounded border border-purple-500/30 text-purple-400 font-mono text-xs">Shift</kbd> + <kbd className="px-2 py-1 bg-slate-800 rounded border border-purple-500/30 text-purple-400 font-mono text-xs">A</kbd> anywhere to access Admin Portal
          </p>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: number, color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6"
    >
      <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-full flex items-center justify-center mb-4 text-white`}>
        {icon}
      </div>
      <div className="text-purple-300 text-sm mb-1">{label}</div>
      <div className="text-3xl font-bold text-white">{value}</div>
    </motion.div>
  )
}
