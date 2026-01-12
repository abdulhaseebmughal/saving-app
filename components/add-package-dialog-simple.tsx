"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { savePackage } from "@/lib/api"
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

interface AddPackageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AddPackageDialog({ open, onOpenChange, onSuccess }: AddPackageDialogProps) {
  const [npmUrl, setNpmUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [extractedData, setExtractedData] = useState<any>(null)

  const handleExtract = async () => {
    if (!npmUrl.trim()) {
      toast.error("Please enter an NPM package link")
      return
    }

    if (!npmUrl.includes('npmjs.com/package/')) {
      toast.error("Please provide a valid NPM package link (https://www.npmjs.com/package/...)")
      return
    }

    setExtracting(true)
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/packages/extract-npm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('saveit_token')}`
        },
        body: JSON.stringify({ url: npmUrl }),
      })

      if (!response.ok) {
        throw new Error('Failed to extract package')
      }

      const result = await response.json()
      setExtractedData(result.data)
      toast.success("Package information extracted successfully!")
    } catch (error) {
      console.error("Extract error:", error)
      toast.error("Failed to extract package information")
    } finally {
      setExtracting(false)
    }
  }

  const handleSave = async () => {
    if (!extractedData) {
      toast.error("Please extract package information first")
      return
    }

    setLoading(true)
    try {
      await savePackage({
        ...extractedData,
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
    setNpmUrl("")
    setExtractedData(null)
    onOpenChange(false)
  }

  const categoryColors: Record<string, string> = {
    ui: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    "state-management": "bg-purple-500/10 text-purple-600 border-purple-500/20",
    routing: "bg-green-500/10 text-green-600 border-green-500/20",
    animation: "bg-pink-500/10 text-pink-600 border-pink-500/20",
    utility: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    testing: "bg-red-500/10 text-red-600 border-red-500/20",
    "build-tool": "bg-orange-500/10 text-orange-600 border-orange-500/20",
    database: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    authentication: "bg-teal-500/10 text-teal-600 border-teal-500/20",
    api: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
    styling: "bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-500/20",
    validation: "bg-lime-500/10 text-lime-600 border-lime-500/20",
    charts: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    forms: "bg-violet-500/10 text-violet-600 border-violet-500/20",
    icons: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    date: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    other: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Package from NPM</DialogTitle>
          <DialogDescription>
            Paste an NPM package link and AI will automatically extract all the details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="npmUrl">NPM Package Link</Label>
            <div className="flex gap-2">
              <Input
                id="npmUrl"
                placeholder="https://www.npmjs.com/package/react-live"
                value={npmUrl}
                onChange={(e) => setNpmUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleExtract()}
                className="flex-1"
              />
              <Button onClick={handleExtract} disabled={extracting || !npmUrl.trim()}>
                {extracting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Extract
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Example: https://www.npmjs.com/package/react-live
            </p>
          </div>

          {extractedData && (
            <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-lg">{extractedData.name}</h3>
                    <Badge variant="outline">v{extractedData.version}</Badge>
                  </div>
                  {extractedData.category && (
                    <Badge className={categoryColors[extractedData.category] || categoryColors.other} variant="outline">
                      {extractedData.category.replace('-', ' ')}
                    </Badge>
                  )}
                </div>
              </div>

              {extractedData.purpose && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Purpose</p>
                  <p className="text-sm">{extractedData.purpose}</p>
                </div>
              )}

              {extractedData.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                  <p className="text-sm text-muted-foreground">{extractedData.description}</p>
                </div>
              )}

              {extractedData.tags && extractedData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {extractedData.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {extractedData.installCommand && (
                <div className="bg-background border rounded p-2">
                  <code className="text-xs">{extractedData.installCommand}</code>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || !extractedData}>
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
