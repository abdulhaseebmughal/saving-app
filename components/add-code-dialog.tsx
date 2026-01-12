"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { saveItem, analyzeCode as analyzeCodeAPI, optimizeCode as optimizeCodeAPI, updateThumbnail } from "@/lib/api"
import { CodePreview } from "@/components/code-preview"
import { Loader2, Upload, Camera, Sparkles, Info, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import html2canvas from "html2canvas"

interface AddCodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AddCodeDialog({ open, onOpenChange, onSuccess }: AddCodeDialogProps) {
  const [code, setCode] = useState("")
  const [title, setTitle] = useState("")
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [optimizing, setOptimizing] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [savedItemId, setSavedItemId] = useState<string | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  const handleAnalyze = async () => {
    if (!code.trim()) {
      toast.error("Please enter some code first")
      return
    }

    // Basic validation - check if code has some substance
    if (code.trim().length < 10) {
      toast.error("Please enter a more substantial code snippet")
      return
    }

    setAnalyzing(true)
    try {
      const result = await analyzeCodeAPI(code)

      if (!result) {
        throw new Error("No analysis result received")
      }

      setAnalysis(result)

      // Auto-generate title if not provided
      if (!title && result.summary) {
        setTitle(result.summary.substring(0, 100))
      }

      toast.success(
        `✨ Code analyzed! Detected ${result.codeLanguage || 'Unknown'} ${
          result.framework ? `(${result.framework})` : ''
        }`
      )
    } catch (error) {
      console.error("Analysis error:", error)
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to analyze code. Please check your connection and try again."
      )
    } finally {
      setAnalyzing(false)
    }
  }

  const handleOptimize = async () => {
    if (!code.trim()) {
      toast.error("Please enter some code first")
      return
    }

    if (!analysis) {
      toast.error("Please analyze the code first to enable optimization")
      return
    }

    setOptimizing(true)
    try {
      const result = await optimizeCodeAPI(code, analysis.codeLanguage || 'javascript')

      if (!result || !result.optimizedCode) {
        throw new Error("No optimized code received")
      }

      const oldQuality = analysis.codeQuality || 0
      setCode(result.optimizedCode)

      // Re-analyze optimized code
      const newAnalysis = await analyzeCodeAPI(result.optimizedCode)
      setAnalysis(newAnalysis)

      const newQuality = newAnalysis.codeQuality || 0
      const improvement = newQuality - oldQuality

      toast.success(
        improvement > 0
          ? `✨ Code optimized! Quality improved by ${improvement} points`
          : "✨ Code optimized successfully!"
      )
    } catch (error) {
      console.error("Optimization error:", error)
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to optimize code. The AI service may be temporarily unavailable."
      )
    } finally {
      setOptimizing(false)
    }
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setThumbnailFile(file)
      const reader = new FileReader()
      reader.onload = () => {
        setThumbnailPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const capturePreview = async () => {
    if (!previewRef.current) return null

    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
      })
      return canvas.toDataURL('image/png')
    } catch (error) {
      console.error("Screenshot error:", error)
      return null
    }
  }

  const handleSave = async () => {
    if (!code.trim()) {
      toast.error("Please enter some code")
      return
    }

    if (code.trim().length < 10) {
      toast.error("Please enter a more substantial code snippet")
      return
    }

    setLoading(true)
    try {
      // Auto-analyze if not already analyzed
      let finalAnalysis = analysis
      if (!finalAnalysis) {
        toast.info("Analyzing code before saving...")
        try {
          finalAnalysis = await analyzeCodeAPI(code)
          setAnalysis(finalAnalysis)
        } catch (error) {
          console.error("Auto-analysis failed:", error)
          // Continue with basic save even if analysis fails
          finalAnalysis = {
            codeLanguage: 'unknown',
            componentPreview: false,
            summary: title || "Code snippet",
          }
        }
      }

      // Prepare title
      const finalTitle = title?.trim() || finalAnalysis.summary || "Code snippet"

      // Save the code
      const savedItem = await saveItem({
        type: finalAnalysis.componentPreview ? "component" : "code",
        content: code,
        title: finalTitle,
      })

      setSavedItemId(savedItem.id)

      // Handle thumbnail upload/capture
      let thumbnailData = thumbnailPreview

      if (!thumbnailData && finalAnalysis.componentPreview && previewRef.current) {
        // Auto-capture preview for previewable components
        toast.info("Capturing component preview...")
        try {
          thumbnailData = await capturePreview()
        } catch (error) {
          console.error("Screenshot failed:", error)
          // Continue without thumbnail if capture fails
        }
      }

      if (thumbnailData && savedItem.id) {
        try {
          await updateThumbnail(savedItem.id, thumbnailData)
        } catch (error) {
          console.error("Thumbnail upload failed:", error)
          // Don't fail the save if thumbnail upload fails
        }
      }

      toast.success(
        `✨ ${finalAnalysis.componentPreview ? 'Component' : 'Code'} saved successfully!`
      )
      onSuccess?.()
      handleClose()
    } catch (error) {
      console.error("Save error:", error)
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save code. Please check your connection and try again."
      )
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setCode("")
    setTitle("")
    setAnalysis(null)
    setThumbnailFile(null)
    setThumbnailPreview(null)
    setSavedItemId(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Code Component</DialogTitle>
          <DialogDescription>
            Paste your code below. AI will detect the language, analyze quality, and provide optimization suggestions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="title">Title (Optional)</Label>
            <Input
              id="title"
              placeholder="Enter a title or let AI generate one..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Code Input */}
          <div className="space-y-2">
            <Label htmlFor="code">Code</Label>
            <Textarea
              id="code"
              placeholder="Paste your React, JavaScript, Python, or any other code here..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="font-mono min-h-[200px]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleAnalyze}
              variant="outline"
              disabled={analyzing || !code.trim()}
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Info className="h-4 w-4 mr-2" />
                  Analyze Code
                </>
              )}
            </Button>

            {analysis && (
              <Button
                onClick={handleOptimize}
                variant="outline"
                disabled={optimizing}
              >
                {optimizing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Optimize Code
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Analysis Results */}
          {analysis && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="capitalize">
                      {analysis.codeLanguage}
                    </Badge>
                    {analysis.framework && (
                      <Badge variant="outline">{analysis.framework}</Badge>
                    )}
                    {analysis.codeQuality && (
                      <Badge
                        variant={analysis.codeQuality >= 70 ? "default" : "destructive"}
                      >
                        Quality: {analysis.codeQuality}/100
                      </Badge>
                    )}
                  </div>
                  {analysis.summary && (
                    <p className="text-sm text-muted-foreground">{analysis.summary}</p>
                  )}
                  {analysis.optimizationSuggestions && analysis.optimizationSuggestions.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium mb-1">Optimization Suggestions:</p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {analysis.optimizationSuggestions.map((suggestion: string, index: number) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysis.dependencies && analysis.dependencies.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Dependencies: {analysis.dependencies.join(', ')}</p>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Code Preview */}
          {code && analysis && (
            <div ref={previewRef}>
              <CodePreview
                code={code}
                language={analysis.codeLanguage || 'javascript'}
                isPreviewable={analysis.componentPreview}
                onOptimize={handleOptimize}
                optimizing={optimizing}
              />
            </div>
          )}

          {/* Thumbnail Upload */}
          <div className="space-y-2">
            <Label>Thumbnail (Optional)</Label>
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="hidden"
                id="thumbnail-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('thumbnail-upload')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </Button>
              {analysis?.componentPreview && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={capturePreview}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Auto Capture
                </Button>
              )}
            </div>
            {thumbnailPreview && (
              <img
                src={thumbnailPreview}
                alt="Thumbnail preview"
                className="w-full max-w-xs h-auto rounded-lg border"
              />
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || !code.trim()}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Code"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
