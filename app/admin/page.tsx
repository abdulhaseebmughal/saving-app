"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, Users, Database, Mail, Key, LogOut, Trash2, RefreshCw, FileText, StickyNote, Folder, Upload, Building2, Factory } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import Loader from "@/components/loader"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://saving-app-backend-six.vercel.app/api'

const ADMIN_EMAIL = "abdulhaseebmughal2006@gmail.com"
const ADMIN_PASSWORD = "Haseebkhan19006"

interface DatabaseData {
  users: any[]
  items: any[]
  notes: any[]
  diaryNotes: any[]
  projects: any[]
  files: any[]
  organizations: any[]
  industries: any[]
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingData, setIsFetchingData] = useState(false)
  const [activeTab, setActiveTab] = useState("users")
  const [data, setData] = useState<DatabaseData>({
    users: [],
    items: [],
    notes: [],
    diaryNotes: [],
    projects: [],
    files: [],
    organizations: [],
    industries: []
  })
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalItems: 0,
    totalNotes: 0,
    totalDiaryNotes: 0,
    totalProjects: 0,
    totalFiles: 0,
    totalOrganizations: 0,
    totalIndustries: 0,
    adminItems: 0,
    adminNotes: 0,
    adminDiaryNotes: 0,
    adminProjects: 0,
    adminFiles: 0,
    adminOrganizations: 0,
    adminIndustries: 0
  })
  const [adminData, setAdminData] = useState<DatabaseData | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const adminAuth = localStorage.getItem('admin_authenticated')
    if (adminAuth === 'true') {
      setIsAuthenticated(true)
      fetchDashboardData()
    }
  }, [])

  const fetchDashboardData = async () => {
    setIsFetchingData(true)
    try {
      const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
        headers: {
          'Content-Type': 'application/json',
          'email': ADMIN_EMAIL,
          'password': ADMIN_PASSWORD
        }
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      const result = await response.json()
      console.log('Dashboard result:', result)

      if (response.status === 401) {
        console.error('Authentication failed:', result)
        toast({
          title: "Authentication Failed",
          description: result.error || "Invalid admin credentials",
          variant: "destructive"
        })
        localStorage.removeItem('admin_authenticated')
        setIsAuthenticated(false)
        return
      }

      if (result.success) {
        console.log('Setting data:', {
          users: result.data.users?.length,
          items: result.data.items?.length,
          notes: result.data.notes?.length,
          diaryNotes: result.data.diaryNotes?.length,
          projects: result.data.projects?.length,
          files: result.data.files?.length,
          organizations: result.data.organizations?.length,
          industries: result.data.industries?.length
        })
        setData(result.data)
        setStats(result.stats)
        setAdminData(result.adminData)

        toast({
          title: "Success",
          description: `Loaded ${result.stats.totalUsers} users and ${result.stats.totalItems} items`,
        })
      } else {
        console.error('API returned error:', result)
        toast({
          title: "Error",
          description: result.error || "Failed to load dashboard data",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      })
    } finally {
      setIsFetchingData(false)
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        localStorage.setItem('admin_authenticated', 'true')
        setIsAuthenticated(true)
        fetchDashboardData()
        toast({
          title: "Success",
          description: "Logged in as Admin"
        })
      } else {
        toast({
          title: "Error",
          description: "Invalid credentials",
          variant: "destructive"
        })
      }
      setIsLoading(false)
    }, 1000)
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated')
    setIsAuthenticated(false)
    setEmail("")
    setPassword("")
  }

  const handleDelete = async (collection: string, id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const response = await fetch(`${API_BASE_URL}/admin/${collection}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'email': ADMIN_EMAIL,
          'password': ADMIN_PASSWORD
        }
      })

      const result = await response.json()
      if (result.success) {
        toast({
          title: "Success",
          description: "Item deleted successfully"
        })
        fetchDashboardData()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete item",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive"
      })
    }
  }

  const tabs = [
    { id: 'users', label: 'Users', icon: Users, count: stats.totalUsers },
    { id: 'items', label: 'Saved Links', icon: FileText, count: stats.totalItems },
    { id: 'notes', label: 'Sticky Notes', icon: StickyNote, count: stats.totalNotes },
    { id: 'diary-notes', label: 'Diary Notes', icon: StickyNote, count: stats.totalDiaryNotes },
    { id: 'projects', label: 'Projects', icon: Folder, count: stats.totalProjects },
    { id: 'files', label: 'Files', icon: Upload, count: stats.totalFiles },
    { id: 'organizations', label: 'Organizations', icon: Building2, count: stats.totalOrganizations },
    { id: 'industries', label: 'Industries', icon: Factory, count: stats.totalIndustries }
  ]

  const renderTable = (collection: string) => {
    const items = data[collection as keyof DatabaseData] || []

    if (items.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          No data available
        </div>
      )
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {Object.keys(items[0] || {}).slice(0, 6).map((key) => (
                <th key={key} className="text-left p-3 font-semibold text-sm">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </th>
              ))}
              <th className="text-right p-3 font-semibold text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any, index: number) => (
              <motion.tr
                key={item._id || index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="border-b border-border hover:bg-accent/50 transition-colors"
              >
                {Object.entries(item).slice(0, 6).map(([key, value]: [string, any]) => (
                  <td key={key} className="p-3 text-sm">
                    {typeof value === 'object' && value !== null
                      ? value.name || value.email || JSON.stringify(value).slice(0, 30) + '...'
                      : String(value).slice(0, 50)}
                  </td>
                ))}
                <td className="p-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleDelete(collection, item._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-purple-950/20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md p-8"
        >
          <div className="bg-card border border-border rounded-lg shadow-2xl p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-center mb-2">Admin Portal</h1>
            <p className="text-sm text-muted-foreground text-center mb-8">
              Full database access and management
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@saveit.ai"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Password</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                disabled={isLoading}
              >
                {isLoading ? "Authenticating..." : "Access Admin Portal"}
              </Button>
            </form>

            <div className="mt-6 text-xs text-center text-muted-foreground">
              Authorized personnel only
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <>
      {isFetchingData && <Loader />}
      <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">Database Management</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDashboardData}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Admin Personal Stats */}
        {adminData && (
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Your Personal Data
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-500">{stats.adminItems}</div>
                <div className="text-xs text-muted-foreground">Saved Links</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-lg p-3">
                <div className="text-2xl font-bold text-purple-500">{stats.adminNotes}</div>
                <div className="text-xs text-muted-foreground">Sticky Notes</div>
              </div>
              <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/10 border border-pink-500/20 rounded-lg p-3">
                <div className="text-2xl font-bold text-pink-500">{stats.adminDiaryNotes}</div>
                <div className="text-xs text-muted-foreground">Diary Notes</div>
              </div>
              <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-500">{stats.adminProjects}</div>
                <div className="text-xs text-muted-foreground">Projects</div>
              </div>
              <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-lg p-3">
                <div className="text-2xl font-bold text-orange-500">{stats.adminFiles}</div>
                <div className="text-xs text-muted-foreground">Files</div>
              </div>
              <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border border-cyan-500/20 rounded-lg p-3">
                <div className="text-2xl font-bold text-cyan-500">{stats.adminOrganizations}</div>
                <div className="text-xs text-muted-foreground">Organizations</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-lg p-3">
                <div className="text-2xl font-bold text-yellow-500">{stats.adminIndustries}</div>
                <div className="text-xs text-muted-foreground">Industries</div>
              </div>
            </div>
          </div>
        )}

        {/* All Users Stats */}
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          All Users Database
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {tabs.map((tab) => (
            <motion.div
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              className="bg-card border border-border rounded-lg p-4 cursor-pointer"
              onClick={() => setActiveTab(tab.id)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-br from-primary to-purple-600 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <tab.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{tab.count}</div>
                  <div className="text-xs text-muted-foreground">{tab.label}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className={activeTab === tab.id ? "bg-gradient-to-r from-primary to-purple-600" : ""}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label} ({tab.count})
            </Button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {renderTable(activeTab)}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
    </>
  )
}
