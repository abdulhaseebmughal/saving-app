"use client"

import { CardGrid } from "@/components/card-grid"
import { FilterBar } from "@/components/filter-bar"
import { useState, useEffect } from "react"
import { fetchItems, type SavedItem } from "@/lib/api"

export default function ComponentsPage() {
  const [items, setItems] = useState<SavedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "note" | "link" | "code" | "component">("code")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function loadItems() {
      try {
        setLoading(true)
        const fetchedItems = await fetchItems()
        // Filter only code and components
        const codeItems = fetchedItems.filter(item => item.type === "code" || item.type === "component")
        setItems(codeItems)
      } catch (error) {
        console.error("Failed to load code:", error)
      } finally {
        setLoading(false)
      }
    }
    loadItems()
  }, [])

  const filteredItems = items.filter((item) => {
    const matchesFilter = filter === "all" || filter === "code" || item.type === filter
    const matchesSearch = !searchQuery ||
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const handleItemDeleted = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-balance">Code & Components</h1>
        <p className="text-lg text-muted-foreground text-pretty">
          Your collection of code snippets and reusable components.
        </p>
      </div>

      <FilterBar
        currentFilter={filter}
        onFilterChange={setFilter}
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
