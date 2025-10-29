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
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your saved items...</p>
        </div>
      </div>
    )
  }

  if (!items || items.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-lg font-medium">No items found</p>
          <p className="text-sm text-muted-foreground">
            Start saving links, notes, or code snippets to see them here!
          </p>
        </div>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
