/**
 * Premium & Goals Tab Component
 * Shows premium status, expiry, and personal goals/todos
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Crown, Target, Plus, CheckCircle2, Circle, Trash2, Calendar } from 'lucide-react'
import { toast } from 'sonner'

interface Goal {
  id: string
  title: string
  description?: string
  completed: boolean
  createdAt: string
  completedAt?: string
}

interface PremiumStatus {
  isPremium: boolean
  expiryDate: string | null
  daysRemaining: number
}

export function PremiumGoalsTab() {
  // Premium status (you can fetch this from API)
  const [premiumStatus] = useState<PremiumStatus>({
    isPremium: true,
    expiryDate: '2026-12-31',
    daysRemaining: 360,
  })

  // Goals state
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      title: 'Complete admin redesign',
      description: 'Optimize and secure the admin panel',
      completed: true,
      createdAt: '2026-01-01',
      completedAt: '2026-01-04',
    },
    {
      id: '2',
      title: 'Implement premium features',
      description: 'Add premium subscription management',
      completed: false,
      createdAt: '2026-01-04',
    },
  ])

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newGoal, setNewGoal] = useState({ title: '', description: '' })

  const handleAddGoal = () => {
    if (!newGoal.title.trim()) {
      toast.error('Please enter a goal title')
      return
    }

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      completed: false,
      createdAt: new Date().toISOString(),
    }

    setGoals([...goals, goal])
    setNewGoal({ title: '', description: '' })
    setIsDialogOpen(false)
    toast.success('Goal added successfully!')
  }

  const handleToggleGoal = (id: string) => {
    setGoals(
      goals.map((goal) =>
        goal.id === id
          ? {
              ...goal,
              completed: !goal.completed,
              completedAt: !goal.completed ? new Date().toISOString() : undefined,
            }
          : goal
      )
    )
  }

  const handleDeleteGoal = (id: string) => {
    setGoals(goals.filter((goal) => goal.id !== id))
    toast.success('Goal deleted')
  }

  const completedGoals = goals.filter((g) => g.completed).length
  const totalGoals = goals.length
  const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Premium Status Card */}
      <Card className="border-primary/50 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Premium Status
                  {premiumStatus.isPremium && (
                    <Badge className="bg-gradient-to-r from-primary to-purple-600">
                      Active
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>Your subscription details</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-card border">
              <p className="text-sm text-muted-foreground mb-1">Status</p>
              <p className="text-2xl font-bold">
                {premiumStatus.isPremium ? (
                  <span className="text-green-600">Premium</span>
                ) : (
                  <span className="text-muted-foreground">Free</span>
                )}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-card border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Calendar className="w-4 h-4" />
                <p>Expires On</p>
              </div>
              <p className="text-2xl font-bold">
                {premiumStatus.expiryDate
                  ? new Date(premiumStatus.expiryDate).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-card border">
              <p className="text-sm text-muted-foreground mb-1">Days Remaining</p>
              <p className="text-2xl font-bold text-primary">
                {premiumStatus.daysRemaining}
              </p>
            </div>
          </div>

          {premiumStatus.isPremium && premiumStatus.daysRemaining < 30 && (
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                Your premium subscription expires soon! Renew to continue enjoying all features.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Goals Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-primary" />
              <div>
                <CardTitle>My Goals</CardTitle>
                <CardDescription>Track your personal goals and achievements</CardDescription>
              </div>
            </div>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Goal
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-3xl font-bold text-primary">{totalGoals}</p>
              <p className="text-sm text-muted-foreground mt-1">Total Goals</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-500/10">
              <p className="text-3xl font-bold text-green-600">{completedGoals}</p>
              <p className="text-sm text-muted-foreground mt-1">Completed</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-blue-500/10">
              <p className="text-3xl font-bold text-blue-600">{completionRate}%</p>
              <p className="text-sm text-muted-foreground mt-1">Success Rate</p>
            </div>
          </div>

          {/* Goals List */}
          <div className="space-y-3">
            {goals.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No goals yet. Add your first goal!</p>
              </div>
            ) : (
              goals.map((goal) => (
                <div
                  key={goal.id}
                  className={`p-4 rounded-lg border transition-all ${
                    goal.completed
                      ? 'bg-green-500/5 border-green-500/20'
                      : 'bg-card hover:bg-accent/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleGoal(goal.id)}
                      className="mt-0.5 transition-transform hover:scale-110"
                    >
                      {goal.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      ) : (
                        <Circle className="w-6 h-6 text-muted-foreground" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <h3
                        className={`font-semibold ${
                          goal.completed ? 'line-through text-muted-foreground' : ''
                        }`}
                      >
                        {goal.title}
                      </h3>
                      {goal.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {goal.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Created: {new Date(goal.createdAt).toLocaleDateString()}
                        {goal.completedAt && (
                          <span className="ml-3">
                            Completed: {new Date(goal.completedAt).toLocaleDateString()}
                          </span>
                        )}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteGoal(goal.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Goal Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Goal</DialogTitle>
            <DialogDescription>
              Set a new goal to track your progress
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="goal-title" className="text-sm font-medium">
                Goal Title *
              </label>
              <Input
                id="goal-title"
                placeholder="e.g., Complete project redesign"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="goal-description" className="text-sm font-medium">
                Description (Optional)
              </label>
              <Textarea
                id="goal-description"
                placeholder="Add more details about this goal..."
                value={newGoal.description}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, description: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddGoal}>Add Goal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
