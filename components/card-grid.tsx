"use client"

import { motion, AnimatePresence } from "framer-motion"
import { type SavedItem } from "@/lib/api"
import { SavedCard } from "@/components/saved-card"
import { Loader2 } from "lucide-react"

interface CardGridProps {
  items?: SavedItem[]
  loading?: boolean
  onItemDeleted?: (id: string) => void
}

export function CardGrid({ items = [], loading = false, onItemDeleted }: CardGridProps) {
  if (loading) {
    return (
      <div className="flex min-h-[300px] sm:min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-2 sm:gap-3 px-4">
          <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
          <p className="text-xs sm:text-sm text-muted-foreground text-center">Loading your saved items...</p>
        </div>
      </div>
    )
  }

  if (!items || items.length === 0) {
    return (
      <div className="flex min-h-[300px] sm:min-h-[400px] items-center justify-center px-4">
        <div className="text-center space-y-2 sm:space-y-3">
          <p className="text-base sm:text-lg font-medium">No items found</p>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
            Start saving links, notes, or code snippets to see them here!
          </p>
        </div>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence mode="popLayout">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <SavedCard item={item} onDelete={onItemDeleted} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}
