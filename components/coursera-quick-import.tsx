"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { GraduationCap, Sparkles, Loader2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface CourseraQuickImportProps {
  onSuccess: () => void
}

export function CourseraQuickImport({ onSuccess }: CourseraQuickImportProps) {
  const { toast } = useToast()
  const [url, setUrl] = useState('')
  const [userRole, setUserRole] = useState<'beginner' | 'junior' | 'senior' | 'executive'>('beginner')
  const [targetSkill, setTargetSkill] = useState('')
  const [loading, setLoading] = useState(false)
  const [analyzed, setAnalyzed] = useState<any>(null)
  const [creating, setCreating] = useState(false)

  const handleAnalyze = async () => {
    if (!url) {
      toast({
        title: "URL Required",
        description: "Please enter a Coursera course URL",
        variant: "destructive"
      })
      return
    }

    // Validate Coursera URL - accept any coursera.org link
    if (!url.toLowerCase().includes('coursera.org')) {
      toast({
        title: "Invalid Coursera URL",
        description: "Please enter a valid Coursera URL (must contain coursera.org)",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    setAnalyzed(null)

    try {
      const token = localStorage.getItem('saveit_token')
      if (!token) {
        throw new Error('Authentication required')
      }

      // Clean and validate URL
      let cleanUrl = url.trim()

      // Add https:// if missing
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = 'https://' + cleanUrl
      }

      // Update the URL state with cleaned version
      setUrl(cleanUrl)

      const response = await fetch('/api/courses/analyze-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          url: cleanUrl,
          userRole,
          targetSkillLevel: targetSkill
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed')
      }

      if (data.success && data.data) {
        setAnalyzed(data.data)
        toast({
          title: "✨ Analysis Complete!",
          description: `Found ${data.data.modules?.length || 0} modules with ${data.data.totalLessons || 0} lessons`
        })
      } else {
        throw new Error('No data received')
      }
    } catch (error: any) {
      console.error('Analysis error:', error)
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze course",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!analyzed) return

    setCreating(true)
    try {
      const token = localStorage.getItem('saveit_token')

      const response = await fetch('/api/courses/create-from-structure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ courseData: analyzed })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Creation failed')
      }

      if (data.success) {
        toast({
          title: "✅ Course Created!",
          description: `Successfully created with ${data.data.totalModules || 0} modules`
        })
        setUrl('')
        setAnalyzed(null)
        onSuccess()
      } else {
        throw new Error('Creation failed')
      }
    } catch (error: any) {
      console.error('Creation error:', error)
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create course",
        variant: "destructive"
      })
    } finally {
      setCreating(false)
    }
  }

  const handleReset = () => {
    setUrl('')
    setAnalyzed(null)
    setUserRole('beginner')
    setTargetSkill('')
  }

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <GraduationCap className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Coursera Quick Import</CardTitle>
            <CardDescription>AI-powered course import with instant module extraction</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!analyzed ? (
          <>
            <div>
              <Label htmlFor="coursera-url" className="text-sm font-medium">Coursera Course URL</Label>
              <Input
                id="coursera-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.coursera.org/learn/machine-learning"
                className="mt-1.5"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Paste any Coursera course URL to automatically extract complete structure
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="role" className="text-sm font-medium">Your Level</Label>
                <Select value={userRole} onValueChange={(value: any) => setUserRole(value)} disabled={loading}>
                  <SelectTrigger id="role" className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="junior">Junior</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="target" className="text-sm font-medium">Target Skill (Optional)</Label>
                <Input
                  id="target"
                  value={targetSkill}
                  onChange={(e) => setTargetSkill(e.target.value)}
                  placeholder="e.g., Full-stack dev"
                  className="mt-1.5"
                  disabled={loading}
                />
              </div>
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={loading || !url}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Course...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze & Extract
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div>
                    <h4 className="font-semibold text-green-600 dark:text-green-400">Analysis Complete!</h4>
                    <p className="text-sm text-muted-foreground mt-1">{analyzed.courseTitle}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {analyzed.category && (
                      <Badge variant="outline" className="text-xs">
                        {analyzed.category}
                      </Badge>
                    )}
                    {analyzed.level && (
                      <Badge variant="outline" className="text-xs">
                        {analyzed.level}
                      </Badge>
                    )}
                    {analyzed.duration && (
                      <Badge variant="outline" className="text-xs">
                        ⏱️ {analyzed.duration}
                      </Badge>
                    )}
                  </div>

                  {analyzed.instructor && (
                    <p className="text-sm text-muted-foreground">
                      👨‍🏫 Instructor: {analyzed.instructor}
                    </p>
                  )}

                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div className="text-center p-2 bg-background rounded">
                      <div className="text-2xl font-bold text-primary">{analyzed.modules?.length || 0}</div>
                      <div className="text-xs text-muted-foreground">Modules</div>
                    </div>
                    <div className="text-center p-2 bg-background rounded">
                      <div className="text-2xl font-bold text-purple-600">{analyzed.totalLessons || 0}</div>
                      <div className="text-xs text-muted-foreground">Lessons</div>
                    </div>
                    <div className="text-center p-2 bg-background rounded">
                      <div className="text-2xl font-bold text-pink-600">{analyzed.totalProjects || 0}</div>
                      <div className="text-xs text-muted-foreground">Projects</div>
                    </div>
                  </div>

                  {analyzed.source && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                      <AlertCircle className="w-3 h-3" />
                      <span>
                        Source: {analyzed.source === 'coursera_api_and_ai' ? 'Coursera API + AI Enhanced' :
                                analyzed.source === 'coursera_api_fallback' ? 'Coursera API' : 'AI Extraction'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={creating}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={creating}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Create Course
                  </>
                )}
              </Button>
            </div>

            {analyzed.url && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => window.open(analyzed.url, '_blank')}
              >
                <ExternalLink className="w-3 h-3 mr-1.5" />
                View Original Course
              </Button>
            )}
          </div>
        )}

        {/* Info banner */}
        <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" />
            <div>
              <p className="font-medium text-foreground mb-1">How it works:</p>
              <ul className="space-y-0.5 list-disc list-inside">
                <li>Connects to Coursera API for course metadata</li>
                <li>AI extracts complete syllabus structure</li>
                <li>Automatically creates all modules and lessons</li>
                <li>Personalized based on your experience level</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
