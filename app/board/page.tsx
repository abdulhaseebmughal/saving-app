"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Stage, Layer, Rect, Circle, Line, Text, Transformer, Arrow, RegularPolygon, Star as KonvaStar } from "react-konva"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { StickyNote } from "@/components/sticky-note"
import { Square, Circle as CircleIcon, Minus, ArrowRight, Type, Hand, Pen, StickyNote as NoteIcon, Trash2, Palette, Undo, Redo, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://saving-app-backend-six.vercel.app/api'

interface Note {
  _id: string
  text: string
  color: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  zIndex: number
}

interface Shape {
  id: string
  type: 'rectangle' | 'circle' | 'line' | 'arrow' | 'text' | 'pen' | 'triangle' | 'star'
  x: number
  y: number
  width?: number
  height?: number
  radius?: number
  points?: number[]
  text?: string
  fill: string
  stroke: string
  strokeWidth: number
  rotation?: number
  scaleX?: number
  scaleY?: number
  sides?: number
  innerRadius?: number
  outerRadius?: number
}

// Day-of-week sticky notes with special styling
const DAY_NOTES = [
  { day: 'Monday', color: '#fef08a', emoji: '🌟', gradient: 'from-yellow-200 to-yellow-300' },
  { day: 'Tuesday', color: '#fecaca', emoji: '🔥', gradient: 'from-red-200 to-red-300' },
  { day: 'Wednesday', color: '#bfdbfe', emoji: '💧', gradient: 'from-blue-200 to-blue-300' },
  { day: 'Thursday', color: '#bbf7d0', emoji: '🌱', gradient: 'from-green-200 to-green-300' },
  { day: 'Friday', color: '#ddd6fe', emoji: '🎉', gradient: 'from-purple-200 to-purple-300' },
  { day: 'Saturday', color: '#fed7aa', emoji: '☀️', gradient: 'from-orange-200 to-orange-300' },
  { day: 'Sunday', color: '#fbcfe8', emoji: '💖', gradient: 'from-pink-200 to-pink-300' },
]

// Shape types with icons
const SHAPE_TYPES = [
  { type: 'rectangle', label: 'Rectangle', filled: false },
  { type: 'rectangle-filled', label: 'Filled Rectangle', filled: true },
  { type: 'circle', label: 'Circle', filled: false },
  { type: 'circle-filled', label: 'Filled Circle', filled: true },
  { type: 'triangle', label: 'Triangle', filled: false },
  { type: 'star', label: 'Star', filled: true },
]

type Tool = 'select' | 'rectangle' | 'circle' | 'line' | 'arrow' | 'text' | 'pen' | 'note' | 'triangle' | 'star'

function WhiteboardCanvas() {
  const [notes, setNotes] = useState<Note[]>([])
  const [shapes, setShapes] = useState<Shape[]>([])
  const [history, setHistory] = useState<Shape[][]>([])
  const [historyStep, setHistoryStep] = useState(0)
  const [selectedTool, setSelectedTool] = useState<Tool>('select')
  const [selectedNoteTemplate, setSelectedNoteTemplate] = useState<any>(null)
  const [showNoteMenu, setShowNoteMenu] = useState(false)
  const [showShapeMenu, setShowShapeMenu] = useState(false)
  const [selectedShapeType, setSelectedShapeType] = useState<string>('rectangle')
  const [shapeColor, setShapeColor] = useState('#3B82F6')
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentShape, setCurrentShape] = useState<Shape | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [copiedShape, setCopiedShape] = useState<Shape | null>(null)
  const { toast } = useToast()
  const stageRef = useRef<any>(null)
  const layerRef = useRef<any>(null)
  const transformerRef = useRef<any>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 1920, height: 1080 })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCanvasSize({ width: window.innerWidth, height: window.innerHeight - 64 })
      const handleResize = () => setCanvasSize({ width: window.innerWidth, height: window.innerHeight - 64 })
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    if (selectedId && transformerRef.current && layerRef.current) {
      const selectedNode = layerRef.current.findOne('#' + selectedId)
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode])
        transformerRef.current.getLayer().batchDraw()
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([])
    }
  }, [selectedId])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input or textarea
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

      // Tool shortcuts
      if (e.key.toLowerCase() === 'v' && !e.ctrlKey) {
        setSelectedTool('select')
        e.preventDefault()
      }
      if (e.key.toLowerCase() === 'r' && !e.ctrlKey) {
        setSelectedTool('rectangle')
        e.preventDefault()
      }
      if (e.key.toLowerCase() === 'c' && !e.ctrlKey) {
        setSelectedTool('circle')
        e.preventDefault()
      }
      if (e.key.toLowerCase() === 'l' && !e.ctrlKey) {
        setSelectedTool('line')
        e.preventDefault()
      }
      if (e.key.toLowerCase() === 'a' && !e.ctrlKey) {
        setSelectedTool('arrow')
        e.preventDefault()
      }
      if (e.key.toLowerCase() === 'p' && !e.ctrlKey) {
        setSelectedTool('pen')
        e.preventDefault()
      }
      if (e.key.toLowerCase() === 't' && !e.ctrlKey) {
        setSelectedTool('text')
        e.preventDefault()
      }
      if (e.key.toLowerCase() === 'n' && !e.ctrlKey) {
        setShowNoteMenu(true)
        setShowShapeMenu(false)
        e.preventDefault()
      }
      if (e.key.toLowerCase() === 's' && !e.ctrlKey) {
        setShowShapeMenu(true)
        setShowNoteMenu(false)
        e.preventDefault()
      }

      // Delete
      if (e.key === 'Delete' && selectedId) {
        deleteSelected()
        e.preventDefault()
      }
      // Backspace also deletes
      if (e.key === 'Backspace' && selectedId) {
        deleteSelected()
        e.preventDefault()
      }
      // Copy (Ctrl+C)
      if (e.ctrlKey && e.key === 'c' && selectedId) {
        const shape = shapes.find(s => s.id === selectedId)
        if (shape) {
          setCopiedShape(shape)
          toast({ title: "Copied", description: "Shape copied to clipboard" })
        }
        e.preventDefault()
      }
      // Paste (Ctrl+V)
      if (e.ctrlKey && e.key === 'v' && copiedShape) {
        const newShape = { ...copiedShape, id: `shape-${Date.now()}`, x: copiedShape.x + 20, y: copiedShape.y + 20 }
        setShapes([...shapes, newShape])
        addToHistory([...shapes, newShape])
        toast({ title: "Pasted", description: "Shape pasted" })
        e.preventDefault()
      }
      // Undo (Ctrl+Z)
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        undo()
        e.preventDefault()
      }
      // Redo (Ctrl+Y or Ctrl+Shift+Z)
      if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
        redo()
        e.preventDefault()
      }
      // Escape to deselect and close menus
      if (e.key === 'Escape') {
        setSelectedId(null)
        setSelectedTool('select')
        setShowNoteMenu(false)
        setShowShapeMenu(false)
        e.preventDefault()
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.menu-container')) {
        setShowNoteMenu(false)
        setShowShapeMenu(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('click', handleClickOutside)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('click', handleClickOutside)
    }
  }, [selectedId, shapes, copiedShape, historyStep, history, notes])

  const addToHistory = (newShapes: Shape[]) => {
    const newHistory = history.slice(0, historyStep + 1)
    newHistory.push(newShapes)
    setHistory(newHistory)
    setHistoryStep(newHistory.length - 1)
  }

  const undo = () => {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1)
      setShapes(history[historyStep - 1])
      toast({ title: "Undo", description: "Action undone" })
    }
  }

  const redo = () => {
    if (historyStep < history.length - 1) {
      setHistoryStep(historyStep + 1)
      setShapes(history[historyStep + 1])
      toast({ title: "Redo", description: "Action redone" })
    }
  }

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

  // Development helper: detect missing or duplicate keys in notes to diagnose React key warnings
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      const seen = new Map<string, number[]>()
      notes.forEach((note, idx) => {
        const k = (note as any)._id ?? (note as any).id ?? `note-${idx}`
        const list = seen.get(String(k)) || []
        list.push(idx)
        seen.set(String(k), list)
      })

      const duplicates = Array.from(seen.entries()).filter(([k, idxs]) => idxs.length > 1)
      const missing = Array.from(seen.entries()).filter(([k]) => k === 'undefined' || k === 'null')

      if (duplicates.length > 0) {
        console.warn('StickyNote key collision detected. Duplicate keys found for notes at indices:', duplicates.map(d => d[1]))
        console.table(duplicates.map(d => ({ key: d[0], indices: d[1].join(',') })))
      }

      if (missing.length > 0) {
        console.warn('StickyNote missing key detected for notes at indices:', missing.map(d => d[1]))
      }
    }
  }, [notes])

  const createNote = async (template?: any) => {
    try {
      let noteText = ''
      let noteColor = template?.color || '#fef08a'

      if (template?.day) {
        noteText = `${template.emoji} ${template.day}\n\n`
      } else if (template?.name) {
        noteText = `${template.icon} ${template.name}\n\n`
      }

      const response = await fetch(`${API_BASE_URL}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: noteText,
          color: noteColor,
          position: { x: 100 + notes.length * 20, y: 100 + notes.length * 20 },
          size: { width: 250, height: 250 }
        })
      })
      if (!response.ok) throw new Error('Failed')
      const result = await response.json()
      const newNote = result.success ? result.data : result
      setNotes([...notes, newNote])
      setShowNoteMenu(false)
      toast({
        title: template ? `${template.day || template.name} note created` : "Note created",
        description: template?.day ? `Special note for ${template.day}` : undefined
      })
    } catch (error) {
      toast({ title: "Error", variant: "destructive" })
    }
  }

  const handleMouseDown = (e: any) => {
    // Check if clicking on a shape when in select mode
    if (selectedTool === 'select') {
      const clickedOnEmpty = e.target === e.target.getStage()
      if (clickedOnEmpty) {
        setSelectedId(null)
      }
      return
    }

    // Don't draw if note tool is selected (handled by button click)
    if (selectedTool === 'note') return

    // Deselect any selected shape when starting to draw
    setSelectedId(null)

    const stage = e.target.getStage()
    const point = stage.getPointerPosition()

    if (!point) return // Safety check

    // Determine fill based on selected shape type
    const isFilled = selectedShapeType.includes('filled')
    const fillColor = isFilled ? shapeColor : 'transparent'
    const fillOpacity = isFilled ? shapeColor : shapeColor + '20'

    const newShape: Shape = {
      id: `shape-${Date.now()}`,
      type: selectedTool as any,
      x: point.x,
      y: point.y,
      fill: selectedTool === 'pen' ? 'transparent' : (isFilled ? shapeColor : fillOpacity),
      stroke: shapeColor,
      strokeWidth: selectedTool === 'pen' ? 3 : isFilled ? 1 : 2,
      rotation: 0,
      scaleX: 1,
      scaleY: 1
    }

    if (selectedTool === 'rectangle') {
      newShape.width = 0
      newShape.height = 0
    } else if (selectedTool === 'circle') {
      newShape.radius = 0
    } else if (selectedTool === 'triangle') {
      newShape.type = 'triangle'
      newShape.radius = 0
      newShape.sides = 3
    } else if (selectedTool === 'star') {
      newShape.type = 'star'
      newShape.outerRadius = 0
      newShape.innerRadius = 0
    } else if (selectedTool === 'line' || selectedTool === 'arrow' || selectedTool === 'pen') {
      newShape.points = [0, 0]
    } else if (selectedTool === 'text') {
      newShape.text = 'Double-click to edit'
      newShape.width = 200
      newShape.height = 40
      const updatedShapes = [...shapes, newShape]
      setShapes(updatedShapes)
      addToHistory(updatedShapes)
      setSelectedTool('select')
      setSelectedId(newShape.id)
      toast({ title: "Text added", description: "Double-click the text to edit it" })
      return
    }

    setCurrentShape(newShape)
    setIsDrawing(true)
  }

  const handleMouseMove = (e: any) => {
    if (!isDrawing || !currentShape) return

    const stage = e.target.getStage()
    const point = stage.getPointerPosition()
    const updatedShape = { ...currentShape }

    if (currentShape.type === 'rectangle') {
      updatedShape.width = point.x - currentShape.x
      updatedShape.height = point.y - currentShape.y
    } else if (currentShape.type === 'circle') {
      updatedShape.radius = Math.sqrt(Math.pow(point.x - currentShape.x, 2) + Math.pow(point.y - currentShape.y, 2))
    } else if (currentShape.type === 'triangle') {
      updatedShape.radius = Math.sqrt(Math.pow(point.x - currentShape.x, 2) + Math.pow(point.y - currentShape.y, 2))
    } else if (currentShape.type === 'star') {
      const radius = Math.sqrt(Math.pow(point.x - currentShape.x, 2) + Math.pow(point.y - currentShape.y, 2))
      updatedShape.outerRadius = radius
      updatedShape.innerRadius = radius * 0.5
    } else if (currentShape.type === 'line' || currentShape.type === 'arrow') {
      updatedShape.points = [0, 0, point.x - currentShape.x, point.y - currentShape.y]
    } else if (currentShape.type === 'pen') {
      updatedShape.points = currentShape.points!.concat([point.x - currentShape.x, point.y - currentShape.y])
    }

    setCurrentShape(updatedShape)
  }

  const handleMouseUp = () => {
    if (!isDrawing || !currentShape) return
    const updatedShapes = [...shapes, currentShape]
    setShapes(updatedShapes)
    addToHistory(updatedShapes)
    setCurrentShape(null)
    setIsDrawing(false)
    setSelectedId(currentShape.id)
    setSelectedTool('select')
  }

  const deleteSelected = () => {
    if (selectedId) {
      const updatedShapes = shapes.filter(s => s.id !== selectedId)
      setShapes(updatedShapes)
      addToHistory(updatedShapes)
      setSelectedId(null)
      toast({ title: "Deleted" })
    }
  }

  const handleTransformEnd = (id: string) => {
    const node = layerRef.current.findOne('#' + id)
    if (node) {
      const updatedShapes = shapes.map(shape => {
        if (shape.id === id) {
          return {
            ...shape,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            scaleX: node.scaleX(),
            scaleY: node.scaleY(),
            width: shape.width ? node.width() * node.scaleX() : shape.width,
            height: shape.height ? node.height() * node.scaleY() : shape.height,
          }
        }
        return shape
      })
      setShapes(updatedShapes)
      addToHistory(updatedShapes)
    }
  }

  const updateNote = async (id: string, updates: Partial<Note>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (!response.ok) throw new Error('Failed')
      const result = await response.json()
      const updatedNote = result.success ? result.data : result
      setNotes(notes.map(note => note._id === id ? updatedNote : note))
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const deleteNote = async (id: string) => {
    try {
      await fetch(`${API_BASE_URL}/notes/${id}`, { method: 'DELETE' })
      setNotes(notes.filter(note => note._id !== id))
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const bringToFront = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notes/${id}/bring-to-front`, { method: 'PUT' })
      const result = await response.json()
      const updatedNote = result.success ? result.data : result
      setNotes(notes.map(note => note._id === id ? updatedNote : note))
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const tools = [
    { icon: Hand, value: 'select', label: 'Select (V)' },
    { icon: Minus, value: 'line', label: 'Line (L)' },
    { icon: ArrowRight, value: 'arrow', label: 'Arrow (A)' },
    { icon: Pen, value: 'pen', label: 'Pen (P)' },
    { icon: Type, value: 'text', label: 'Text (T)' },
  ]

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#f5f5f5] dark:bg-gray-900 touch-manipulation">
      {/* Figma-style Toolbar */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-2 sm:px-4 py-1.5 sm:py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
            <h1 className="text-xs sm:text-sm font-semibold mr-2 sm:mr-4 whitespace-nowrap">Board</h1>

            {/* Tools */}
            <div className="flex items-center gap-0.5 sm:gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 sm:p-1">
              {tools.map((tool) => {
                const Icon = tool.icon
                return (
                  <Button
                    key={tool.value}
                    variant={selectedTool === tool.value ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedTool(tool.value as Tool)}
                    title={tool.label}
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 active:scale-95"
                  >
                    <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                )
              })}
            </div>

            {/* Shapes Dropdown */}
            <div className="relative ml-1 sm:ml-2 menu-container">
              <Button
                variant={showShapeMenu ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setShowShapeMenu(!showShapeMenu)
                  setShowNoteMenu(false)
                }}
                className="h-7 sm:h-8 gap-1 sm:gap-2 px-2 sm:px-3 active:scale-95"
              >
                <Square className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Shapes</span>
              </Button>
              {showShapeMenu && (
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg p-2 w-64 z-50 menu-container">
                  <div className="text-xs font-semibold mb-2 text-gray-600 dark:text-gray-400">Select Shape Type:</div>
                  <div className="grid grid-cols-2 gap-1">
                    {SHAPE_TYPES.map((shape) => (
                      <button
                        key={shape.type}
                        onClick={() => {
                          setSelectedShapeType(shape.type)
                          // Determine the tool type based on shape
                          if (shape.type.includes('circle')) {
                            setSelectedTool('circle')
                          } else if (shape.type === 'triangle') {
                            setSelectedTool('triangle')
                          } else if (shape.type === 'star') {
                            setSelectedTool('star')
                          } else {
                            setSelectedTool('rectangle')
                          }
                          setShowShapeMenu(false)
                          toast({ title: `${shape.label} selected` })
                        }}
                        className={`px-3 py-2 text-xs rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-left ${
                          selectedShapeType === shape.type ? 'bg-blue-100 dark:bg-blue-900 font-semibold' : ''
                        }`}
                      >
                        {shape.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Notes Dropdown */}
            <div className="relative menu-container">
              <Button
                variant={showNoteMenu ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setShowNoteMenu(!showNoteMenu)
                  setShowShapeMenu(false)
                }}
                className="h-7 sm:h-8 gap-1 sm:gap-2 px-2 sm:px-3 active:scale-95"
              >
                <NoteIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Notes</span>
              </Button>
              {showNoteMenu && (
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg p-2 sm:p-3 w-72 sm:w-80 z-50 max-h-[400px] sm:max-h-[500px] overflow-y-auto menu-container">
                  {/* Day Notes */}
                  <div className="mb-4">
                    <div className="text-xs font-semibold mb-2 text-gray-600 dark:text-gray-400">📅 Days of Week</div>
                    <div className="grid grid-cols-2 gap-2">
                      {DAY_NOTES.map((template) => (
                        <button
                          key={template.day}
                          onClick={() => createNote(template)}
                          className={`px-3 py-2 text-xs rounded border-2 hover:scale-105 transition-transform text-left font-medium bg-gradient-to-br ${template.gradient} text-black`}
                          style={{ borderColor: template.color }}
                        >
                          <span className="text-base">{template.emoji}</span> {template.day}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Plain Note */}
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => createNote()}
                      className="w-full px-3 py-2 text-xs rounded border-2 border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-left font-medium"
                    >
                      📝 Plain Sticky Note
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="sm" onClick={undo} disabled={historyStep === 0} className="h-7 sm:h-8 px-2 sm:px-3 active:scale-95">
              <Undo className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
              <span className="hidden md:inline">Undo</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={redo} disabled={historyStep >= history.length - 1} className="h-7 sm:h-8 px-2 sm:px-3 active:scale-95">
              <Redo className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
              <span className="hidden md:inline">Redo</span>
            </Button>
            {selectedId && (
              <>
                <Button variant="ghost" size="sm" onClick={() => {
                  const shape = shapes.find(s => s.id === selectedId)
                  if (shape) setCopiedShape(shape)
                }} className="h-7 sm:h-8 px-2 sm:px-3 active:scale-95 hidden sm:flex">
                  <Copy className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                  <span className="hidden md:inline">Copy</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={deleteSelected} className="h-7 sm:h-8 px-2 sm:px-3 text-red-600 active:scale-95">
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Canvas - Clean white background */}
      <div className="absolute inset-0 pt-12">
        <Stage
          ref={stageRef}
          width={canvasSize.width}
          height={canvasSize.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{
            cursor: selectedTool === 'select' ? 'default' :
                    selectedTool === 'pen' ? 'crosshair' :
                    selectedTool === 'text' ? 'text' :
                    'crosshair'
          }}
          className="bg-white dark:bg-gray-900"
        >
          <Layer ref={layerRef}>
            {shapes.map((shape) => {
              const commonProps = {
                key: shape.id,
                id: shape.id,
                draggable: selectedTool === 'select',
                onClick: () => setSelectedId(shape.id),
                onTap: () => setSelectedId(shape.id),
                onDragEnd: () => handleTransformEnd(shape.id),
                onTransformEnd: () => handleTransformEnd(shape.id),
              }

              if (shape.type === 'rectangle') {
                return <Rect {...commonProps} x={shape.x} y={shape.y} width={shape.width || 0} height={shape.height || 0} fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth} rotation={shape.rotation || 0} scaleX={shape.scaleX || 1} scaleY={shape.scaleY || 1} />
              } else if (shape.type === 'circle') {
                return <Circle {...commonProps} x={shape.x} y={shape.y} radius={shape.radius || 0} fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth} scaleX={shape.scaleX || 1} scaleY={shape.scaleY || 1} />
              } else if (shape.type === 'triangle') {
                return <RegularPolygon {...commonProps} x={shape.x} y={shape.y} sides={3} radius={shape.radius || 0} fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth} rotation={shape.rotation || 0} scaleX={shape.scaleX || 1} scaleY={shape.scaleY || 1} />
              } else if (shape.type === 'star') {
                return <KonvaStar {...commonProps} x={shape.x} y={shape.y} numPoints={5} innerRadius={shape.innerRadius || 0} outerRadius={shape.outerRadius || 0} fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth} rotation={shape.rotation || 0} scaleX={shape.scaleX || 1} scaleY={shape.scaleY || 1} />
              } else if (shape.type === 'line') {
                return <Line {...commonProps} x={shape.x} y={shape.y} points={shape.points || []} stroke={shape.stroke} strokeWidth={shape.strokeWidth} scaleX={shape.scaleX || 1} scaleY={shape.scaleY || 1} />
              } else if (shape.type === 'arrow') {
                return <Arrow {...commonProps} x={shape.x} y={shape.y} points={shape.points || []} stroke={shape.stroke} strokeWidth={shape.strokeWidth} pointerLength={10} pointerWidth={10} scaleX={shape.scaleX || 1} scaleY={shape.scaleY || 1} />
              } else if (shape.type === 'pen') {
                return <Line {...commonProps} x={shape.x} y={shape.y} points={shape.points || []} stroke={shape.stroke} strokeWidth={shape.strokeWidth} lineCap="round" lineJoin="round" tension={0.5} scaleX={shape.scaleX || 1} scaleY={shape.scaleY || 1} />
              } else if (shape.type === 'text') {
                return <Text {...commonProps} x={shape.x} y={shape.y} text={shape.text || ''} fontSize={20} fill={shape.stroke} width={shape.width || 200} scaleX={shape.scaleX || 1} scaleY={shape.scaleY || 1} />
              }
              return null
            })}

            {currentShape && (
              <>
                {currentShape.type === 'rectangle' && <Rect x={currentShape.x} y={currentShape.y} width={currentShape.width || 0} height={currentShape.height || 0} fill={currentShape.fill} stroke={currentShape.stroke} strokeWidth={currentShape.strokeWidth} />}
                {currentShape.type === 'circle' && <Circle x={currentShape.x} y={currentShape.y} radius={currentShape.radius || 0} fill={currentShape.fill} stroke={currentShape.stroke} strokeWidth={currentShape.strokeWidth} />}
                {currentShape.type === 'triangle' && <RegularPolygon x={currentShape.x} y={currentShape.y} sides={3} radius={currentShape.radius || 0} fill={currentShape.fill} stroke={currentShape.stroke} strokeWidth={currentShape.strokeWidth} />}
                {currentShape.type === 'star' && <KonvaStar x={currentShape.x} y={currentShape.y} numPoints={5} innerRadius={currentShape.innerRadius || 0} outerRadius={currentShape.outerRadius || 0} fill={currentShape.fill} stroke={currentShape.stroke} strokeWidth={currentShape.strokeWidth} />}
                {(currentShape.type === 'line' || currentShape.type === 'arrow' || currentShape.type === 'pen') && currentShape.points && (
                  <Line x={currentShape.x} y={currentShape.y} points={currentShape.points} stroke={currentShape.stroke} strokeWidth={currentShape.strokeWidth} lineCap={currentShape.type === 'pen' ? 'round' : 'butt'} lineJoin={currentShape.type === 'pen' ? 'round' : 'miter'} pointerLength={currentShape.type === 'arrow' ? 10 : 0} pointerWidth={currentShape.type === 'arrow' ? 10 : 0} tension={currentShape.type === 'pen' ? 0.5 : 0} />
                )}
              </>
            )}

            <Transformer ref={transformerRef} boundBoxFunc={(oldBox, newBox) => newBox.width < 5 || newBox.height < 5 ? oldBox : newBox} />
          </Layer>
        </Stage>

        {/* Sticky Notes */}
        <DndProvider backend={HTML5Backend}>
          <div className="absolute inset-0 pointer-events-none">
            <div className="relative w-full h-full pointer-events-auto">
              {notes.map((note, index) => {
                // Some responses might not include a stable `_id` (or it may be nested differently).
                // Use a robust fallback key to ensure React has a unique key for each child.
                const key = (note as any)._id ?? (note as any).id ?? `note-${index}`
                const idProp = (note as any)._id ?? (note as any).id ?? key

                return (
                  <StickyNote
                    key={key}
                    id={idProp}
                    text={note.text}
                    color={note.color}
                    position={note.position}
                    size={note.size}
                    zIndex={note.zIndex}
                    onUpdate={updateNote}
                    onDelete={deleteNote}
                    onBringToFront={bringToFront}
                  />
                )
              })}
            </div>
          </div>
        </DndProvider>
      </div>

      {/* Stats */}
      <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border text-[10px] sm:text-xs">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-muted-foreground whitespace-nowrap">
            {shapes.length} • {notes.length} • <span className="font-semibold text-foreground">{selectedTool}</span>
          </span>
          {selectedId && (
            <span className="text-blue-600 dark:text-blue-400 font-medium hidden sm:inline">
              Selected
            </span>
          )}
        </div>
      </div>

      {/* Keyboard Shortcuts Help - Hide on mobile */}
      <div className="hidden md:block absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border text-[10px] sm:text-xs text-muted-foreground max-w-xs">
        <div className="font-semibold mb-1 text-foreground">⌨️ Shortcuts:</div>
        <div className="grid grid-cols-2 gap-x-3 sm:gap-x-4 gap-y-0.5">
          <span>V - Select</span><span>S - Shapes</span>
          <span>L - Line</span><span>A - Arrow</span>
          <span>P - Pen</span><span>T - Text</span>
          <span>N - Notes</span><span>Del - Delete</span>
        </div>
      </div>
    </div>
  )
}

export default function BoardPage() {
  return <WhiteboardCanvas />
}
