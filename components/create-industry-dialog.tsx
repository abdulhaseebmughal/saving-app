"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { FolderOpen, Palette } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://saving-app-backend-six.vercel.app/api'

const INDUSTRY_ICONS = [
  { icon: <FolderOpen className="h-5 w-5" />, value: "folder" },
  { icon: "💼", value: "briefcase" },
  { icon: "🏢", value: "building" },
  { icon: "🎨", value: "art" },
  { icon: "💻", value: "tech" },
  { icon: "📱", value: "mobile" },
  { icon: "🎓", value: "education" },
  { icon: "🏥", value: "health" },
  { icon: "🏪", value: "retail" },
  { icon: "🍔", value: "food" },
  { icon: "✈️", value: "travel" },
  { icon: "⚡", value: "energy" },
]

const COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b",
  "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"
]

interface CreateIndustryDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateIndustryDialog({ open, onClose, onSuccess }: CreateIndustryDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedIcon, setSelectedIcon] = useState("folder")
  const [selectedColor, setSelectedColor] = useState(COLORS[0])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Industry name is required",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_BASE_URL}/industries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('saveit_token')}`
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          icon: selectedIcon,
          color: selectedColor
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to create industry')
      }

      toast({
        title: "Success",
        description: "Industry created successfully"
      })

      // Reset form
      setName("")
      setDescription("")
      setSelectedIcon("folder")
      setSelectedColor(COLORS[0])

      onSuccess()
      onClose()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create industry",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Industry</DialogTitle>
          <DialogDescription>
            Create a new industry category to organize your files
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
              Industry Name
            </label>
            <Input
              id="name"
              type="text"
              placeholder="e.g., Technology, Healthcare, Finance"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
              Description (Optional)
            </label>
            <Input
              id="description"
              type="text"
              placeholder="Brief description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Icon
            </label>
            <div className="grid grid-cols-6 gap-2">
              {INDUSTRY_ICONS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setSelectedIcon(item.value)}
                  className={`p-2 rounded-md border-2 transition-colors ${
                    selectedIcon === item.value
                      ? 'border-primary bg-accent'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                  disabled={isSubmitting}
                >
                  <div className="text-xl flex items-center justify-center">
                    {typeof item.icon === 'string' ? item.icon : item.icon}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-md transition-all ${
                    selectedColor === color
                      ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  disabled={isSubmitting}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Creating..." : "Create Industry"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
