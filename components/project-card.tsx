"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ExternalLink, Trash2, Move, MoreVertical, Github, Globe, Square, Circle, Triangle, Layers, Hexagon, Code, Cpu, FolderOpen, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

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
  lastAccessed: string
  createdAt: string
}

interface ProjectCardProps {
  project: Project
  organizations: any[]
  onDelete: () => void
  onMove: (projectId: string, organizationId: string | null) => void
  onUpdate: () => void
}

const TYPE_ICONS: Record<string, any> = {
  vanilla: Square,
  react: Circle,
  nextjs: Triangle,
  vue: Layers,
  angular: Hexagon,
  node: Code,
  python: Cpu,
  other: FolderOpen,
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  archived: 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400',
  planning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
}

export function ProjectCard({ project, organizations, onDelete, onMove, onUpdate }: ProjectCardProps) {
  const [showMoveMenu, setShowMoveMenu] = useState(false)

  const TypeIcon = TYPE_ICONS[project.type] || FolderOpen

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group"
    >
      <div className="h-full p-5 rounded-lg border border-border bg-card hover:border-muted-foreground transition-all hover:shadow-md">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <TypeIcon className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base text-foreground truncate">
                {project.name}
              </h3>
              {project.organization && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs">{project.organization.icon}</span>
                  <span className="text-xs text-muted-foreground truncate">
                    {project.organization.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setShowMoveMenu(true)}>
                <Move className="w-4 h-4 mr-2" />
                Move to...
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {project.description}
          </p>
        )}

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {project.tags.slice(0, 3).map((tag, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="text-xs px-2 py-0"
              >
                {tag}
              </Badge>
            ))}
            {project.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs px-2 py-0">
                +{project.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-1.5">
            <Badge className={`text-xs px-2 py-0.5 ${STATUS_COLORS[project.status]}`}>
              {project.status}
            </Badge>
            <Badge variant="outline" className="text-xs px-2 py-0.5">
              {project.type}
            </Badge>
          </div>

          <div className="flex items-center gap-1">
            {project.repository && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                asChild
              >
                <a href={project.repository} target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4" />
                </a>
              </Button>
            )}
            {project.url && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                asChild
              >
                <a href={project.url} target="_blank" rel="noopener noreferrer">
                  <Globe className="w-4 h-4" />
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Move Menu */}
        {showMoveMenu && (
          <div className="absolute inset-0 bg-background rounded-lg p-4 z-10 border-2 border-primary shadow-xl">
            <div className="mb-3">
              <h4 className="font-semibold text-sm mb-2">Move to organization:</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    onMove(project._id, null)
                    setShowMoveMenu(false)
                  }}
                >
                  <Package className="w-4 h-4 mr-2" />
                  No Organization
                </Button>
                {organizations.map((org) => (
                  <Button
                    key={org._id}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      onMove(project._id, org._id)
                      setShowMoveMenu(false)
                    }}
                  >
                    <span className="mr-2">{org.icon}</span>
                    {org.name}
                  </Button>
                ))}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => setShowMoveMenu(false)}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
