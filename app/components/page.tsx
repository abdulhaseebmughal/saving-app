"use client"

import { CardGrid } from "@/components/card-grid"
import { FilterBar } from "@/components/filter-bar"
import { AddCodeDialog } from "@/components/add-code-dialog"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { fetchItems, type SavedItem } from "@/lib/api"
import { Plus, Code2 } from "lucide-react"

export default function ComponentsPage() {
  const [items, setItems] = useState<SavedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "note" | "link" | "code" | "component">("code")
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)

  const loadItems = async () => {
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

  useEffect(() => {
    loadItems()
  }, [])

  const filteredItems = items.filter((item) => {
    const matchesFilter = filter === "all" || filter === "code" || item.type === filter
    const matchesSearch = !searchQuery ||
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesFilter && matchesSearch
  })

  const handleItemDeleted = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const handleCodeSaved = () => {
    loadItems()
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-balance">Code & Components</h1>
            <p className="text-lg text-muted-foreground text-pretty">
              Your collection of code snippets and reusable components.
            </p>
          </div>
          <Button onClick={() => setShowAddDialog(true)} size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            <Code2 className="h-5 w-5" />
            Add Code
          </Button>
        </div>
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

      <AddCodeDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={handleCodeSaved}
      />
    </div>
  )
}
