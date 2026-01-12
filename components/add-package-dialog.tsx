"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { savePackage } from "@/lib/api"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface AddPackageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const categories = [
  { value: 'ui', label: 'UI Components' },
  { value: 'state-management', label: 'State Management' },
  { value: 'routing', label: 'Routing' },
  { value: 'animation', label: 'Animation' },
  { value: 'utility', label: 'Utility' },
  { value: 'testing', label: 'Testing' },
  { value: 'build-tool', label: 'Build Tool' },
  { value: 'database', label: 'Database' },
  { value: 'authentication', label: 'Authentication' },
  { value: 'api', label: 'API' },
  { value: 'styling', label: 'Styling' },
  { value: 'validation', label: 'Validation' },
  { value: 'charts', label: 'Charts & Graphs' },
  { value: 'forms', label: 'Forms' },
  { value: 'icons', label: 'Icons' },
  { value: 'date', label: 'Date & Time' },
  { value: 'other', label: 'Other' },
]

const packageManagers = [
  { value: 'npm', label: 'NPM' },
  { value: 'yarn', label: 'Yarn' },
  { value: 'pnpm', label: 'PNPM' },
  { value: 'pip', label: 'PIP (Python)' },
  { value: 'composer', label: 'Composer (PHP)' },
  { value: 'gem', label: 'Gem (Ruby)' },
  { value: 'cargo', label: 'Cargo (Rust)' },
]

export function AddPackageDialog({ open, onOpenChange, onSuccess }: AddPackageDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    version: '',
    description: '',
    purpose: '',
    category: 'other',
    subCategory: '',
    packageManager: 'npm',
    homepage: '',
    repository: '',
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!formData.name || !formData.version) {
      toast.error("Please fill in package name and version")
      return
    }

    setLoading(true)
    try {
      const installCommand = `${formData.packageManager} install ${formData.name}`

      await savePackage({
        ...formData,
        installCommand,
        addedDate: new Date().toISOString(),
      })

      toast.success("Package saved successfully!")
      onSuccess?.()
      handleClose()
    } catch (error) {
      console.error("Save error:", error)
      toast.error("Failed to save package")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      version: '',
      description: '',
      purpose: '',
      category: 'other',
      subCategory: '',
      packageManager: 'npm',
      homepage: '',
      repository: '',
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Package</DialogTitle>
          <DialogDescription>
            Add a package to your collection for easy reference and management.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Package Name *</Label>
              <Input
                id="name"
                placeholder="e.g., react, axios"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="version">Version *</Label>
              <Input
                id="version"
                placeholder="e.g., 18.2.0"
                value={formData.version}
                onChange={(e) => handleChange('version', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="packageManager">Package Manager</Label>
              <Select value={formData.packageManager} onValueChange={(value) => handleChange('packageManager', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {packageManagers.map(pm => (
                    <SelectItem key={pm.value} value={pm.value}>
                      {pm.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose / Why You Use It</Label>
            <Textarea
              id="purpose"
              placeholder="e.g., For making HTTP requests to our backend API"
              value={formData.purpose}
              onChange={(e) => handleChange('purpose', e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Additional notes or description..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subCategory">Sub-category (Optional)</Label>
              <Input
                id="subCategory"
                placeholder="e.g., HTTP Client"
                value={formData.subCategory}
                onChange={(e) => handleChange('subCategory', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="homepage">Homepage URL (Optional)</Label>
              <Input
                id="homepage"
                placeholder="https://..."
                value={formData.homepage}
                onChange={(e) => handleChange('homepage', e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Package"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
