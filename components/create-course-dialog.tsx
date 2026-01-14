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
  const [inputMode, setInputMode] = useState<'coursera' | 'manual'>('coursera')
  const [userRole, setUserRole] = useState<'beginner' | 'junior' | 'senior' | 'executive'>('beginner')
  const [targetSkillLevel, setTargetSkillLevel] = useState('')
  const [aiCourseData, setAiCourseData] = useState<any>(null)
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

  // Fetch course details from URL using advanced AI analysis
  const handleFetchFromURL = async () => {
    if (!formData.url) {
      toast({
        title: "URL Required",
        description: "Please enter a course URL first",
        variant: "destructive"
      })
      return
    }

    // Validate URL format - be flexible
    let cleanUrl = formData.url.trim()

    // Add https:// if missing
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl
    }

    // Validate URL format
    try {
      new URL(cleanUrl)
      // Update formData with cleaned URL
      setFormData({ ...formData, url: cleanUrl })
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL (e.g., coursera.org/learn/...)",
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
        body: JSON.stringify({
          url: cleanUrl,
          userRole: userRole,
          targetSkillLevel: targetSkillLevel
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to fetch course details')
      }

      if (data.success && data.data) {
        const aiData = data.data
        console.log('✅ AI Data Received:', aiData)

        // Store full AI course data for later use
        setAiCourseData(aiData)

        // Update form with basic info
        const updates: any = { ...formData }

        if (aiData.courseTitle && aiData.courseTitle.length > 3) {
          updates.title = aiData.courseTitle
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

        // Force update form data
        setFormData(updates)

        // Small delay to ensure state updates
        setTimeout(() => {
          setFormData(prev => ({...prev, ...updates}))
        }, 100)

        // Show success message with module count
        const moduleCount = aiData.modules?.length || 0
        const lessonCount = aiData.totalLessons || 0

        toast({
          title: "✨ AI Analysis Complete!",
          description: moduleCount > 0
            ? `Found ${moduleCount} modules with ${lessonCount} lessons`
            : `Course details extracted successfully`
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
    } finally {
      setFetchingAI(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let response: any

      // If AI course data with modules is available, use the advanced endpoint
      if (aiCourseData && aiCourseData.modules && aiCourseData.modules.length > 0 && !course) {
        const token = localStorage.getItem('saveit_token')

        const res = await fetch('/api/courses/create-from-structure', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            courseData: {
              ...aiCourseData,
              courseTitle: formData.title,
              description: formData.description,
              category: formData.category,
              icon: formData.icon,
              instructor: formData.instructor,
              duration: formData.duration,
              url: formData.url
            }
          })
        })

        response = await res.json()

        if (response.success) {
          toast({
            title: "✨ AI Course Created!",
            description: `Course created with ${response.data.totalModules} modules automatically`
          })
          onSuccess()
          handleClose()
          return
        }
      }

      // Standard course creation/update
      response = course
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
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="space-y-1 pb-2">
          <DialogTitle className="text-lg">{course ? 'Edit Course' : 'Create New Course'}</DialogTitle>
          <DialogDescription className="text-xs">
            {course ? 'Update course information and settings.' : 'Choose Coursera for direct import or Manual for custom entry.'}
          </DialogDescription>
        </DialogHeader>

        {/* Mode Selection Tabs */}
        <div className="flex gap-1.5 p-0.5 bg-muted rounded-lg">
          <button
            type="button"
            onClick={() => setInputMode('coursera')}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              inputMode === 'coursera'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              Coursera
            </span>
          </button>
          <button
            type="button"
            onClick={() => setInputMode('manual')}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              inputMode === 'manual'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <FileCode className="w-3.5 h-3.5" />
              Manual
            </span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Coursera Mode */}
          {inputMode === 'coursera' && (
            <div className="space-y-2.5 p-3 border rounded-lg bg-muted/20">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                <p className="text-xs text-muted-foreground">
                  AI-powered course import with smart module extraction
                </p>
              </div>

              <div>
                <Label htmlFor="url" className="text-xs">Course URL *</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://www.coursera.org/learn/machine-learning"
                  required
                  className="mt-1 text-xs h-8"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="userRole" className="text-xs">Your Level</Label>
                  <Select value={userRole} onValueChange={(value: any) => setUserRole(value)}>
                    <SelectTrigger className="mt-1 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner" className="text-xs">Beginner</SelectItem>
                      <SelectItem value="junior" className="text-xs">Junior</SelectItem>
                      <SelectItem value="senior" className="text-xs">Senior</SelectItem>
                      <SelectItem value="executive" className="text-xs">Executive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="targetSkill" className="text-xs">Target Skill (Optional)</Label>
                  <Input
                    id="targetSkill"
                    value={targetSkillLevel}
                    onChange={(e) => setTargetSkillLevel(e.target.value)}
                    placeholder="Full-stack dev"
                    className="mt-1 text-xs h-8"
                  />
                </div>
              </div>

              <Button
                type="button"
                onClick={handleFetchFromURL}
                disabled={fetchingAI || !formData.url}
                className="w-full h-8 text-xs"
              >
                {fetchingAI ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                    Analyzing Course...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 mr-1.5" />
                    Auto-Fill with AI
                  </>
                )}
              </Button>

              {aiCourseData && (
                <div className="text-xs bg-green-500/10 border border-green-500/20 p-2.5 rounded-lg space-y-1.5">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                    <span className="text-base">✓</span>
                    <span>Course Data Fetched Successfully!</span>
                  </div>

                  <div className="text-muted-foreground space-y-0.5">
                    <div>• Title: {aiCourseData.courseTitle || formData.title || 'Not found'}</div>
                    <div>• Category: {aiCourseData.category || formData.category || 'Not found'}</div>
                    {(aiCourseData.instructor || formData.instructor) && (
                      <div>• Instructor: {aiCourseData.instructor || formData.instructor}</div>
                    )}
                    {aiCourseData.modules && aiCourseData.modules.length > 0 && (
                      <div>• Modules: {aiCourseData.modules.length} • Lessons: {aiCourseData.totalLessons || 0}</div>
                    )}
                  </div>

                  <div className="text-muted-foreground font-medium pt-1 border-t border-green-500/20">
                    👇 Scroll down to review details
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Manual Mode or Filled Data */}
          <div className={`transition-all duration-300 ${
            inputMode === 'coursera' && !formData.title && !aiCourseData
              ? 'opacity-50 pointer-events-none blur-[2px]'
              : 'opacity-100'
          }`}>
          <div className={`space-y-2.5 ${
            aiCourseData ? 'ring-2 ring-green-500/20 rounded-lg p-3 bg-green-500/5' : ''
          }`}>
          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-xs">Course Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Professional Cyber Security Track"
              required
              className="mt-1 text-xs h-8"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-xs">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description..."
              className="mt-1 resize-none text-xs"
              rows={2}
            />
          </div>

          {/* Status and Category */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <Label htmlFor="status" className="text-xs">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="mt-1 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending" className="text-xs">Pending</SelectItem>
                  <SelectItem value="In Progress" className="text-xs">In Progress</SelectItem>
                  <SelectItem value="On Hold" className="text-xs">On Hold</SelectItem>
                  <SelectItem value="Completed" className="text-xs">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category" className="text-xs">Category</Label>
              <Select value={formData.category} onValueChange={handleCategoryChange}>
                <SelectTrigger className="mt-1 h-8 text-xs">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Web Development" className="text-xs">Web Dev</SelectItem>
                  <SelectItem value="Frontend" className="text-xs">Frontend</SelectItem>
                  <SelectItem value="Backend" className="text-xs">Backend</SelectItem>
                  <SelectItem value="Full Stack" className="text-xs">Full Stack</SelectItem>
                  <SelectItem value="AI/ML" className="text-xs">AI/ML</SelectItem>
                  <SelectItem value="Data Science" className="text-xs">Data Science</SelectItem>
                  <SelectItem value="Cyber Security" className="text-xs">Cyber Security</SelectItem>
                  <SelectItem value="DevOps" className="text-xs">DevOps</SelectItem>
                  <SelectItem value="Cloud Computing" className="text-xs">Cloud</SelectItem>
                  <SelectItem value="Mobile Development" className="text-xs">Mobile</SelectItem>
                  <SelectItem value="Database" className="text-xs">Database</SelectItem>
                  <SelectItem value="UI/UX" className="text-xs">UI/UX</SelectItem>
                  <SelectItem value="Programming" className="text-xs">Programming</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Duration, Instructor, Priority */}
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <Label htmlFor="duration" className="text-xs">Duration</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="8 weeks"
                className="mt-1 text-xs h-8"
              />
            </div>

            <div>
              <Label htmlFor="instructor" className="text-xs">Instructor</Label>
              <Input
                id="instructor"
                value={formData.instructor}
                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                placeholder="Name"
                className="mt-1 text-xs h-8"
              />
            </div>

            <div>
              <Label htmlFor="priority" className="text-xs">Priority</Label>
              <Input
                id="priority"
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                placeholder="0"
                className="mt-1 text-xs h-8"
              />
            </div>
          </div>

          {/* URL for Manual Mode */}
          {inputMode === 'manual' && (
            <div>
              <Label htmlFor="url-manual" className="text-xs">Course URL (Optional)</Label>
              <Input
                id="url-manual"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://example.com/course/..."
                className="mt-1 text-xs h-8"
              />
            </div>
          )}

          {/* Icon & Color Selector */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1.5 block">Icon</Label>
              <div className="grid grid-cols-8 gap-1">
                {COURSE_ICONS.map((item) => {
                  const IconComponent = item.icon
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: item.value })}
                      className={`p-1.5 rounded border transition-all flex items-center justify-center ${
                        formData.icon === item.value
                          ? 'border-primary bg-primary/10 scale-105'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <IconComponent className="w-3.5 h-3.5" />
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <Label className="text-xs mb-1.5 block">Color</Label>
              <div className="grid grid-cols-8 gap-1">
                {COURSE_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`h-7 rounded border transition-all ${
                      formData.color === color
                        ? 'border-foreground scale-105'
                        : 'border-border hover:border-foreground/50'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1 h-9 text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.title}
              className={`flex-1 h-9 text-xs transition-all ${
                aiCourseData && aiCourseData.modules?.length > 0
                  ? 'bg-green-600 hover:bg-green-700'
                  : ''
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                  Saving...
                </>
              ) : aiCourseData && aiCourseData.modules?.length > 0 ? (
                <>
                  <Sparkles className="w-3 h-3 mr-1.5" />
                  Create with {aiCourseData.modules.length} Modules
                </>
              ) : course ? (
                'Update'
              ) : (
                'Create'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
