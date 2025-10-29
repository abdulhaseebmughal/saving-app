"use client"

import { useState, useEffect, useCallback } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { useDrop } from "react-dnd"
import { StickyNote } from "@/components/sticky-note"
import { PlusCircle, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"

interface Note {
  _id: string
  text: string
  color: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  zIndex: number
}

const COLORS = [
  { hex: '#fef08a', name: 'Yellow' },
  { hex: '#fecaca', name: 'Red' },
  { hex: '#bfdbfe', name: 'Blue' },
  { hex: '#bbf7d0', name: 'Green' },
  { hex: '#ddd6fe', name: 'Purple' },
  { hex: '#fed7aa', name: 'Orange' },
  { hex: '#fbcfe8', name: 'Pink' },
  { hex: '#d1d5db', name: 'Gray' },
]

const API_BASE_URL = 'http://localhost:5000/api'

function BoardCanvas() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [showColorPalette, setShowColorPalette] = useState(false)
  const [selectedColor, setSelectedColor] = useState('#fef08a')
  const { toast } = useToast()

  const [, drop] = useDrop(() => ({
    accept: 'NOTE',
    drop: () => ({}),
  }))

  // Fetch notes from backend
  const fetchNotes = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notes`)
      const data = await response.json()
      setNotes(data)
    } catch (error) {
      console.error('Error fetching notes:', error)
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

  // Create new note
  const createNote = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: '',
          color: selectedColor,
          position: { x: 100 + notes.length * 20, y: 100 + notes.length * 20 },
          size: { width: 250, height: 250 }
        })
      })

      if (!response.ok) throw new Error('Failed to create note')

      const newNote = await response.json()
      setNotes([...notes, newNote])

      toast({
        title: "Note created",
        description: "Click to start typing"
      })
    } catch (error) {
      console.error('Error creating note:', error)
      toast({
        title: "Error",
        description: "Failed to create note",
        variant: "destructive"
      })
    }
  }

  // Update note
  const updateNote = async (id: string, updates: Partial<Note>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (!response.ok) throw new Error('Failed to update note')

      const updatedNote = await response.json()
      setNotes(notes.map(note => note._id === id ? updatedNote : note))
    } catch (error) {
      console.error('Error updating note:', error)
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive"
      })
    }
  }

  // Delete note
  const deleteNote = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete note')

      setNotes(notes.filter(note => note._id !== id))

      toast({
        title: "Note deleted",
        description: "Note has been removed"
      })
    } catch (error) {
      console.error('Error deleting note:', error)
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive"
      })
    }
  }

  // Bring note to front
  const bringToFront = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notes/${id}/bring-to-front`, {
        method: 'PUT'
      })

      if (!response.ok) throw new Error('Failed to update zIndex')

      const updatedNote = await response.json()
      setNotes(notes.map(note => note._id === id ? updatedNote : note))
    } catch (error) {
      console.error('Error bringing note to front:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your notes board...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Grid pattern background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, #d4d4d4 1px, transparent 1px),
            linear-gradient(to bottom, #d4d4d4 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px'
        }}
      />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Notes Board</h1>
            <p className="text-sm text-muted-foreground">Drag and drop your sticky notes</p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowColorPalette(!showColorPalette)}
              className="gap-2"
            >
              <Palette className="w-4 h-4" />
              Color
            </Button>

            <Button onClick={createNote} className="gap-2">
              <PlusCircle className="w-4 h-4" />
              Add Note
            </Button>
          </div>
        </div>

        {/* Color Palette */}
        {showColorPalette && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex gap-2 items-center bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <span className="text-sm font-medium mr-2">Select Color:</span>
            {COLORS.map((color) => (
              <button
                key={color.hex}
                onClick={() => setSelectedColor(color.hex)}
                className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                  selectedColor === color.hex ? 'border-gray-900 dark:border-white ring-2 ring-offset-2 ring-gray-900 dark:ring-white' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Board Canvas */}
      <div
        ref={drop}
        className="absolute inset-0 pt-24"
        style={{ cursor: 'default' }}
      >
        {notes.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="mb-6"
              >
                <div className="w-32 h-32 mx-auto bg-yellow-200 rounded-lg shadow-xl transform rotate-3 flex items-center justify-center">
                  <PlusCircle className="w-16 h-16 text-yellow-600" />
                </div>
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">Start Your Creative Board</h2>
              <p className="text-muted-foreground mb-6">
                Click "Add Note" to create your first sticky note and start organizing your ideas
              </p>
              <Button onClick={createNote} size="lg" className="gap-2">
                <PlusCircle className="w-5 h-5" />
                Create Your First Note
              </Button>
            </div>
          </div>
        ) : (
          notes.map((note) => (
            <StickyNote
              key={note._id}
              id={note._id}
              text={note.text}
              color={note.color}
              position={note.position}
              size={note.size}
              zIndex={note.zIndex}
              onUpdate={updateNote}
              onDelete={deleteNote}
              onBringToFront={bringToFront}
            />
          ))
        )}
      </div>

      {/* Stats Footer */}
      <div className="absolute bottom-4 left-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-muted-foreground">
          {notes.length} {notes.length === 1 ? 'note' : 'notes'} on board
        </p>
      </div>
    </div>
  )
}

export default function BoardPage() {
  return (
    <DndProvider backend={HTML5Backend}>
      <BoardCanvas />
    </DndProvider>
  )
}
