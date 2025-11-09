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
    <div className="mx-auto max-w-7xl px-3 sm:px-4 py-4 sm:py-8 lg:px-8">
      <div className="mb-6 sm:mb-8 space-y-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-balance">Your AI-Powered Knowledge Base</h1>
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground text-pretty">
          Save links, notes, and code snippets. Let AI organize and summarize everything for you.
        </p>
      </div>

      <ChatInput onItemSaved={handleItemSaved} />

      <div className="mt-8 sm:mt-12">
        <Tabs defaultValue="grid" className="w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="grid" className="gap-1.5 sm:gap-2 flex-1 sm:flex-none text-xs sm:text-sm">
                <LayoutGrid className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Grid View</span>
                <span className="sm:hidden">Grid</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="gap-1.5 sm:gap-2 flex-1 sm:flex-none text-xs sm:text-sm">
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Timeline</span>
                <span className="sm:hidden">Timeline</span>
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
