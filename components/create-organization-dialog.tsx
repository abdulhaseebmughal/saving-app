"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { getAuthHeaders } from "@/lib/auth-headers"
import { Building2, Landmark, Store, Factory, Construction, Home, Target, Zap, Rocket, Briefcase, FolderOpen, Wrench } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://saving-app-backend-six.vercel.app/api'

const ORG_ICONS = [
  { icon: Building2, value: 'building2' },
  { icon: Landmark, value: 'landmark' },
  { icon: Store, value: 'store' },
  { icon: Factory, value: 'factory' },
  { icon: Construction, value: 'construction' },
  { icon: Home, value: 'home' },
  { icon: Target, value: 'target' },
  { icon: Zap, value: 'zap' },
  { icon: Rocket, value: 'rocket' },
  { icon: Briefcase, value: 'briefcase' },
  { icon: FolderOpen, value: 'folder' },
  { icon: Wrench, value: 'wrench' },
]
const ORG_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6']

interface CreateOrganizationDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateOrganizationDialog({ open, onClose, onSuccess }: CreateOrganizationDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [icon, setIcon] = useState("building2")
  const [color, setColor] = useState("#6366f1")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/organizations`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name, description, icon, color })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Created!",
          description: "Organization created successfully"
        })
        onSuccess()
        onClose()
        setName("")
        setDescription("")
        setIcon("building2")
        setColor("#6366f1")
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create organization",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create organization",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Organization</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Organization Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Organization"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description"
              className="mt-1 resize-none"
              rows={2}
            />
          </div>

          <div>
            <Label>Icon</Label>
            <div className="grid grid-cols-6 gap-2 mt-1">
              {ORG_ICONS.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setIcon(item.value)}
                    className={`p-2 rounded-lg border-2 transition-all flex items-center justify-center ${
                      icon === item.value ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950' : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <Label>Color</Label>
            <div className="grid grid-cols-4 gap-2 mt-1">
              {ORG_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-10 rounded-lg border-2 transition-all ${
                    color === c ? 'border-gray-900 dark:border-white scale-110' : 'border-gray-200 dark:border-gray-700'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name} className="flex-1">
              {loading ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
