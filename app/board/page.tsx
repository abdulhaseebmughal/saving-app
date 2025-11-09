"use client"

import { useState, useEffect, useCallback } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { StickyNote } from "@/components/sticky-note"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://saving-app-backend-six.vercel.app/api'

interface Note {
  _id: string
  text: string
  color: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  zIndex: number
}

// Sticky note color options - optimized for mobile
const NOTE_COLORS = [
  { name: 'Yellow', color: '#fef08a', textColor: '#854d0e' },
  { name: 'Pink', color: '#fbcfe8', textColor: '#831843' },
  { name: 'Blue', color: '#bfdbfe', textColor: '#1e3a8a' },
  { name: 'Green', color: '#bbf7d0', textColor: '#14532d' },
  { name: 'Purple', color: '#ddd6fe', textColor: '#4c1d95' },
  { name: 'Orange', color: '#fed7aa', textColor: '#7c2d12' },
  { name: 'Red', color: '#fecaca', textColor: '#7f1d1d' },
  { name: 'Teal', color: '#99f6e4', textColor: '#134e4a' },
]

function WhiteboardCanvas() {
  const [notes, setNotes] = useState<Note[]>([])
  const [showColorPicker, setShowColorPicker] = useState(false)
  const { toast } = useToast()

  const fetchNotes = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notes`)
      const result = await response.json()
      setNotes(result.success ? result.data : [])
    } catch (error) {
      console.error('Error:', error)
      setNotes([])
    }
  }, [])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  const createNote = async (color: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: '',
          color: color,
          position: {
            x: Math.random() * (window.innerWidth - 280) + 20,
            y: Math.random() * (window.innerHeight - 380) + 100
          },
          size: { width: 250, height: 250 }
        })
      })

      if (response.ok) {
        const result = await response.json()
        const newNote = result.success ? result.data : result
        setNotes([...notes, newNote])
        setShowColorPicker(false)
        toast({
          title: "Note Created!",
          description: "Click on the note to start typing"
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
      const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        const result = await response.json()
        const updatedNote = result.success ? result.data : result
        setNotes(notes.map(note => note._id === id ? updatedNote : note))
      }
    } catch (error) {
      console.error('Error updating note:', error)
    }
  }

  const deleteNote = async (id: string) => {
    try {
      await fetch(`${API_BASE_URL}/notes/${id}`, { method: 'DELETE' })
      setNotes(notes.filter(note => note._id !== id))
      toast({
        title: "Deleted",
        description: "Note has been removed"
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
    if (!confirm('Delete all notes? This cannot be undone.')) return

    try {
      await Promise.all(notes.map(note =>
        fetch(`${API_BASE_URL}/notes/${note._id}`, { method: 'DELETE' })
      ))
      setNotes([])
      toast({
        title: "Cleared",
        description: "All notes have been removed"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete notes",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 touch-manipulation">
      {/* Mobile-Optimized Toolbar */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 px-2 sm:px-4 py-2 sm:py-3 shadow-lg">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2 sm:gap-3">
            <h1 className="text-sm sm:text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">
              Sticky Notes Board
            </h1>
            <span className="hidden sm:inline text-xs text-muted-foreground">
              {notes.length} {notes.length === 1 ? 'note' : 'notes'}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="h-8 sm:h-9 gap-1.5 sm:gap-2 px-2.5 sm:px-4 active:scale-95 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium">New Note</span>
            </Button>

            {notes.length > 0 && (
              <Button
                variant="outline"
                onClick={deleteAllNotes}
                className="h-8 sm:h-9 px-2 sm:px-3 active:scale-95 text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline ml-1.5 text-xs">Clear All</span>
              </Button>
            )}
          </div>
        </div>

        {/* Color Picker Dropdown - Mobile Optimized */}
        {showColorPicker && (
          <div className="mt-3 p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 max-w-md mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-5 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                Choose Note Color
              </h3>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {NOTE_COLORS.map((colorOption) => (
                <button
                  key={colorOption.name}
                  onClick={() => createNote(colorOption.color)}
                  className="group relative aspect-square rounded-xl border-2 border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500 transition-all hover:scale-105 active:scale-95 shadow-md hover:shadow-xl"
                  style={{ backgroundColor: colorOption.color }}
                >
                  <span
                    className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: colorOption.textColor }}
                  >
                    {colorOption.name}
                  </span>
                </button>
              ))}
            </div>
            <Button
              variant="ghost"
              onClick={() => setShowColorPicker(false)}
              className="w-full mt-3 text-xs sm:text-sm"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Notes Canvas */}
      <DndProvider backend={HTML5Backend}>
        <div className="absolute inset-0 top-14 sm:top-16 overflow-auto">
          <div className="relative w-full min-h-full">
            {notes.length === 0 && !showColorPicker && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-3 sm:space-y-4 px-4 max-w-md">
                  <div className="text-4xl sm:text-6xl">📝</div>
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                    No Sticky Notes Yet
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Click "New Note" to create your first sticky note. Drag them around, resize, and organize your thoughts!
                  </p>
                  <Button
                    onClick={() => setShowColorPicker(true)}
                    className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Note
                  </Button>
                </div>
              </div>
            )}

            {notes.map((note) => (
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
          </div>
        </div>
      </DndProvider>

      {/* Mobile Stats Footer */}
      <div className="sm:hidden absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl px-4 py-2 rounded-full border text-xs shadow-lg">
        <span className="font-medium">{notes.length} {notes.length === 1 ? 'Note' : 'Notes'}</span>
      </div>

      {/* Desktop Info */}
      <div className="hidden sm:block absolute bottom-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl px-4 py-2.5 rounded-xl border text-xs text-muted-foreground shadow-lg max-w-xs">
        <div className="font-semibold mb-1 text-foreground">💡 Tips:</div>
        <ul className="space-y-0.5 text-[10px]">
          <li>• Drag notes to move them around</li>
          <li>• Resize from bottom-right corner</li>
          <li>• Click to edit note content</li>
          <li>• Notes auto-save as you type</li>
        </ul>
      </div>
    </div>
  )
}

export default function BoardPage() {
  return <WhiteboardCanvas />
}
