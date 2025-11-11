"use client"

import { useState, useEffect, useCallback } from "react"
import { StickyNote } from "@/components/sticky-note"
import { Plus, Trash2, Palette, Search, Grid3x3, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { AnimatePresence, motion } from "framer-motion"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://saving-app-backend-six.vercel.app/api'

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('saveit_token') : null
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
}

interface Note {
  _id: string
  text: string
  color: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  zIndex: number
}

const NOTE_COLORS = [
  { name: 'Yellow', color: '#fef08a', gradient: 'from-yellow-100 to-yellow-200' },
  { name: 'Pink', color: '#fbcfe8', gradient: 'from-pink-100 to-pink-200' },
  { name: 'Blue', color: '#bfdbfe', gradient: 'from-blue-100 to-blue-200' },
  { name: 'Green', color: '#bbf7d0', gradient: 'from-green-100 to-green-200' },
  { name: 'Purple', color: '#ddd6fe', gradient: 'from-purple-100 to-purple-200' },
  { name: 'Orange', color: '#fed7aa', gradient: 'from-orange-100 to-orange-200' },
  { name: 'Red', color: '#fecaca', gradient: 'from-red-100 to-red-200' },
  { name: 'Teal', color: '#99f6e4', gradient: 'from-teal-100 to-teal-200' },
]

export default function BoardPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<'free' | 'grid'>('free')
  const { toast } = useToast()

  const fetchNotes = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/notes`, {
        headers: getAuthHeaders()
      })
      const result = await response.json()
      const fetchedNotes = result.success ? result.data : []
      setNotes(fetchedNotes)
      setFilteredNotes(fetchedNotes)
    } catch (error) {
      console.error('Error:', error)
      setNotes([])
      setFilteredNotes([])
      toast({
        title: "Error",
        description: "Failed to load notes",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredNotes(notes)
    } else {
      const filtered = notes.filter(note =>
        note.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredNotes(filtered)
    }
  }, [searchQuery, notes])

  const createNote = async (color: string) => {
    try {
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      const response = await fetch(`${API_BASE_URL}/notes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          text: '',
          color: color,
          position: {
            x: Math.min(Math.random() * (viewportWidth - 300), viewportWidth - 320),
            y: Math.min(Math.random() * (viewportHeight - 300) + 100, viewportHeight - 320)
          },
          size: { width: 280, height: 280 },
          zIndex: Date.now()
        })
      })

      if (response.ok) {
        const result = await response.json()
        const newNote = result.success ? result.data : result
        setNotes([...notes, newNote])
        setShowColorPicker(false)
        toast({
          title: "✨ Note Created!",
          description: "Click to start typing"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create note",
        variant: "destructive"
      })
    }
  }

  const updateNote = async (id: string, updates: Partial<Note>) => {
    try {
      // Optimistic update
      setNotes(notes.map(note =>
        note._id === id ? { ...note, ...updates } : note
      ))

      const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        throw new Error('Failed to update')
      }

      const result = await response.json()
      const updatedNote = result.success ? result.data : result
      setNotes(notes.map(note => note._id === id ? updatedNote : note))
    } catch (error) {
      console.error('Error updating note:', error)
      fetchNotes() // Revert on error
    }
  }

  const deleteNote = async (id: string) => {
    try {
      await fetch(`${API_BASE_URL}/notes/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      setNotes(notes.filter(note => note._id !== id))
      toast({
        title: "🗑️ Deleted",
        description: "Note removed"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive"
      })
    }
  }

  const deleteAllNotes = async () => {
    if (!window.confirm('Delete all notes? This cannot be undone.')) return

    try {
      await Promise.all(notes.map(note =>
        fetch(`${API_BASE_URL}/notes/${note._id}`, { method: 'DELETE' })
      ))
      setNotes([])
      toast({
        title: "🧹 Cleared",
        description: "All notes removed"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete notes",
        variant: "destructive"
      })
    }
  }

  const organizeGrid = () => {
    const padding = 20
    const cols = Math.floor((window.innerWidth - padding * 2) / 300)
    const notesWithPositions = filteredNotes.map((note, index) => {
      const row = Math.floor(index / cols)
      const col = index % cols
      return {
        ...note,
        position: {
          x: padding + col * 300,
          y: padding + row * 300 + 100
        }
      }
    })

    notesWithPositions.forEach(note => {
      updateNote(note._id, { position: note.position })
    })

    toast({
      title: "📐 Organized",
      description: "Notes arranged in grid"
    })
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900">
      {/* Professional Toolbar */}
      <div className="absolute top-0 left-0 right-0 z-[100] bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-2.5">
          <div className="flex items-center justify-between gap-2">
            {/* Left side */}
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
                  <Palette className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                    Sticky Board
                  </h1>
                  <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                    {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
                  </p>
                </div>
              </div>

              {/* Search */}
              <div className="relative flex-1 max-w-xs hidden md:block">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-xs bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              {/* Organize Grid */}
              {notes.length > 0 && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={organizeGrid}
                  className="h-7 w-7 sm:h-8 sm:w-8 border-gray-300 dark:border-gray-700 active:scale-95 transition-all"
                  title="Organize in grid"
                >
                  <Grid3x3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
              )}

              <Button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="h-7 sm:h-8 px-2.5 sm:px-3 text-xs sm:text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1.5" />
                <span className="hidden sm:inline font-medium">New</span>
              </Button>

              {notes.length > 0 && (
                <Button
                  variant="outline"
                  onClick={deleteAllNotes}
                  className="h-7 sm:h-8 px-2 sm:px-2.5 text-xs border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950 active:scale-95 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline ml-1.5">Clear</span>
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden mt-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
              />
            </div>
          </div>

          {/* Color Picker */}
          <AnimatePresence>
            {showColorPicker && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2.5 pt-2.5 border-t border-gray-200 dark:border-gray-800">
                  <p className="text-[10px] sm:text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Choose a color:
                  </p>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 sm:gap-2">
                    {NOTE_COLORS.map((colorOption) => (
                      <button
                        key={colorOption.name}
                        onClick={() => createNote(colorOption.color)}
                        className={`group relative aspect-square rounded-lg sm:rounded-xl bg-gradient-to-br ${colorOption.gradient} border-2 border-gray-300/50 dark:border-gray-700/50 hover:border-gray-400 dark:hover:border-gray-600 transition-all hover:scale-105 active:scale-95 shadow-md hover:shadow-xl`}
                      >
                        <span className="absolute inset-0 flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity">
                          {colorOption.name}
                        </span>
                      </button>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setShowColorPicker(false)}
                    className="w-full mt-2 h-7 text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Notes Canvas */}
      <div className="absolute inset-0 top-[60px] sm:top-[68px] md:top-[68px] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Loading notes...</p>
            </div>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="flex items-center justify-center h-full px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-3 sm:space-y-4 max-w-md"
            >
              <div className="text-5xl sm:text-6xl md:text-7xl">
                {searchQuery ? "🔍" : "📝"}
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {searchQuery ? "No notes found" : "Your board is empty"}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {searchQuery
                  ? `No notes match "${searchQuery}"`
                  : "Create your first sticky note to get started. Drag them around to organize your thoughts!"}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => setShowColorPicker(true)}
                  className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg text-xs sm:text-sm h-8 sm:h-9"
                >
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                  Create First Note
                </Button>
              )}
            </motion.div>
          </div>
        ) : (
          <div className="relative w-full h-full">
            <AnimatePresence>
              {filteredNotes.map((note) => (
                <StickyNote
                  key={note._id}
                  id={note._id}
                  text={note.text}
                  color={note.color}
                  position={note.position}
                  size={note.size}
                  zIndex={note.zIndex}
                  onUpdate={(updates) => updateNote(note._id, updates)}
                  onDelete={() => deleteNote(note._id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 sm:left-4 sm:translate-x-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg border border-gray-200/50 dark:border-gray-800/50">
        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="font-medium text-gray-900 dark:text-white">
            {filteredNotes.length} Active
          </span>
        </div>
      </div>

      {/* Tips - Desktop Only */}
      <div className="hidden lg:block absolute bottom-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl px-4 py-3 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-800/50 max-w-xs">
        <div className="text-xs space-y-1.5 text-gray-700 dark:text-gray-300">
          <div className="font-semibold mb-2 text-gray-900 dark:text-white">💡 Quick Tips</div>
          <div>• Drag notes anywhere to organize</div>
          <div>• Resize from bottom-right corner</div>
          <div>• Change color on hover (palette icon)</div>
          <div>• Adjust font size (S/M/L buttons)</div>
          <div>• Minimize notes to save space</div>
          <div>• Auto-saves as you type</div>
        </div>
      </div>
    </div>
  )
}
