"use client"

import { ChatInput } from "@/components/chat-input"
import { CardGrid } from "@/components/card-grid"
import { FilterBar } from "@/components/filter-bar"
import { CalendarView } from "@/components/calendar-view"
import { useState, useEffect } from "react"
import { fetchItems, type SavedItem } from "@/lib/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutGrid, Calendar } from "lucide-react"

export default function HomePage() {
  const [items, setItems] = useState<SavedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "note" | "link" | "code" | "component">("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch items from backend
  useEffect(() => {
    async function loadItems() {
      try {
        setLoading(true)
        const fetchedItems = await fetchItems()
        setItems(fetchedItems)
      } catch (error) {
        console.error("Failed to load items:", error)
      } finally {
        setLoading(false)
      }
    }
    loadItems()
  }, [])

  // Filter items based on current filter and search
  const filteredItems = items.filter((item) => {
    const matchesFilter = filter === "all" || item.type === filter
    const matchesSearch = !searchQuery ||
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // Handle new item saved
  const handleItemSaved = (newItem: SavedItem) => {
    setItems((prev) => [newItem, ...prev])
  }

  // Handle item deleted
  const handleItemDeleted = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-balance">Your AI-Powered Knowledge Base</h1>
        <p className="text-lg text-muted-foreground text-pretty">
          Save links, notes, and code snippets. Let AI organize and summarize everything for you.
        </p>
      </div>

      <ChatInput onItemSaved={handleItemSaved} />

      <div className="mt-12">
        <Tabs defaultValue="grid" className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="grid" className="gap-2">
                <LayoutGrid className="h-4 w-4" />
                Grid View
              </TabsTrigger>
              <TabsTrigger value="calendar" className="gap-2">
                <Calendar className="h-4 w-4" />
                Timeline
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="grid" className="space-y-6">
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
          </TabsContent>

          <TabsContent value="calendar">
            <CalendarView items={filteredItems} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
