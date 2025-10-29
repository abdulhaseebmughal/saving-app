"use client"

import { Search, FileText, Code, LinkIcon, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"

interface FilterBarProps {
  currentFilter: "all" | "note" | "link" | "code" | "component"
  onFilterChange: (filter: "all" | "note" | "link" | "code" | "component") => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function FilterBar({ currentFilter, onFilterChange, searchQuery, onSearchChange }: FilterBarProps) {
  const filters = [
    { id: "all" as const, label: "All", icon: Sparkles },
    { id: "note" as const, label: "Notes", icon: FileText },
    { id: "code" as const, label: "Code", icon: Code },
    { id: "link" as const, label: "Links", icon: LinkIcon },
  ]

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => {
            const Icon = filter.icon
            const isActive = currentFilter === filter.id
            return (
              <Button
                key={filter.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => onFilterChange(filter.id)}
                className="relative gap-2"
              >
                <Icon className="h-4 w-4" />
                {filter.label}
                {isActive && (
                  <motion.div
                    layoutId="filter-indicator"
                    className="absolute inset-0 rounded-md bg-primary"
                    style={{ zIndex: -1 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Button>
            )
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
    </div>
  )
}
