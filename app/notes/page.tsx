"use client"

import { useState, useEffect } from "react"
import { Plus, Pin, Trash2, Calendar, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://saving-app-backend-six.vercel.app/api'

interface DiaryNote {
  _id: string
  title: string
  content: string
  color: string
  isPinned: boolean
  createdAt: string
  updatedAt: string
}

const NOTE_COLORS = [
  { name: 'Vanilla', color: '#FFF9E6', textColor: '#000' },
  { name: 'Mint', color: '#E8F5E9', textColor: '#000' },
  { name: 'Sky', color: '#E3F2FD', textColor: '#000' },
  { name: 'Lavender', color: '#F3E5F5', textColor: '#000' },
  { name: 'Peach', color: '#FFE0B2', textColor: '#000' },
  { name: 'Rose', color: '#FCE4EC', textColor: '#000' },
  { name: 'Lemon', color: '#FFFDE7', textColor: '#000' },
  { name: 'Aqua', color: '#E0F7FA', textColor: '#000' },
]

export default function NotesPage() {
  const [notes, setNotes] = useState<DiaryNote[]>([])
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null)
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/diary-notes`)
      if (response.ok) {
        const result = await response.json()
        setNotes(result.success ? result.data : [])
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
    }
  }

  const createNote = async (color: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/diary-notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '',
          content: '',
          color: color,
          isPinned: false
        })
      })
      if (response.ok) {
        const result = await response.json()
        const newNote = result.success ? result.data : result
        setNotes([newNote, ...notes])
        setEditingNote(newNote._id)
        toast({ title: "Note created!" })
      }
    } catch (error) {
      toast({ title: "Error creating note", variant: "destructive" })
    }
  }

  const updateNote = async (id: string, updates: Partial<DiaryNote>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/diary-notes/${id}`, {
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
      await fetch(`${API_BASE_URL}/diary-notes/${id}`, { method: 'DELETE' })
      setNotes(notes.filter(note => note._id !== id))
      toast({ title: "Note deleted" })
    } catch (error) {
      toast({ title: "Error deleting note", variant: "destructive" })
    }
  }

  const togglePin = async (id: string) => {
    const note = notes.find(n => n._id === id)
    if (note) {
      await updateNote(id, { isPinned: !note.isPinned })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const pinnedNotes = notes.filter(note => note.isPinned)
  const unpinnedNotes = notes.filter(note => !note.isPinned)

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 py-4 sm:py-8 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-amber-900 dark:text-amber-100 mb-2">
            My Notes
          </h1>
          <p className="text-amber-700 dark:text-amber-300 text-sm sm:text-base md:text-lg font-light italic">
            Your personal diary and thoughts collection
          </p>
        </div>

        {/* Color Picker for New Note */}
        <div className="mb-6 sm:mb-8 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border-2 border-amber-200 dark:border-amber-700">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-black dark:text-white" />
            <h2 className="text-base sm:text-lg md:text-xl font-serif font-semibold text-amber-900 dark:text-amber-100">
              Create New Note
            </h2>
          </div>
          <div className="grid grid-cols-4 sm:flex sm:flex-wrap gap-2 sm:gap-3">
            {NOTE_COLORS.map((colorOption) => (
              <Button
                key={colorOption.name}
                onClick={() => createNote(colorOption.color)}
                className="group relative h-12 sm:h-16 w-full sm:w-24 rounded-lg sm:rounded-xl border-2 border-gray-300 hover:border-amber-500 transition-all hover:scale-105 sm:hover:scale-110 hover:shadow-lg active:scale-95"
                style={{ backgroundColor: colorOption.color }}
              >
                <span className="text-[10px] sm:text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: colorOption.textColor }}>
                  {colorOption.name}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Pinned Notes */}
        {pinnedNotes.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-amber-900 dark:text-amber-100 mb-3 sm:mb-4 flex items-center gap-2">
              <Pin className="w-4 h-4 sm:w-5 sm:h-5 text-black dark:text-white" />
              Pinned Notes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {pinnedNotes.map((note) => (
                <NoteCard
                  key={note._id}
                  note={note}
                  isEditing={editingNote === note._id}
                  onEdit={() => setEditingNote(note._id)}
                  onUpdate={updateNote}
                  onDelete={deleteNote}
                  onTogglePin={togglePin}
                  onColorChange={(color) => updateNote(note._id, { color })}
                  showColorPicker={showColorPicker === note._id}
                  setShowColorPicker={setShowColorPicker}
                  formatDate={formatDate}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Notes */}
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-amber-900 dark:text-amber-100 mb-3 sm:mb-4">
            All Notes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <AnimatePresence>
              {unpinnedNotes.map((note) => (
                <NoteCard
                  key={note._id}
                  note={note}
                  isEditing={editingNote === note._id}
                  onEdit={() => setEditingNote(note._id)}
                  onUpdate={updateNote}
                  onDelete={deleteNote}
                  onTogglePin={togglePin}
                  onColorChange={(color) => updateNote(note._id, { color })}
                  showColorPicker={showColorPicker === note._id}
                  setShowColorPicker={setShowColorPicker}
                  formatDate={formatDate}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

interface NoteCardProps {
  note: DiaryNote
  isEditing: boolean
  onEdit: () => void
  onUpdate: (id: string, updates: Partial<DiaryNote>) => void
  onDelete: (id: string) => void
  onTogglePin: (id: string) => void
  onColorChange: (color: string) => void
  showColorPicker: boolean
  setShowColorPicker: (id: string | null) => void
  formatDate: (date: string) => string
}

function NoteCard({
  note,
  isEditing,
  onEdit,
  onUpdate,
  onDelete,
  onTogglePin,
  onColorChange,
  showColorPicker,
  setShowColorPicker,
  formatDate
}: NoteCardProps) {
  const [localTitle, setLocalTitle] = useState(note.title)
  const [localContent, setLocalContent] = useState(note.content)

  const handleSave = () => {
    onUpdate(note._id, { title: localTitle, content: localContent })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative group"
    >
      <div
        className="rounded-xl sm:rounded-2xl shadow-xl border-2 border-gray-300 overflow-hidden h-[400px] sm:h-[500px] flex flex-col touch-manipulation"
        style={{ backgroundColor: note.color }}
      >
        {/* Header */}
        <div className="p-3 sm:p-4 border-b-2 border-amber-900/20 bg-gradient-to-b from-black/5 to-transparent">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-black">
              <Calendar className="w-3 h-3 text-black" />
              <span className="font-medium truncate max-w-[120px] sm:max-w-none">{formatDate(note.createdAt)}</span>
            </div>
            <div className="flex items-center gap-0.5 sm:gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 sm:h-7 sm:w-7 hover:bg-black/10 active:scale-95"
                onClick={() => setShowColorPicker(showColorPicker ? null : note._id)}
              >
                <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`h-6 w-6 sm:h-7 sm:w-7 hover:bg-black/10 active:scale-95 ${note.isPinned ? 'text-amber-600' : 'text-black'}`}
                onClick={() => onTogglePin(note._id)}
              >
                <Pin className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill={note.isPinned ? 'currentColor' : 'none'} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 sm:h-7 sm:w-7 hover:bg-red-100 text-black hover:text-red-600 active:scale-95"
                onClick={() => onDelete(note._id)}
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>

          {/* Color Picker Dropdown */}
          {showColorPicker && (
            <div className="absolute top-12 sm:top-14 right-2 sm:right-4 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-2 sm:p-3 border-2 border-gray-200">
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                {NOTE_COLORS.map((colorOption) => (
                  <button
                    key={colorOption.name}
                    onClick={() => {
                      onColorChange(colorOption.color)
                      setShowColorPicker(null)
                    }}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg border-2 hover:scale-110 active:scale-95 transition-transform"
                    style={{ backgroundColor: colorOption.color }}
                    title={colorOption.name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Title with Diary Line */}
          <div className="relative">
            <input
              type="text"
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              onBlur={handleSave}
              onClick={onEdit}
              placeholder="Note Title..."
              className="w-full bg-transparent border-b-2 border-amber-900/30 pb-1 text-base sm:text-lg font-serif font-bold text-black placeholder:text-black/40 focus:outline-none focus:border-amber-900"
            />
          </div>
        </div>

        {/* Lined Content Area */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto relative">
          <div className="space-y-5 sm:space-y-6">
            {[...Array(15)].map((_, i) => (
              <div key={i} className="border-b border-amber-900/20 pb-5 sm:pb-6" />
            ))}
          </div>
          <textarea
            value={localContent}
            onChange={(e) => setLocalContent(e.target.value)}
            onBlur={handleSave}
            onClick={onEdit}
            placeholder="Write your thoughts here..."
            className="absolute inset-0 w-full h-full bg-transparent p-3 sm:p-4 text-black placeholder:text-black/40 resize-none focus:outline-none font-serif leading-[2.2rem] sm:leading-[2.5rem] text-sm sm:text-base"
            style={{ lineHeight: '2.2rem' }}
          />
        </div>
      </div>
    </motion.div>
  )
}
