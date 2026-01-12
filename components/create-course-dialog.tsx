"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { createCourse, updateCourse } from '@/lib/learning-api'
import {
  BookOpen, Code, GraduationCap, Target, Rocket, Brain,
  Database, Shield, Palette, Globe, Cpu, Cloud, Lock, Sparkles,
  FileCode, Wrench, Loader2
} from 'lucide-react'

interface CreateCourseDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  course?: any
}

// Icon mapping with Lucide React icons
const COURSE_ICONS = [
  { icon: BookOpen, name: 'BookOpen', value: 'BookOpen' },
  { icon: Code, name: 'Code', value: 'Code' },
  { icon: GraduationCap, name: 'GraduationCap', value: 'GraduationCap' },
  { icon: Rocket, name: 'Rocket', value: 'Rocket' },
  { icon: Brain, name: 'Brain', value: 'Brain' },
  { icon: Shield, name: 'Shield', value: 'Shield' },
  { icon: Database, name: 'Database', value: 'Database' },
  { icon: Palette, name: 'Palette', value: 'Palette' },
  { icon: Globe, name: 'Globe', value: 'Globe' },
  { icon: Cpu, name: 'Cpu', value: 'Cpu' },
  { icon: Cloud, name: 'Cloud', value: 'Cloud' },
  { icon: Lock, name: 'Lock', value: 'Lock' },
  { icon: FileCode, name: 'FileCode', value: 'FileCode' },
  { icon: Wrench, name: 'Wrench', value: 'Wrench' },
  { icon: Target, name: 'Target', value: 'Target' },
  { icon: Sparkles, name: 'Sparkles', value: 'Sparkles' },
]

// Category-based purposeful colors
const CATEGORY_COLORS = {
  'Web Development': '#3b82f6', // Blue - web/browser
  'Frontend': '#3b82f6',
  'Backend': '#10b981', // Green - server/backend
  'Full Stack': '#6366f1', // Indigo - combination
  'AI/ML': '#8b5cf6', // Purple - AI/intelligence
  'Artificial Intelligence': '#8b5cf6',
  'Machine Learning': '#8b5cf6',
  'Data Science': '#ec4899', // Pink - data analytics
  'Cyber Security': '#ef4444', // Red - security/danger
  'Security': '#ef4444',
  'DevOps': '#f59e0b', // Amber - operations
  'Cloud Computing': '#14b8a6', // Teal - cloud
  'Mobile Development': '#06b6d4', // Cyan - mobile
  'Database': '#10b981', // Green - data storage
  'UI/UX': '#ec4899', // Pink - design
  'Design': '#ec4899',
  'Programming': '#6366f1', // Indigo - general programming
  'default': '#6366f1' // Indigo as default
}

const COURSE_COLORS = Object.values(CATEGORY_COLORS).filter((v, i, a) => a.indexOf(v) === i) // Unique colors

export function CreateCourseDialog({ open, onClose, onSuccess, course }: CreateCourseDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetchingAI, setFetchingAI] = useState(false)
  const [formData, setFormData] = useState({
    title: course?.title || '',
    description: course?.description || '',
    status: course?.status || 'Pending',
    category: course?.category || '',
    icon: course?.icon || 'BookOpen',
    color: course?.color || '#6366f1',
    duration: course?.duration || '',
    instructor: course?.instructor || '',
    url: course?.url || '',
    priority: course?.priority || 0
  })

  // Auto-select color based on category
  const handleCategoryChange = (category: string) => {
    const matchedColor = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.default
    setFormData({ ...formData, category, color: matchedColor })
  }

  // Fetch course details from URL using Gemini AI
  const handleFetchFromURL = async () => {
    if (!formData.url) {
      toast({
        title: "URL Required",
        description: "Please enter a course URL first",
        variant: "destructive"
      })
      return
    }

    // Validate URL format
    try {
      new URL(formData.url)
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL (e.g., https://example.com/course)",
        variant: "destructive"
      })
      return
    }

    setFetchingAI(true)
    try {
      const token = localStorage.getItem('saveit_token')

      if (!token) {
        throw new Error('Authentication required. Please log in again.')
      }

      const response = await fetch(`/api/courses/analyze-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ url: formData.url })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to fetch course details')
      }

      if (data.success && data.data) {
        const aiData = data.data

        // Only update fields that have meaningful data from AI
        const updates: any = { ...formData }

        if (aiData.title && aiData.title.length > 3) {
          updates.title = aiData.title
        }
        if (aiData.description && aiData.description.length > 10) {
          updates.description = aiData.description
        }
        if (aiData.category) {
          updates.category = aiData.category
          updates.color = CATEGORY_COLORS[aiData.category as keyof typeof CATEGORY_COLORS] || formData.color
        }
        if (aiData.instructor) {
          updates.instructor = aiData.instructor
        }
        if (aiData.duration) {
          updates.duration = aiData.duration
        }
        if (aiData.icon) {
          updates.icon = aiData.icon
        }

        setFormData(updates)

        toast({
          title: "✨ AI Analysis Complete!",
          description: `Successfully extracted course details from ${new URL(formData.url).hostname}`
        })
      } else {
        throw new Error('No data received from AI analysis')
      }
    } catch (error: any) {
      console.error('AI Fetch Error:', error)

      toast({
        title: "AI Fetch Failed",
        description: error.message || "Could not fetch course details. Please fill manually.",
        variant: "destructive"
      })

      // Keep the URL even if fetch fails, so user can try again or fill manually
    } finally {
      setFetchingAI(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = course
        ? await updateCourse(course._id, formData)
        : await createCourse(formData)

      if (response.success) {
        toast({
          title: course ? "Updated!" : "Created!",
          description: `Course ${course ? 'updated' : 'created'} successfully`
        })
        onSuccess()
        handleClose()
      } else {
        throw new Error(response.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${course ? 'update' : 'create'} course`,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!course) {
      setFormData({
        title: '',
        description: '',
        status: 'Pending',
        category: '',
        icon: 'BookOpen',
        color: '#6366f1',
        duration: '',
        instructor: '',
        url: '',
        priority: 0
      })
    }
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{course ? 'Edit Course' : 'Create New Course'}</DialogTitle>
          <DialogDescription>
            {course ? 'Update course information and settings.' : 'Add a new course to track your learning progress. Use AI Fetch to auto-fill details from a course URL.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">Course Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Professional Cyber Security Track"
              required
              className="mt-1"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the course..."
              className="mt-1 resize-none"
              rows={3}
            />
          </div>

          {/* Status and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={handleCategoryChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Web Development">Web Development</SelectItem>
                  <SelectItem value="Frontend">Frontend</SelectItem>
                  <SelectItem value="Backend">Backend</SelectItem>
                  <SelectItem value="Full Stack">Full Stack</SelectItem>
                  <SelectItem value="AI/ML">AI/ML</SelectItem>
                  <SelectItem value="Data Science">Data Science</SelectItem>
                  <SelectItem value="Cyber Security">Cyber Security</SelectItem>
                  <SelectItem value="DevOps">DevOps</SelectItem>
                  <SelectItem value="Cloud Computing">Cloud Computing</SelectItem>
                  <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                  <SelectItem value="Database">Database</SelectItem>
                  <SelectItem value="UI/UX">UI/UX Design</SelectItem>
                  <SelectItem value="Programming">Programming</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Duration and Instructor */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="8 weeks, 40 hours, etc."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="instructor">Instructor</Label>
              <Input
                id="instructor"
                value={formData.instructor}
                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                placeholder="Instructor name"
                className="mt-1"
              />
            </div>
          </div>

          {/* URL with AI Fetch */}
          <div>
            <Label htmlFor="url">Course URL</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://udemy.com/course/..."
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleFetchFromURL}
                disabled={fetchingAI || !formData.url}
                className="shrink-0"
              >
                {fetchingAI ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Fetch
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Paste course URL and click AI Fetch to auto-fill details</p>
          </div>

          {/* Priority */}
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Input
              id="priority"
              type="number"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
              placeholder="0 (higher = more important)"
              className="mt-1"
            />
          </div>

          {/* Icon Selector */}
          <div>
            <Label>Icon</Label>
            <div className="grid grid-cols-8 gap-2 mt-2">
              {COURSE_ICONS.map((item) => {
                const IconComponent = item.icon
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: item.value })}
                    className={`p-3 rounded-lg border-2 transition-all flex items-center justify-center ${
                      formData.icon === item.value
                        ? 'border-primary bg-primary/10 scale-110'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Color Selector */}
          <div>
            <Label>Color</Label>
            <div className="grid grid-cols-8 gap-2 mt-2">
              {COURSE_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`h-10 rounded-lg border-2 transition-all ${
                    formData.color === color
                      ? 'border-foreground scale-110'
                      : 'border-border hover:border-foreground/50'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.title} className="flex-1">
              {loading ? 'Saving...' : course ? 'Update Course' : 'Create Course'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
