"use client"

import { useState, useRef, useEffect } from "react"
import { useDrag } from "react-dnd"
import { motion } from "framer-motion"
import { Trash2, GripVertical, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface StickyNoteProps {
  id: string
  text: string
  color: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  zIndex: number
  onUpdate: (id: string, updates: Partial<{ text: string; position: { x: number; y: number }; color: string; size: { width: number; height: number } }>) => void
  onDelete: (id: string) => void
  onBringToFront: (id: string) => void
}

const COLOR_MAP: Record<string, { bg: string; shadow: string }> = {
  '#fef08a': { bg: 'bg-yellow-200', shadow: 'shadow-yellow-300/50' },
  '#fecaca': { bg: 'bg-red-200', shadow: 'shadow-red-300/50' },
  '#bfdbfe': { bg: 'bg-blue-200', shadow: 'shadow-blue-300/50' },
  '#bbf7d0': { bg: 'bg-green-200', shadow: 'shadow-green-300/50' },
  '#ddd6fe': { bg: 'bg-purple-200', shadow: 'shadow-purple-300/50' },
  '#fed7aa': { bg: 'bg-orange-200', shadow: 'shadow-orange-300/50' },
  '#fbcfe8': { bg: 'bg-pink-200', shadow: 'shadow-pink-300/50' },
  '#d1d5db': { bg: 'bg-gray-200', shadow: 'shadow-gray-300/50' },
}

export function StickyNote({
  id,
  text,
  color,
  position,
  size,
  zIndex,
  onUpdate,
  onDelete,
  onBringToFront
}: StickyNoteProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [localText, setLocalText] = useState(text)
  const noteRef = useRef<HTMLDivElement>(null)

  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: 'NOTE',
    item: { id, position },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset()
      if (delta) {
        const newX = Math.round(position.x + delta.x)
        const newY = Math.round(position.y + delta.y)
        onUpdate(id, { position: { x: newX, y: newY } })
      }
    },
  }), [id, position])

  useEffect(() => {
    setLocalText(text)
  }, [text])

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalText(e.target.value)
  }

  const handleBlur = () => {
    setIsEditing(false)
    if (localText !== text) {
      onUpdate(id, { text: localText })
    }
  }

  const handleMouseDown = () => {
    onBringToFront(id)
  }

  const colorClasses = COLOR_MAP[color] || COLOR_MAP['#fef08a']

  return (
    <motion.div
      ref={noteRef}
      initial={{ scale: 0, rotate: -10 }}
      animate={{
        scale: 1,
        rotate: 0,
        opacity: isDragging ? 0.5 : 1
      }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="absolute cursor-move"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex: zIndex,
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        ref={drag}
        className={`w-full h-full ${colorClasses.bg} rounded-lg shadow-xl ${colorClasses.shadow} border-t-4 border-white/50 transform rotate-1 hover:rotate-0 transition-all duration-200 flex flex-col`}
      >
        {/* Header with drag handle */}
        <div className="flex items-center justify-between p-2 cursor-move border-b border-black/5">
          <GripVertical className="w-4 h-4 text-gray-600" />
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-black/10"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(id)
              }}
            >
              <Trash2 className="w-3 h-3 text-gray-700" />
            </Button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 p-3 overflow-hidden">
          {isEditing ? (
            <Textarea
              value={localText}
              onChange={handleTextChange}
              onBlur={handleBlur}
              className="w-full h-full resize-none bg-transparent border-none focus:outline-none focus:ring-0 text-gray-800 font-handwriting text-base"
              placeholder="Write your note..."
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div
              className="w-full h-full overflow-auto whitespace-pre-wrap break-words text-gray-800 font-handwriting text-base cursor-text"
              onClick={() => setIsEditing(true)}
            >
              {text || "Click to add text..."}
            </div>
          )}
        </div>

        {/* Footer with subtle texture */}
        <div className="h-2 bg-gradient-to-b from-transparent to-black/5 rounded-b-lg" />
      </div>
    </motion.div>
  )
}
