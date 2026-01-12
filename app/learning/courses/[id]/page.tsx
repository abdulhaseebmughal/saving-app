"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getCourse, getSubCourses, createSubCourse, updateSubCourse, deleteSubCourse, completeSubCourse, updateCourse } from '@/lib/learning-api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Plus, ArrowLeft, Clock, CheckCircle2, Pause, AlertCircle, Edit, Trash2, ExternalLink, Play } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { CreateCourseDialog } from '@/components/create-course-dialog'
import Link from 'next/link'
import { renderCourseIcon } from '@/lib/course-icons'

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [course, setCourse] = useState<any>(null)
  const [subCourses, setSubCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showSubCourseDialog, setShowSubCourseDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingSubCourse, setEditingSubCourse] = useState<any>(null)
  const [subCourseForm, setSubCourseForm] = useState({
    title: '',
    description: '',
    duration: '',
    resources: '',
    notes: ''
  })

  useEffect(() => {
    if (params.id) {
      loadCourseData()
    }
  }, [params.id])

  const loadCourseData = async () => {
    try {
      const [courseRes, subCoursesRes] = await Promise.all([
        getCourse(params.id as string),
        getSubCourses(params.id as string)
      ])

      if (courseRes.success) setCourse(courseRes.data)
      if (subCoursesRes.success) setSubCourses(subCoursesRes.data)
    } catch (error) {
      console.error('Error loading course:', error)
      toast({
        title: "Error",
        description: "Failed to load course details",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSubCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const resources = subCourseForm.resources.split('\n').filter(r => r.trim())
      const response = await createSubCourse(params.id as string, {
        ...subCourseForm,
        resources
      })

      if (response.success) {
        toast({
          title: "Created!",
          description: "Sub-course created successfully"
        })
        setShowSubCourseDialog(false)
        setSubCourseForm({ title: '', description: '', duration: '', resources: '', notes: '' })
        loadCourseData()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create sub-course",
        variant: "destructive"
      })
    }
  }

  const handleUpdateSubCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSubCourse) return

    try {
      const resources = subCourseForm.resources.split('\n').filter(r => r.trim())
      const response = await updateSubCourse(editingSubCourse._id, {
        ...subCourseForm,
        resources
      })

      if (response.success) {
        toast({
          title: "Updated!",
          description: "Sub-course updated successfully"
        })
        setEditingSubCourse(null)
        setSubCourseForm({ title: '', description: '', duration: '', resources: '', notes: '' })
        loadCourseData()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update sub-course",
        variant: "destructive"
      })
    }
  }

  const handleToggleComplete = async (subCourse: any) => {
    try {
      const newStatus = subCourse.status === 'Completed' ? 'In Progress' : 'Completed'
      const response = await updateSubCourse(subCourse._id, { status: newStatus })

      if (response.success) {
        toast({
          title: newStatus === 'Completed' ? "Completed!" : "Marked as In Progress",
          description: `Sub-course marked as ${newStatus.toLowerCase()}`
        })
        loadCourseData()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update sub-course status",
        variant: "destructive"
      })
    }
  }

  const handleDeleteSubCourse = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return

    try {
      const response = await deleteSubCourse(id)
      if (response.success) {
        toast({
          title: "Deleted",
          description: "Sub-course deleted successfully"
        })
        loadCourseData()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete sub-course",
        variant: "destructive"
      })
    }
  }

  const openEditDialog = (subCourse: any) => {
    setEditingSubCourse(subCourse)
    setSubCourseForm({
      title: subCourse.title,
      description: subCourse.description || '',
      duration: subCourse.duration || '',
      resources: subCourse.resources?.join('\n') || '',
      notes: subCourse.notes || ''
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'In Progress': return <Clock className="w-4 h-4" />
      case 'Completed': return <CheckCircle2 className="w-4 h-4" />
      case 'On Hold': return <Pause className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'Completed': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'On Hold': return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
      default: return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Course not found</h2>
          <Button onClick={() => router.push('/learning/courses')}>Back to Courses</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.push('/learning/courses')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 rounded-xl bg-primary/10" style={{ color: course.color || '#6366f1' }}>
                  {renderCourseIcon(course.icon, 'w-10 h-10')}
                </div>
                <Badge variant="outline" className={getStatusColor(course.status)}>
                  {getStatusIcon(course.status)}
                  <span className="ml-1">{course.status}</span>
                </Badge>
                {course.category && (
                  <Badge variant="secondary">{course.category}</Badge>
                )}
              </div>

              <h1 className="text-4xl font-bold text-foreground mb-3">{course.title}</h1>
              {course.description && (
                <p className="text-lg text-muted-foreground mb-4">{course.description}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {course.duration && <span>Duration: {course.duration}</span>}
                {course.instructor && <span>Instructor: {course.instructor}</span>}
                {course.url && (
                  <a href={course.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                    Course Link <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            <Button variant="outline" onClick={() => setShowEditDialog(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Course
            </Button>
          </div>
        </div>

        {/* Progress */}
        {course.totalSubCourses > 0 && (
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Overall Progress</h3>
                <p className="text-sm text-muted-foreground">
                  {course.completedSubCourses} of {course.totalSubCourses} modules completed
                </p>
              </div>
              <div className="text-4xl font-bold text-foreground">{course.progress}%</div>
            </div>
            <div className="w-full bg-muted rounded-full h-4">
              <div
                className="bg-gradient-to-r from-primary via-purple-600 to-pink-500 h-4 rounded-full transition-all"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Sub-Courses */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Course Modules</h2>
            <Button onClick={() => setShowSubCourseDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Module
            </Button>
          </div>

          {subCourses.length > 0 ? (
            <div className="space-y-4">
              {subCourses.map((subCourse, index) => (
                <div
                  key={subCourse._id}
                  className={`bg-card border rounded-lg p-5 transition-all ${
                    subCourse.status === 'Completed'
                      ? 'border-green-500/20 bg-green-500/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        subCourse.status === 'Completed'
                          ? 'bg-green-500 text-white'
                          : 'bg-muted text-foreground'
                      }`}>
                        {subCourse.status === 'Completed' ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          index + 1
                        )}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground mb-1">{subCourse.title}</h3>
                          {subCourse.description && (
                            <p className="text-sm text-muted-foreground mb-2">{subCourse.description}</p>
                          )}
                          {subCourse.duration && (
                            <Badge variant="outline" className="text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              {subCourse.duration}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {subCourse.resources && subCourse.resources.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-semibold text-muted-foreground mb-1">Resources:</p>
                          <div className="flex flex-wrap gap-2">
                            {subCourse.resources.map((resource: string, idx: number) => (
                              <a
                                key={idx}
                                href={resource}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline"
                              >
                                Link {idx + 1}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant={subCourse.status === 'Completed' ? 'outline' : 'default'}
                          onClick={() => handleToggleComplete(subCourse)}
                        >
                          {subCourse.status === 'Completed' ? 'Mark Incomplete' : 'Mark Complete'}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(subCourse)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteSubCourse(subCourse._id, subCourse.title)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card border border-border rounded-lg">
              <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No modules yet</h3>
              <p className="text-muted-foreground mb-4">Add modules to break down this course into manageable parts</p>
              <Button onClick={() => setShowSubCourseDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Module
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Sub-Course Dialog */}
      <Dialog open={showSubCourseDialog || !!editingSubCourse} onOpenChange={() => {
        setShowSubCourseDialog(false)
        setEditingSubCourse(null)
        setSubCourseForm({ title: '', description: '', duration: '', resources: '', notes: '' })
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingSubCourse ? 'Edit Module' : 'Add New Module'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={editingSubCourse ? handleUpdateSubCourse : handleCreateSubCourse} className="space-y-4">
            <div>
              <Label htmlFor="title">Module Title *</Label>
              <Input
                id="title"
                value={subCourseForm.title}
                onChange={(e) => setSubCourseForm({ ...subCourseForm, title: e.target.value })}
                placeholder="Module 1: Introduction"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={subCourseForm.description}
                onChange={(e) => setSubCourseForm({ ...subCourseForm, description: e.target.value })}
                placeholder="Brief description..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={subCourseForm.duration}
                onChange={(e) => setSubCourseForm({ ...subCourseForm, duration: e.target.value })}
                placeholder="2 hours, 1 week, etc."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="resources">Resources (one per line)</Label>
              <Textarea
                id="resources"
                value={subCourseForm.resources}
                onChange={(e) => setSubCourseForm({ ...subCourseForm, resources: e.target.value })}
                placeholder="https://example.com/resource1&#10;https://example.com/resource2"
                className="mt-1"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={subCourseForm.notes}
                onChange={(e) => setSubCourseForm({ ...subCourseForm, notes: e.target.value })}
                placeholder="Personal notes..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => {
                setShowSubCourseDialog(false)
                setEditingSubCourse(null)
                setSubCourseForm({ title: '', description: '', duration: '', resources: '', notes: '' })
              }} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={!subCourseForm.title} className="flex-1">
                {editingSubCourse ? 'Update Module' : 'Add Module'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <CreateCourseDialog
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        onSuccess={() => {
          setShowEditDialog(false)
          loadCourseData()
        }}
        course={course}
      />
    </div>
  )
}
