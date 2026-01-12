/**
 * Unified Package Dialog Component
 * Combines simple URL extraction and advanced manual entry
 */

'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { savePackage } from '@/lib/api'
import { Loader2, Sparkles, Link as LinkIcon, Edit3 } from 'lucide-react'
import { toast } from 'sonner'

interface PackageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const CATEGORIES = [
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
] as const

const PACKAGE_MANAGERS = [
  { value: 'npm', label: 'NPM', cmd: 'npm install' },
  { value: 'yarn', label: 'Yarn', cmd: 'yarn add' },
  { value: 'pnpm', label: 'PNPM', cmd: 'pnpm add' },
  { value: 'pip', label: 'PIP', cmd: 'pip install' },
  { value: 'composer', label: 'Composer', cmd: 'composer require' },
  { value: 'gem', label: 'Gem', cmd: 'gem install' },
  { value: 'cargo', label: 'Cargo', cmd: 'cargo add' },
] as const

export function PackageDialog({ open, onOpenChange, onSuccess }: PackageDialogProps) {
  const [mode, setMode] = useState<'simple' | 'advanced'>('simple')
  const [loading, setLoading] = useState(false)
  const [extracting, setExtracting] = useState(false)

  // Simple mode state
  const [npmUrl, setNpmUrl] = useState('')
  const [extractedData, setExtractedData] = useState<any>(null)

  // Advanced mode state
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

  const handleReset = () => {
    setNpmUrl('')
    setExtractedData(null)
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
    setLoading(false)
    setExtracting(false)
  }

  const handleClose = () => {
    handleReset()
    onOpenChange(false)
  }

  // Simple mode: Extract from NPM URL
  const handleExtract = async () => {
    if (!npmUrl.trim()) {
      toast.error('Please enter an NPM package link')
      return
    }

    if (!npmUrl.includes('npmjs.com/package/')) {
      toast.error('Please provide a valid NPM package link')
      return
    }

    setExtracting(true)
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL + '/packages/extract-npm',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('saveit_token')}`,
          },
          body: JSON.stringify({ url: npmUrl }),
        }
      )

      if (!response.ok) throw new Error('Failed to extract')

      const result = await response.json()
      setExtractedData(result.data)
      toast.success('Package extracted successfully!')
    } catch (error) {
      toast.error('Failed to extract package information')
      console.error(error)
    } finally {
      setExtracting(false)
    }
  }

  const handleSaveSimple = async () => {
    if (!extractedData) {
      toast.error('Please extract package information first')
      return
    }

    setLoading(true)
    try {
      await savePackage({
        ...extractedData,
        addedDate: new Date().toISOString(),
      })

      toast.success('Package saved successfully!')
      onSuccess?.()
      handleClose()
    } catch (error) {
      toast.error('Failed to save package')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Advanced mode: Manual entry
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveAdvanced = async () => {
    if (!formData.name || !formData.version) {
      toast.error('Please fill in package name and version')
      return
    }

    setLoading(true)
    try {
      const manager = PACKAGE_MANAGERS.find((m) => m.value === formData.packageManager)
      const installCommand = `${manager?.cmd || 'npm install'} ${formData.name}`

      await savePackage({
        ...formData,
        installCommand,
        addedDate: new Date().toISOString(),
      })

      toast.success('Package saved successfully!')
      onSuccess?.()
      handleClose()
    } catch (error) {
      toast.error('Failed to save package')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Package</DialogTitle>
          <DialogDescription>
            Extract from NPM or enter package details manually
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="simple" className="gap-2">
              <LinkIcon className="w-4 h-4" />
              Extract from URL
            </TabsTrigger>
            <TabsTrigger value="advanced" className="gap-2">
              <Edit3 className="w-4 h-4" />
              Manual Entry
            </TabsTrigger>
          </TabsList>

          {/* Simple Mode */}
          <TabsContent value="simple" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="npm-url">NPM Package URL</Label>
              <div className="flex gap-2">
                <Input
                  id="npm-url"
                  placeholder="https://www.npmjs.com/package/react"
                  value={npmUrl}
                  onChange={(e) => setNpmUrl(e.target.value)}
                  disabled={extracting || loading}
                />
                <Button
                  onClick={handleExtract}
                  disabled={extracting || loading}
                  variant="secondary"
                >
                  {extracting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Extracting
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Extract
                    </>
                  )}
                </Button>
              </div>
            </div>

            {extractedData && (
              <div className="rounded-lg border bg-card p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{extractedData.name}</h3>
                    <Badge variant="secondary">{extractedData.version}</Badge>
                  </div>
                </div>
                {extractedData.description && (
                  <p className="text-sm text-muted-foreground">
                    {extractedData.description}
                  </p>
                )}
                {extractedData.installCommand && (
                  <code className="block p-2 bg-muted rounded text-sm">
                    {extractedData.installCommand}
                  </code>
                )}
              </div>
            )}
          </TabsContent>

          {/* Advanced Mode */}
          <TabsContent value="advanced" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Package Name *</Label>
                <Input
                  id="name"
                  placeholder="react"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="version">Version *</Label>
                <Input
                  id="version"
                  placeholder="18.2.0"
                  value={formData.version}
                  onChange={(e) => handleChange('version', e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What does this package do?"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                disabled={loading}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => handleChange('category', v)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="packageManager">Package Manager</Label>
                <Select
                  value={formData.packageManager}
                  onValueChange={(v) => handleChange('packageManager', v)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PACKAGE_MANAGERS.map((pm) => (
                      <SelectItem key={pm.value} value={pm.value}>
                        {pm.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="homepage">Homepage URL</Label>
                <Input
                  id="homepage"
                  type="url"
                  placeholder="https://reactjs.org"
                  value={formData.homepage}
                  onChange={(e) => handleChange('homepage', e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="repository">Repository URL</Label>
                <Input
                  id="repository"
                  type="url"
                  placeholder="https://github.com/..."
                  value={formData.repository}
                  onChange={(e) => handleChange('repository', e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading || extracting}>
            Cancel
          </Button>
          <Button
            onClick={mode === 'simple' ? handleSaveSimple : handleSaveAdvanced}
            disabled={
              loading ||
              extracting ||
              (mode === 'simple' ? !extractedData : !formData.name || !formData.version)
            }
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Package'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
