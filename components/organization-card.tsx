"use client"

import { motion } from "framer-motion"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Organization {
  _id: string
  name: string
  description: string
  color: string
  icon: string
  projectCount: number
}

interface OrganizationCardProps {
  organization: Organization
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
}

export function OrganizationCard({ organization, isSelected, onSelect, onDelete }: OrganizationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative"
    >
      <button
        onClick={onSelect}
        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
          isSelected
            ? 'border-primary bg-accent'
            : 'border-border hover:border-muted-foreground'
        }`}
      >
        <div className="text-2xl mb-2">{organization.icon}</div>
        <div className="text-sm font-medium text-foreground truncate">
          {organization.name}
        </div>
        <div className="text-xs text-muted-foreground">
          {organization.projectCount} {organization.projectCount === 1 ? 'project' : 'projects'}
        </div>
      </button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </motion.div>
  )
}
