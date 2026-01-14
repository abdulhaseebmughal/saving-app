"use client"

import { useState, useEffect } from 'react'
import { getCourses, deleteCourse } from '@/lib/learning-api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search, Clock, CheckCircle2, Pause, AlertCircle, Trash2, Edit, ExternalLink } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { CreateCourseDialog } from '@/components/create-course-dialog'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { renderCourseIcon } from '@/lib/course-icons'

export default function CoursesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [courses, setCourses] = useState<any[]>([])
  const [filteredCourses, setFilteredCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  useEffect(() => {
    loadCourses()
  }, [])

  useEffect(() => {
    filterCourses()
  }, [courses, searchQuery, statusFilter])

  const loadCourses = async () => {
    try {
      const response = await getCourses()
      if (response.success) {
        setCourses(response.data)
      }
    } catch (error) {
      console.error('Error loading courses:', error)
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const filterCourses = () => {
    let filtered = [...courses]

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredCourses(filtered)
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This will also delete all sub-courses.`)) {
      return
    }

    try {
      const response = await deleteCourse(id)
      if (response.success) {
        toast({
          title: "Deleted",
          description: "Course deleted successfully"
        })
        loadCourses()
      } else {
        throw new Error(response.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete course",
        variant: "destructive"
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'In Progress':
        return <Clock className="w-4 h-4" />
      case 'Completed':
        return <CheckCircle2 className="w-4 h-4" />
      case 'On Hold':
        return <Pause className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'Completed':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'On Hold':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
      default:
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading courses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">My Courses</h1>
            <p className="text-muted-foreground">
              {courses.length} {courses.length === 1 ? 'course' : 'courses'} in total
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            New Course
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
              <Search className="w-5 h-5 text-muted-foreground" />
            </div>
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="On Hold">On Hold</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="text-sm text-muted-foreground mb-2 font-medium">Total</div>
            <div className="text-3xl font-bold text-foreground">{courses.length}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/30 rounded-xl p-5 shadow-sm hover:shadow-md hover:shadow-blue-500/10 transition-all">
            <div className="text-sm text-blue-500 mb-2 font-medium">In Progress</div>
            <div className="text-3xl font-bold text-foreground">
              {courses.filter(c => c.status === 'In Progress').length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/30 rounded-xl p-5 shadow-sm hover:shadow-md hover:shadow-yellow-500/10 transition-all">
            <div className="text-sm text-yellow-500 mb-2 font-medium">Pending</div>
            <div className="text-3xl font-bold text-foreground">
              {courses.filter(c => c.status === 'Pending').length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30 rounded-xl p-5 shadow-sm hover:shadow-md hover:shadow-green-500/10 transition-all">
            <div className="text-sm text-green-500 mb-2 font-medium">Completed</div>
            <div className="text-3xl font-bold text-foreground">
              {courses.filter(c => c.status === 'Completed').length}
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course._id}
                className="bg-gradient-to-br from-card to-card/80 border border-border rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20 hover:scale-[1.02] transition-all duration-300 group"
              >
                {/* Card Header */}
                <div className="p-6 pb-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10" style={{ color: course.color || '#6366f1' }}>
                        {renderCourseIcon(course.icon, 'w-6 h-6')}
                      </div>
                      <Badge variant="outline" className={getStatusColor(course.status)}>
                        {getStatusIcon(course.status)}
                        <span className="ml-1 text-xs">{course.status}</span>
                      </Badge>
                    </div>
                  </div>

                  <Link href={`/learning/courses/${course._id}`}>
                    <h3 className="font-bold text-xl text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors cursor-pointer">
                      {course.title}
                    </h3>
                  </Link>

                  {course.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {course.description}
                    </p>
                  )}

                  {course.category && (
                    <Badge variant="secondary" className="text-xs mb-3">
                      {course.category}
                    </Badge>
                  )}

                  {/* Progress Bar */}
                  {course.totalSubCourses > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-muted-foreground">
                          {course.completedSubCourses} of {course.totalSubCourses} modules
                        </span>
                        <span className="font-semibold text-foreground">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-primary via-purple-600 to-pink-500 h-2.5 rounded-full transition-all duration-500 ease-out shadow-lg shadow-primary/50"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Meta Info */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                    {course.duration && <span>{course.duration}</span>}
                    {course.instructor && <span>by {course.instructor}</span>}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => router.push(`/learning/courses/${course._id}`)}
                      className="flex-1"
                    >
                      View Details
                    </Button>
                    {course.url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(course.url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(course._id, course.title)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gradient-to-br from-card to-card/50 border-2 border-dashed border-border rounded-2xl">
            <div className="bg-muted/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="flex items-center justify-center w-full h-full">
                <AlertCircle className="w-10 h-10 text-muted-foreground" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">No courses found</h3>
            <p className="text-muted-foreground mb-6 text-lg max-w-md mx-auto">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters to see more results'
                : 'Start your learning journey by creating your first course'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Button onClick={() => setShowCreateDialog(true)} size="lg" className="shadow-lg">
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Course
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Create Course Dialog */}
      <CreateCourseDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={() => {
          setShowCreateDialog(false)
          loadCourses()
        }}
      />
    </div>
  )
}
