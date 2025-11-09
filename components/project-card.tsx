"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ExternalLink, Trash2, Edit2, Move, MoreVertical, Github, Globe } from "lucide-react"
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

const TYPE_ICONS: Record<string, string> = {
  vanilla: '🟨',
  react: '⚛️',
  nextjs: '▲',
  vue: '💚',
  angular: '🅰️',
  node: '🟢',
  python: '🐍',
  other: '📁',
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  archived: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  planning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
}

export function ProjectCard({ project, organizations, onDelete, onMove, onUpdate }: ProjectCardProps) {
  const [showMoveMenu, setShowMoveMenu] = useState(false)

  const typeIcon = TYPE_ICONS[project.type] || '📁'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group"
    >
      <div
        className="h-full p-4 sm:p-5 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all hover:shadow-lg"
        style={{ borderTopColor: project.color, borderTopWidth: '4px' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-2xl flex-shrink-0">{project.icon || typeIcon}</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                {project.name}
              </h3>
              {project.organization && (
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-xs">{project.organization.icon}</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
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
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => setShowMoveMenu(true)}
              >
                <Move className="w-4 h-4 mr-2" />
                Move to...
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="text-red-600 dark:text-red-400"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
            {project.description}
          </p>
        )}

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {project.tags.slice(0, 3).map((tag, i) => (
              <Badge
                key={i}
                variant="outline"
                className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0"
              >
                {tag}
              </Badge>
            ))}
            {project.tags.length > 3 && (
              <Badge
                variant="outline"
                className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0"
              >
                +{project.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-1.5">
            <Badge className={`text-[10px] px-1.5 py-0 ${STATUS_COLORS[project.status]}`}>
              {project.status}
            </Badge>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {project.type}
            </Badge>
          </div>

          <div className="flex items-center gap-1">
            {project.repository && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                asChild
              >
                <a href={project.repository} target="_blank" rel="noopener noreferrer">
                  <Github className="w-3.5 h-3.5" />
                </a>
              </Button>
            )}
            {project.url && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                asChild
              >
                <a href={project.url} target="_blank" rel="noopener noreferrer">
                  <Globe className="w-3.5 h-3.5" />
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Move Menu */}
        {showMoveMenu && (
          <div className="absolute inset-0 bg-white dark:bg-gray-900 rounded-xl p-4 z-10 border-2 border-indigo-500">
            <div className="mb-3">
              <h4 className="font-semibold text-sm mb-2">Move to organization:</h4>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start mb-2"
                onClick={() => {
                  onMove(project._id, null)
                  setShowMoveMenu(false)
                }}
              >
                <span className="mr-2">📦</span>
                No Organization
              </Button>
              {organizations.map((org) => (
                <Button
                  key={org._id}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start mb-2"
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
