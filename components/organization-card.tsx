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
        className={`w-full p-3 sm:p-4 rounded-xl border-2 transition-all text-left ${
          isSelected
            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }`}
        style={{ borderTopColor: organization.color, borderTopWidth: '4px' }}
      >
        <div className="text-2xl mb-2">{organization.icon}</div>
        <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
          {organization.name}
        </div>
        <div className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
          {organization.projectCount} {organization.projectCount === 1 ? 'project' : 'projects'}
        </div>
      </button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 hover:text-red-600"
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </motion.div>
  )
}
