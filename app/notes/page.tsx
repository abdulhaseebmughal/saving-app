"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Pin, Trash2, Calendar, Palette, Download, FileText, Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, Heading3, Table2, Image as ImageIcon, Link2, Printer, Type, Baseline, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Underline } from '@tiptap/extension-underline'
import { TextAlign } from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { FontFamily } from '@tiptap/extension-font-family'
import { Highlight } from '@tiptap/extension-highlight'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { Image } from '@tiptap/extension-image'
import { Link } from '@tiptap/extension-link'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { Document, Paragraph, TextRun, AlignmentType, HeadingLevel, Packer } from 'docx'
import { saveAs } from 'file-saver'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://saving-app-backend-six.vercel.app/api'

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('saveit_token') : null
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
}

interface DiaryNote {
  _id: string
  title: string
  content: string
  color: string
  isPinned: boolean
  type?: 'note' | 'document'
  createdAt: string
  updatedAt: string
}

const NOTE_COLORS = [
  { name: 'White', color: '#FFFFFF', textColor: '#000' },
  { name: 'Vanilla', color: '#FFF9E6', textColor: '#000' },
  { name: 'Mint', color: '#E8F5E9', textColor: '#000' },
  { name: 'Sky', color: '#E3F2FD', textColor: '#000' },
  { name: 'Lavender', color: '#F3E5F5', textColor: '#000' },
  { name: 'Peach', color: '#FFE0B2', textColor: '#000' },
  { name: 'Rose', color: '#FCE4EC', textColor: '#000' },
  { name: 'Aqua', color: '#E0F7FA', textColor: '#000' },
]

type EditorMode = 'notes' | 'word'

export default function NotesPage() {
  const [mode, setMode] = useState<EditorMode>('notes')
  const [notes, setNotes] = useState<DiaryNote[]>([])
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null)
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/diary-notes`, {
        headers: getAuthHeaders()
      })
      if (response.ok) {
        const result = await response.json()
        setNotes(result.success ? result.data : [])
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
    }
  }

  const createNote = async (color: string, type: 'note' | 'document') => {
    try {
      const response = await fetch(`${API_BASE_URL}/diary-notes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: type === 'note' ? '' : 'Untitled Document',
          content: '',
          color: color,
          isPinned: false,
          type: type
        })
      })
      if (response.ok) {
        const result = await response.json()
        const newNote = result.success ? result.data : result

        // Ensure type is set
        if (!newNote.type) {
          newNote.type = type
        }

        setNotes([newNote, ...notes])
        setEditingNote(newNote._id)
        toast({ title: type === 'note' ? "Note created!" : "Document created!" })
      }
    } catch (error) {
      toast({ title: "Error creating " + type, variant: "destructive" })
    }
  }

  const updateNote = async (id: string, updates: Partial<DiaryNote>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/diary-notes/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
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
      await fetch(`${API_BASE_URL}/diary-notes/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      setNotes(notes.filter(note => note._id !== id))
      toast({ title: "Deleted successfully" })
    } catch (error) {
      toast({ title: "Error deleting", variant: "destructive" })
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

  // Filter notes by type and mode
  const filteredNotes = notes.filter(note =>
    mode === 'notes' ? (note.type === 'note' || !note.type) : note.type === 'document'
  )
  const pinnedNotes = filteredNotes.filter(note => note.isPinned)
  const unpinnedNotes = filteredNotes.filter(note => !note.isPinned)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 py-4 sm:py-8 lg:px-8">
        {/* Header with Mode Selector */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            My Workspace
          </h1>

          {/* Mode Toggle */}
          <div className="flex gap-2 sm:gap-4 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 w-fit">
            <Button
              onClick={() => setMode('notes')}
              className={`px-4 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold transition-all ${
                mode === 'notes'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                  : 'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 inline" />
              Notes Mode
            </Button>
            <Button
              onClick={() => setMode('word')}
              className={`px-4 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold transition-all ${
                mode === 'word'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                  : 'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 inline" />
              Word File Mode
            </Button>
          </div>

          <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base mt-4">
            {mode === 'notes'
              ? '📝 Diary-style notes with colors and quick formatting'
              : '📄 Professional MS Word-like documents with full features'}
          </p>
        </div>

        {/* Create New */}
        <div className="mb-6 sm:mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700">
          {mode === 'notes' ? (
            <>
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" />
                <h2 className="text-base sm:text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Create New Note
                </h2>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Choose a color for your diary note:
              </p>
              <div className="grid grid-cols-4 sm:flex sm:flex-wrap gap-2 sm:gap-3">
                {NOTE_COLORS.map((colorOption) => (
                  <Button
                    key={colorOption.name}
                    onClick={() => createNote(colorOption.color, 'note')}
                    className="group relative h-12 sm:h-16 w-full sm:w-24 rounded-lg border-2 border-gray-300 hover:border-amber-500 transition-all hover:scale-105 sm:hover:scale-110 hover:shadow-lg active:scale-95"
                    style={{ backgroundColor: colorOption.color }}
                  >
                    <span className="text-[10px] sm:text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: colorOption.textColor }}>
                      {colorOption.name}
                    </span>
                  </Button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-base sm:text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Create New Document
                </h2>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Start with a blank professional document (like MS Word):
              </p>
              <Button
                onClick={() => createNote('#FFFFFF', 'document')}
                className="w-full sm:w-auto px-8 py-6 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
              >
                <Plus className="w-5 h-5" />
                Create Blank Document
              </Button>
            </>
          )}
        </div>

        {/* Pinned Items */}
        {pinnedNotes.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3 sm:mb-4 flex items-center gap-2">
              <Pin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
              Pinned {mode === 'notes' ? 'Notes' : 'Documents'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {pinnedNotes.map((note) => (
                mode === 'notes' ? (
                  <DiaryNoteCard
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
                ) : (
                  <WordDocumentCard
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
                )
              ))}
            </div>
          </div>
        )}

        {/* All Items */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3 sm:mb-4">
            All {mode === 'notes' ? 'Notes' : 'Documents'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <AnimatePresence>
              {unpinnedNotes.map((note) => (
                mode === 'notes' ? (
                  <DiaryNoteCard
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
                ) : (
                  <WordDocumentCard
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
                )
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

// DIARY NOTE CARD (Notes Mode)
function DiaryNoteCard({
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

// WORD DOCUMENT CARD (Word File Mode) - Preview Card
function WordDocumentCard({
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
  const { toast } = useToast()
  const router = useRouter()

  const openFullEditor = () => {
    router.push(`/document/${note._id}`)
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalTitle(e.target.value)
  }

  const handleTitleBlur = () => {
    if (localTitle !== note.title) {
      onUpdate(note._id, { title: localTitle })
    }
  }

  // Extract plain text from HTML content for preview
  const getPlainTextPreview = (html: string) => {
    const temp = document.createElement('div')
    temp.innerHTML = html
    return temp.textContent || temp.innerText || 'Empty document'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative group cursor-pointer"
      onClick={openFullEditor}
    >
      <div className="rounded-xl shadow-xl border-2 border-gray-300 bg-white dark:bg-gray-800 overflow-hidden flex flex-col touch-manipulation hover:shadow-2xl transition-shadow h-[400px]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b-2 border-blue-200 dark:border-blue-800 p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-blue-700 dark:text-blue-300">
              <Calendar className="w-3 h-3" />
              <span className="font-medium truncate max-w-[120px] sm:max-w-none">{formatDate(note.createdAt)}</span>
            </div>
            <div className="flex items-center gap-0.5 sm:gap-1" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className={`h-6 w-6 sm:h-7 sm:w-7 hover:bg-blue-200 dark:hover:bg-blue-800 ${note.isPinned ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}
                onClick={() => onTogglePin(note._id)}
                title="Pin Document"
              >
                <Pin className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill={note.isPinned ? 'currentColor' : 'none'} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 sm:h-7 sm:w-7 hover:bg-red-100 dark:hover:bg-red-900 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
                onClick={() => onDelete(note._id)}
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>

          {/* Title Input */}
          <div className="mt-2">
            <input
              type="text"
              value={localTitle}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              onClick={(e) => e.stopPropagation()}
              placeholder="Untitled Document"
              className="w-full bg-transparent text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none border-b-2 border-transparent focus:border-blue-400 pb-1 transition-colors"
            />
          </div>
        </div>

        {/* Document Preview */}
        <div className="flex-1 p-4 sm:p-6 overflow-hidden">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg p-4 sm:p-6 h-full flex flex-col shadow-inner">
            <div className="flex items-center gap-2 mb-3 text-gray-600 dark:text-gray-400">
              <FileText className="w-4 h-4" />
              <span className="text-sm font-medium">Document Preview</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-6">
                {getPlainTextPreview(note.content || '')}
              </p>
            </div>
          </div>
        </div>

        {/* Open Document Button */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-t-2 border-blue-200 dark:border-blue-800">
          <Button
            onClick={openFullEditor}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Open Full Editor
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
