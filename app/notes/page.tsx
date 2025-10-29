"use client"

import { CardGrid } from "@/components/card-grid"
import { FilterBar } from "@/components/filter-bar"
import { useState, useEffect } from "react"
import { fetchItems, type SavedItem } from "@/lib/api"

export default function NotesPage() {
  const [items, setItems] = useState<SavedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function loadItems() {
      try {
        setLoading(true)
        const fetchedItems = await fetchItems()
        // Filter only notes
        const noteItems = fetchedItems.filter(item => item.type === "note")
        setItems(noteItems)
      } catch (error) {
        console.error("Failed to load notes:", error)
      } finally {
        setLoading(false)
      }
    }
    loadItems()
  }, [])

  const filteredItems = items.filter((item) => {
    if (!searchQuery) return true
    return (
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const handleItemDeleted = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-balance">Notes</h1>
        <p className="text-lg text-muted-foreground text-pretty">All your saved notes and thoughts in one place.</p>
      </div>

      <FilterBar
        currentFilter="note"
        onFilterChange={() => {}}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <CardGrid
        items={filteredItems}
        loading={loading}
        onItemDeleted={handleItemDeleted}
      />
    </div>
  )
}
