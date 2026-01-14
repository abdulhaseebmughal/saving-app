"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCourses, getNextCourse, getTechnologies } from '@/lib/learning-api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, BookOpen, Code, TrendingUp, Clock, CheckCircle2, Pause, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { renderCourseIcon } from '@/lib/course-icons'
import { CourseraQuickImport } from '@/components/coursera-quick-import'

export default function LearningDashboard() {
  const router = useRouter()
  const [courses, setCourses] = useState<any[]>([])
  const [nextCourse, setNextCourse] = useState<any>(null)
  const [technologies, setTechnologies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [coursesRes, nextCourseRes, techRes] = await Promise.all([
        getCourses(),
        getNextCourse(),
        getTechnologies()
      ])

      if (coursesRes.success) setCourses(coursesRes.data)
      if (nextCourseRes.success) setNextCourse(nextCourseRes.data)
      if (techRes.success) setTechnologies(techRes.data)
    } catch (error) {
      console.error('Error loading learning data:', error)
    } finally {
      setLoading(false)
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

  const stats = {
    total: courses.length,
    inProgress: courses.filter(c => c.status === 'In Progress').length,
    completed: courses.filter(c => c.status === 'Completed').length,
    technologies: technologies.length,
    learning: technologies.filter(t => t.status === 'learning').length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading learning dashboard...</p>
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
            <h1 className="text-4xl font-bold text-foreground mb-2">Learning Hub</h1>
            <p className="text-muted-foreground">Track your courses, technologies, and learning progress</p>
          </div>
        </div>

        {/* Coursera Quick Import Section */}
        <div className="mb-8">
          <CourseraQuickImport onSuccess={loadData} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-xl p-5 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-2 text-muted-foreground mb-3">
              <BookOpen className="w-5 h-5" />
              <span className="text-sm font-medium">Total Courses</span>
            </div>
            <div className="text-3xl font-bold text-foreground">{stats.total}</div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/30 rounded-xl p-5 shadow-sm hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
            <div className="flex items-center gap-2 text-blue-500 mb-3">
              <Clock className="w-5 h-5" />
              <span className="text-sm font-medium">In Progress</span>
            </div>
            <div className="text-3xl font-bold text-foreground">{stats.inProgress}</div>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30 rounded-xl p-5 shadow-sm hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300">
            <div className="flex items-center gap-2 text-green-500 mb-3">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">Completed</span>
            </div>
            <div className="text-3xl font-bold text-foreground">{stats.completed}</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/30 rounded-xl p-5 shadow-sm hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
            <div className="flex items-center gap-2 text-purple-500 mb-3">
              <Code className="w-5 h-5" />
              <span className="text-sm font-medium">Technologies</span>
            </div>
            <div className="text-3xl font-bold text-foreground">{stats.technologies}</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/30 rounded-xl p-5 shadow-sm hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300">
            <div className="flex items-center gap-2 text-orange-500 mb-3">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium">Learning Now</span>
            </div>
            <div className="text-3xl font-bold text-foreground">{stats.learning}</div>
          </div>
        </div>

        {/* Next Course */}
        {nextCourse && (
          <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 border-2 border-primary/30 rounded-2xl p-8 mb-8 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="bg-primary/20 text-primary border-primary/40 font-semibold">
                    Up Next
                  </Badge>
                  <Badge variant="outline" className={getStatusColor(nextCourse.status)}>
                    {nextCourse.status}
                  </Badge>
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-3">{nextCourse.title}</h2>
                <p className="text-muted-foreground mb-5 text-lg">{nextCourse.description}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-5">
                  {nextCourse.duration && (
                    <span className="font-medium">Duration: {nextCourse.duration}</span>
                  )}
                  {nextCourse.category && (
                    <span className="font-medium">Category: {nextCourse.category}</span>
                  )}
                </div>
                {nextCourse.progress > 0 && (
                  <div className="mb-5">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground font-medium">Progress</span>
                      <span className="font-bold text-foreground text-base">{nextCourse.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-primary via-purple-600 to-pink-500 h-3 rounded-full transition-all duration-500 ease-out shadow-lg shadow-primary/50"
                        style={{ width: `${nextCourse.progress}%` }}
                      />
                    </div>
                  </div>
                )}
                <Button onClick={() => router.push(`/learning/courses/${nextCourse._id}`)} size="lg" className="shadow-lg">
                  Continue Learning
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/learning/courses">
            <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors cursor-pointer group">
              <BookOpen className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold text-foreground mb-2">My Courses</h3>
              <p className="text-muted-foreground text-sm">Manage your learning courses and track progress</p>
            </div>
          </Link>

          <Link href="/learning/technologies">
            <div className="bg-card border border-border rounded-lg p-6 hover:border-purple-500/50 transition-colors cursor-pointer group">
              <Code className="w-12 h-12 text-purple-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Technologies</h3>
              <p className="text-muted-foreground text-sm">Track frameworks, libraries, and tools you're learning</p>
            </div>
          </Link>

          <Link href="/learning/roadmap">
            <div className="bg-card border border-border rounded-lg p-6 hover:border-pink-500/50 transition-colors cursor-pointer group">
              <TrendingUp className="w-12 h-12 text-pink-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Learning Roadmap</h3>
              <p className="text-muted-foreground text-sm">Visualize your learning journey and goals</p>
            </div>
          </Link>
        </div>

        {/* Recent Courses */}
        {courses.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">Recent Courses</h2>
              <Link href="/learning/courses">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.slice(0, 6).map((course: any) => (
                <Link href={`/learning/courses/${course._id}`} key={course._id}>
                  <div className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-primary/10" style={{ color: course.color || '#6366f1' }}>
                          {renderCourseIcon(course.icon, 'w-5 h-5')}
                        </div>
                        <Badge variant="outline" className={getStatusColor(course.status)}>
                          {getStatusIcon(course.status)}
                          <span className="ml-1">{course.status}</span>
                        </Badge>
                      </div>
                    </div>

                    <h3 className="font-semibold text-foreground mb-2 line-clamp-1">{course.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{course.description}</p>

                    {course.progress > 0 && (
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-semibold text-foreground">{course.progress}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5">
                          <div
                            className="bg-primary h-1.5 rounded-full transition-all"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {courses.length === 0 && (
          <div className="text-center py-12">
            <div className="flex items-center justify-center mb-4">
              <BookOpen className="w-16 h-16 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No courses yet</h3>
            <p className="text-muted-foreground mb-4">Start your learning journey by creating your first course</p>
            <Button onClick={() => router.push('/learning/courses')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Course
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
