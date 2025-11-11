"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { getAuthHeaders } from "@/lib/auth-headers"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://saving-app-backend-six.vercel.app/api'

const PROJECT_TYPES = [
  { value: 'vanilla', label: 'Vanilla JS', icon: '🟨' },
  { value: 'react', label: 'React', icon: '⚛️' },
  { value: 'nextjs', label: 'Next.js', icon: '▲' },
  { value: 'vue', label: 'Vue', icon: '💚' },
  { value: 'angular', label: 'Angular', icon: '🅰️' },
  { value: 'node', label: 'Node.js', icon: '🟢' },
  { value: 'python', label: 'Python', icon: '🐍' },
  { value: 'other', label: 'Other', icon: '📁' },
]

interface CreateProjectDialogProps {
  open: boolean
  onClose: () => void
  organizations: any[]
  onSuccess: () => void
}

export function CreateProjectDialog({ open, onClose, organizations, onSuccess }: CreateProjectDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState("other")
  const [organization, setOrganization] = useState("")
  const [url, setUrl] = useState("")
  const [repository, setRepository] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name,
          description,
          type,
          organization: organization || null,
          url,
          repository,
        })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "✅ Created!",
          description: "Project created successfully"
        })
        onSuccess()
        onClose()
        // Reset form
        setName("")
        setDescription("")
        setType("other")
        setOrganization("")
        setUrl("")
        setRepository("")
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create project",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project",
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
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome Project"
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
              placeholder="Brief description of your project"
              className="mt-1 resize-none"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="type">Project Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    <span className="flex items-center gap-2">
                      <span>{t.icon}</span>
                      <span>{t.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="organization">Organization</Label>
            <Select value={organization} onValueChange={setOrganization}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select organization (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Organization</SelectItem>
                {organizations.map((org) => (
                  <SelectItem key={org._id} value={org._id}>
                    <span className="flex items-center gap-2">
                      <span>{org.icon}</span>
                      <span>{org.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="url">Live URL</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="repository">Repository URL</Label>
            <Input
              id="repository"
              type="url"
              value={repository}
              onChange={(e) => setRepository(e.target.value)}
              placeholder="https://github.com/..."
              className="mt-1"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name} className="flex-1">
              {loading ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
