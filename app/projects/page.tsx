"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Folder, FolderOpen, Trash2, Edit2, Move, Search, Filter, Grid3x3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { AnimatePresence, motion } from "framer-motion"
import { ProjectCard } from "@/components/project-card"
import { OrganizationCard } from "@/components/organization-card"
import { CreateProjectDialog } from "@/components/create-project-dialog"
import { CreateOrganizationDialog } from "@/components/create-organization-dialog"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://saving-app-backend-six.vercel.app/api'

interface Organization {
  _id: string
  name: string
  description: string
  color: string
  icon: string
  projectCount: number
  position: number
}

interface Project {
  _id: string
  name: string
  description: string
  type: string
  organization?: {
    _id: string
    name: string
    color: string
    icon: string
  }
  url: string
  repository: string
  tags: string[]
  color: string
  icon: string
  status: string
  priority: string
  position: { x: number; y: number }
  lastAccessed: string
  createdAt: string
}

export default function ProjectsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [selectedOrganization, setSelectedOrganization] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [showCreateOrganization, setShowCreateOrganization] = useState(false)
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<string>("")
  const { toast } = useToast()

  const fetchOrganizations = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/organizations`)
      const result = await response.json()
      if (result.success) {
        setOrganizations(result.data)
      }
    } catch (error) {
      console.error('Error fetching organizations:', error)
    }
  }, [])

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    try {
      let url = `${API_BASE_URL}/projects`
      const params = new URLSearchParams()

      if (selectedOrganization) {
        params.append('organization', selectedOrganization)
      }
      if (typeFilter) {
        params.append('type', typeFilter)
      }

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await fetch(url)
      const result = await response.json()
      if (result.success) {
        setProjects(result.data)
        setFilteredProjects(result.data)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [selectedOrganization, typeFilter, toast])

  useEffect(() => {
    fetchOrganizations()
  }, [fetchOrganizations])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProjects(projects)
    } else {
      const filtered = projects.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      setFilteredProjects(filtered)
    }
  }, [searchQuery, projects])

  const handleDeleteOrganization = async (id: string) => {
    if (!window.confirm('Delete this organization? Projects will remain but be unorganized.')) return

    try {
      const response = await fetch(`${API_BASE_URL}/organizations/${id}`, {
        method: 'DELETE'
      })
      const result = await response.json()

      if (!result.success) {
        toast({
          title: "Error",
          description: result.error || "Failed to delete organization",
          variant: "destructive"
        })
        return
      }

      setOrganizations(organizations.filter(org => org._id !== id))
      if (selectedOrganization === id) {
        setSelectedOrganization(null)
      }
      fetchProjects()
      toast({
        title: "✅ Deleted",
        description: "Organization removed"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete organization",
        variant: "destructive"
      })
    }
  }

  const handleDeleteProject = async (id: string) => {
    try {
      await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: 'DELETE'
      })
      setProjects(projects.filter(p => p._id !== id))
      fetchOrganizations() // Update counts
      toast({
        title: "🗑️ Deleted",
        description: "Project removed"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive"
      })
    }
  }

  const handleMoveProject = async (projectId: string, organizationId: string | null) => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId })
      })
      const result = await response.json()

      if (result.success) {
        fetchProjects()
        fetchOrganizations()
        toast({
          title: "✅ Moved",
          description: "Project moved successfully"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move project",
        variant: "destructive"
      })
    }
  }

  const PROJECT_TYPES = [
    { value: '', label: 'All Types', icon: '📦' },
    { value: 'vanilla', label: 'Vanilla JS', icon: '🟨' },
    { value: 'react', label: 'React', icon: '⚛️' },
    { value: 'nextjs', label: 'Next.js', icon: '▲' },
    { value: 'vue', label: 'Vue', icon: '💚' },
    { value: 'angular', label: 'Angular', icon: '🅰️' },
    { value: 'node', label: 'Node.js', icon: '🟢' },
    { value: 'python', label: 'Python', icon: '🐍' },
    { value: 'other', label: 'Other', icon: '📁' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
                <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white">
                  Project Manager
                </h1>
                <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                  {organizations.length} organizations • {projects.length} projects
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <Button
                onClick={() => setShowCreateOrganization(true)}
                variant="outline"
                className="h-8 sm:h-9 px-2.5 sm:px-3 text-xs sm:text-sm active:scale-95"
              >
                <Folder className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1.5" />
                <span className="hidden sm:inline">New Org</span>
              </Button>
              <Button
                onClick={() => setShowCreateProject(true)}
                className="h-8 sm:h-9 px-2.5 sm:px-3 text-xs sm:text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1.5" />
                <span className="hidden sm:inline">New Project</span>
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mt-3 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-white/50 dark:bg-gray-800/50"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {PROJECT_TYPES.slice(0, 5).map((type) => (
                <button
                  key={type.value}
                  onClick={() => setTypeFilter(type.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    typeFilter === type.value
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span>{type.icon}</span>
                  <span className="hidden sm:inline">{type.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {/* Organizations */}
        {organizations.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Organizations
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
              <button
                onClick={() => setSelectedOrganization(null)}
                className={`p-3 sm:p-4 rounded-xl border-2 transition-all ${
                  selectedOrganization === null
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="text-2xl mb-2">📦</div>
                <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">All Projects</div>
                <div className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">{projects.length}</div>
              </button>

              <AnimatePresence>
                {organizations.map((org) => (
                  <OrganizationCard
                    key={org._id}
                    organization={org}
                    isSelected={selectedOrganization === org._id}
                    onSelect={() => setSelectedOrganization(org._id)}
                    onDelete={() => handleDeleteOrganization(org._id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Projects */}
        <div>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
              {selectedOrganization
                ? organizations.find(o => o._id === selectedOrganization)?.name
                : 'All Projects'}
              <span className="ml-2 text-xs sm:text-sm font-normal text-gray-600 dark:text-gray-400">
                ({filteredProjects.length})
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12 sm:py-20">
              <div className="text-center space-y-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Loading projects...</p>
              </div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="flex items-center justify-center py-12 sm:py-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-3 sm:space-y-4 max-w-md"
              >
                <div className="text-5xl sm:text-6xl md:text-7xl">
                  {searchQuery ? "🔍" : "📁"}
                </div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  {searchQuery ? "No projects found" : "No projects yet"}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {searchQuery
                    ? `No projects match "${searchQuery}"`
                    : "Create your first project to get started!"}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => setShowCreateProject(true)}
                    className="mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Project
                  </Button>
                )}
              </motion.div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <AnimatePresence>
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project._id}
                    project={project}
                    organizations={organizations}
                    onDelete={() => handleDeleteProject(project._id)}
                    onMove={handleMoveProject}
                    onUpdate={fetchProjects}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <CreateProjectDialog
        open={showCreateProject}
        onClose={() => setShowCreateProject(false)}
        organizations={organizations}
        onSuccess={() => {
          fetchProjects()
          fetchOrganizations()
        }}
      />

      <CreateOrganizationDialog
        open={showCreateOrganization}
        onClose={() => setShowCreateOrganization(false)}
        onSuccess={fetchOrganizations}
      />
    </div>
  )
}
