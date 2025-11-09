"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Trash2, GripVertical, Pin, Palette, Type, Maximize2, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface StickyNoteProps {
  id: string
  text: string
  color: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  zIndex: number
  onUpdate: (updates: any) => void
  onDelete: () => void
}

const FONT_SIZES = [
  { label: 'S', value: 'text-sm', className: 'text-sm' },
  { label: 'M', value: 'text-base', className: 'text-base' },
  { label: 'L', value: 'text-lg', className: 'text-lg' },
]

const NOTE_COLORS = [
  { color: '#fef08a', name: 'Yellow' },
  { color: '#fbcfe8', name: 'Pink' },
  { color: '#bfdbfe', name: 'Blue' },
  { color: '#bbf7d0', name: 'Green' },
  { color: '#ddd6fe', name: 'Purple' },
  { color: '#fed7aa', name: 'Orange' },
  { color: '#fecaca', name: 'Red' },
  { color: '#99f6e4', name: 'Teal' },
]

export function StickyNote({
  id,
  text,
  color,
  position,
  size,
  zIndex,
  onUpdate,
  onDelete,
}: StickyNoteProps) {
  const [localText, setLocalText] = useState(text)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [currentZIndex, setCurrentZIndex] = useState(zIndex)
  const [fontSize, setFontSize] = useState('text-base')
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const noteRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setLocalText(text)
  }, [text])

  useEffect(() => {
    setCurrentZIndex(zIndex)
  }, [zIndex])

  // Drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('textarea') ||
        (e.target as HTMLElement).closest('button') ||
        (e.target as HTMLElement).classList.contains('resize-handle')) {
      return
    }

    setIsDragging(true)
    setCurrentZIndex(Date.now())
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
    onUpdate({ zIndex: Date.now() })
  }, [position, onUpdate])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && !isResizing) {
      const newX = Math.max(0, e.clientX - dragOffset.x)
      const newY = Math.max(0, e.clientY - dragOffset.y)

      if (noteRef.current) {
        noteRef.current.style.left = `${newX}px`
        noteRef.current.style.top = `${newY}px`
      }
    }

    if (isResizing) {
      const deltaX = e.clientX - resizeStart.x
      const deltaY = e.clientY - resizeStart.y
      const newWidth = Math.max(200, resizeStart.width + deltaX)
      const newHeight = Math.max(150, resizeStart.height + deltaY)

      if (noteRef.current) {
        noteRef.current.style.width = `${newWidth}px`
        noteRef.current.style.height = `${newHeight}px`
      }
    }
  }, [isDragging, isResizing, dragOffset, resizeStart])

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (isDragging) {
      setIsDragging(false)
      const newX = Math.max(0, e.clientX - dragOffset.x)
      const newY = Math.max(0, e.clientY - dragOffset.y)
      onUpdate({ position: { x: newX, y: newY } })
    }

    if (isResizing) {
      setIsResizing(false)
      const deltaX = e.clientX - resizeStart.x
      const deltaY = e.clientY - resizeStart.y
      const newWidth = Math.max(200, resizeStart.width + deltaX)
      const newHeight = Math.max(150, resizeStart.height + deltaY)
      onUpdate({ size: { width: newWidth, height: newHeight } })
    }
  }, [isDragging, isResizing, dragOffset, resizeStart, onUpdate])

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp])

  // Resize handler
  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsResizing(true)
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    })
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalText(e.target.value)
  }

  const handleBlur = () => {
    if (localText !== text) {
      onUpdate({ text: localText })
    }
  }

  const handleColorChange = (newColor: string) => {
    onUpdate({ color: newColor })
    setShowColorPicker(false)
  }

  const handleFontSizeChange = (newSize: string) => {
    setFontSize(newSize)
  }

  return (
    <motion.div
      ref={noteRef}
      initial={{ scale: 0, rotate: -5, opacity: 0 }}
      animate={{
        scale: 1,
        rotate: 0,
        opacity: isDragging ? 0.85 : 1,
        height: isMinimized ? 'auto' : size.height
      }}
      exit={{ scale: 0, rotate: 5, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="absolute select-none touch-manipulation group"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: isMinimized ? 'auto' : size.height,
        zIndex: currentZIndex,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        className="w-full h-full rounded-xl shadow-2xl border-t-4 border-white/60 flex flex-col overflow-hidden backdrop-blur-sm transition-all duration-200 hover:shadow-3xl"
        style={{
          backgroundColor: color,
          transform: isDragging || isResizing ? 'scale(1.02)' : 'scale(1)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-2 sm:px-3 py-1.5 sm:py-2 border-b border-black/10 bg-black/5 cursor-grab active:cursor-grabbing">
          <div className="flex items-center gap-1 sm:gap-2">
            <GripVertical className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700 opacity-50" />
            <Pin className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-gray-700 opacity-50" />
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1">
            {/* Font Size Toggle */}
            <div className="hidden sm:flex items-center gap-0.5 mr-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {FONT_SIZES.map((fs) => (
                <button
                  key={fs.value}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleFontSizeChange(fs.className)
                  }}
                  className={`w-5 h-5 rounded text-[10px] font-bold transition-colors ${
                    fontSize === fs.className
                      ? 'bg-black/20 text-gray-900'
                      : 'bg-black/5 text-gray-700 hover:bg-black/10'
                  }`}
                >
                  {fs.label}
                </button>
              ))}
            </div>

            {/* Color Picker */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 sm:h-6 sm:w-6 hover:bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowColorPicker(!showColorPicker)
                }}
              >
                <Palette className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-700" />
              </Button>

              {showColorPicker && (
                <div className="absolute top-full right-0 mt-1 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border z-[10000] grid grid-cols-4 gap-1.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  {NOTE_COLORS.map((c) => (
                    <button
                      key={c.color}
                      onClick={() => handleColorChange(c.color)}
                      className="w-6 h-6 rounded-md border-2 border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: c.color }}
                      title={c.name}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Minimize */}
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 sm:h-6 sm:w-6 hover:bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                setIsMinimized(!isMinimized)
              }}
            >
              {isMinimized ? (
                <Maximize2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-700" />
              ) : (
                <Minimize2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-700" />
              )}
            </Button>

            {/* Delete */}
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 sm:h-6 sm:w-6 hover:bg-red-500/20 hover:text-red-700 active:scale-95 transition-all"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
            >
              <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <>
            <div className="flex-1 p-2 sm:p-4 overflow-hidden">
              <textarea
                ref={textareaRef}
                value={localText}
                onChange={handleTextChange}
                onBlur={handleBlur}
                className={`w-full h-full resize-none bg-transparent border-none focus:outline-none text-gray-900 font-['Kalam',_'Comic_Sans_MS',_cursive] leading-relaxed placeholder:text-gray-600 ${fontSize}`}
                placeholder="Type your note here..."
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                style={{ cursor: 'text' }}
              />
            </div>

            {/* Footer gradient */}
            <div className="h-2 sm:h-3 bg-gradient-to-t from-black/10 to-transparent" />

            {/* Resize Handle */}
            <div
              className="resize-handle absolute bottom-0 right-0 w-4 h-4 sm:w-5 sm:h-5 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity"
              onMouseDown={handleResizeStart}
              style={{
                background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.2) 50%)'
              }}
            />
          </>
        )}

        {/* Minimized View */}
        {isMinimized && (
          <div className="px-3 py-2">
            <p className="text-xs text-gray-800 truncate">{text || 'Empty note'}</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
