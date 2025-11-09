"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Folder, FolderOpen, Trash2, Search, Grid3x3 } from "lucide-react"
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
        title: "Deleted",
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
      fetchOrganizations()
      toast({
        title: "Deleted",
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
          title: "Moved",
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

  const organizeGrid = () => {
    toast({
      title: "Organized",
      description: "Projects arranged"
    })
  }

  const PROJECT_TYPES = [
    { value: '', label: 'All', icon: '📦' },
    { value: 'vanilla', label: 'Vanilla', icon: '🟨' },
    { value: 'react', label: 'React', icon: '⚛️' },
    { value: 'nextjs', label: 'Next.js', icon: '▲' },
    { value: 'vue', label: 'Vue', icon: '💚' },
    { value: 'node', label: 'Node', icon: '🟢' },
    { value: 'python', label: 'Python', icon: '🐍' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Projects
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {organizations.length} organizations • {projects.length} projects
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowCreateOrganization(true)}
                variant="outline"
                className="h-9 px-3 text-sm"
              >
                <Folder className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">New Org</span>
              </Button>
              <Button
                onClick={() => setShowCreateProject(true)}
                className="h-9 px-3 text-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">New Project</span>
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {PROJECT_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setTypeFilter(type.value)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap border ${
                    typeFilter === type.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-input hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <span>{type.icon}</span>
                  <span className="hidden sm:inline">{type.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Organizations */}
        {organizations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Organizations
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              <button
                onClick={() => setSelectedOrganization(null)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedOrganization === null
                    ? 'border-primary bg-accent'
                    : 'border-border hover:border-muted-foreground'
                }`}
              >
                <div className="text-2xl mb-2">📦</div>
                <div className="text-sm font-medium text-foreground">All Projects</div>
                <div className="text-xs text-muted-foreground">{projects.length}</div>
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              {selectedOrganization
                ? organizations.find(o => o._id === selectedOrganization)?.name
                : 'All Projects'}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({filteredProjects.length})
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-sm text-muted-foreground">Loading projects...</p>
              </div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="flex items-center justify-center py-20 border-2 border-dashed border-border rounded-lg">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4 max-w-md px-4"
              >
                <div className="text-6xl">
                  {searchQuery ? "🔍" : "📁"}
                </div>
                <h2 className="text-xl font-bold text-foreground">
                  {searchQuery ? "No projects found" : "No projects yet"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? `No projects match "${searchQuery}"`
                    : "Create your first project to get started!"}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => setShowCreateProject(true)}
                    className="mt-4"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Project
                  </Button>
                )}
              </motion.div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
