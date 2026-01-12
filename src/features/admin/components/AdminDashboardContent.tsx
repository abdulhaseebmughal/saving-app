/**
 * Admin Dashboard Content Component
 * Optimized with memoization and lazy loading
 */

'use client'

import { useState, memo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, RefreshCw, LogOut, Users, FileText, StickyNote, BookOpen, FolderOpen, File, Building, Briefcase, Crown } from 'lucide-react'
import type { AdminDashboardData, Collection } from '@/shared/types'
import { COLLECTIONS } from '@/lib/constants'
import { PremiumGoalsTab } from './PremiumGoalsTab'

interface AdminDashboardContentProps {
  data: AdminDashboardData
  onDelete: (collection: Collection, itemId: string) => Promise<boolean>
  onRefresh: () => void
  onLogout: () => void
  isLoading: boolean
}

// Memoized data table component
const DataTable = memo(({
  collection,
  items,
  onDelete
}: {
  collection: Collection
  items: any[]
  onDelete: (id: string) => void
}) => {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No items found</p>
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item._id}
          className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">
              {item.name || item.title || item.email || item.filename || item.content?.substring(0, 50)}
            </p>
            {item.email && (
              <p className="text-sm text-muted-foreground">{item.email}</p>
            )}
            {item.description && (
              <p className="text-sm text-muted-foreground truncate">{item.description}</p>
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(item._id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  )
})

DataTable.displayName = 'DataTable'

export function AdminDashboardContent({
  data,
  onDelete,
  onRefresh,
  onLogout,
  isLoading,
}: AdminDashboardContentProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const handleDelete = async (collection: Collection, itemId: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await onDelete(collection, itemId)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Users },
    { id: 'premium-goals', label: 'Premium & Goals', icon: Crown },
    { id: COLLECTIONS.USERS, label: 'Users', icon: Users, count: data.stats.totalUsers },
    { id: COLLECTIONS.ITEMS, label: 'Items', icon: FileText, count: data.stats.totalItems },
    { id: COLLECTIONS.NOTES, label: 'Notes', icon: StickyNote, count: data.stats.totalNotes },
    { id: COLLECTIONS.DIARY_NOTES, label: 'Diary', icon: BookOpen, count: data.stats.totalDiaryNotes },
    { id: COLLECTIONS.PROJECTS, label: 'Projects', icon: FolderOpen, count: data.stats.totalProjects },
    { id: COLLECTIONS.FILES, label: 'Files', icon: File, count: data.stats.totalFiles },
    { id: COLLECTIONS.ORGANIZATIONS, label: 'Organizations', icon: Building, count: data.stats.totalOrganizations },
    { id: COLLECTIONS.INDUSTRIES, label: 'Industries', icon: Briefcase, count: data.stats.totalIndustries },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage all application data</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={onRefresh} disabled={isLoading} variant="outline">
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={onLogout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tabs.slice(1).map((tab) => {
              const Icon = tab.icon
              return (
                <Card key={tab.id} className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setActiveTab(tab.id)}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">{tab.label}</CardTitle>
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{tab.count || 0}</div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Data Tables */}
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start flex-wrap h-auto">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count !== undefined && (
                    <Badge variant="secondary" className="ml-1">
                      {tab.count}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            <CardContent className="pt-6">
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">System Stats</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Users:</span>
                        <span className="font-medium">{data.stats.totalUsers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Content:</span>
                        <span className="font-medium">
                          {data.stats.totalItems + data.stats.totalNotes + data.stats.totalDiaryNotes}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Admin Data</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Your Items:</span>
                        <span className="font-medium">{data.stats.adminItems}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Your Notes:</span>
                        <span className="font-medium">{data.stats.adminNotes}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="premium-goals">
                <PremiumGoalsTab />
              </TabsContent>

              <TabsContent value={COLLECTIONS.USERS}>
                <DataTable
                  collection={COLLECTIONS.USERS}
                  items={data.users}
                  onDelete={(id) => handleDelete(COLLECTIONS.USERS, id)}
                />
              </TabsContent>

              <TabsContent value={COLLECTIONS.ITEMS}>
                <DataTable
                  collection={COLLECTIONS.ITEMS}
                  items={data.items}
                  onDelete={(id) => handleDelete(COLLECTIONS.ITEMS, id)}
                />
              </TabsContent>

              <TabsContent value={COLLECTIONS.NOTES}>
                <DataTable
                  collection={COLLECTIONS.NOTES}
                  items={data.notes}
                  onDelete={(id) => handleDelete(COLLECTIONS.NOTES, id)}
                />
              </TabsContent>

              <TabsContent value={COLLECTIONS.DIARY_NOTES}>
                <DataTable
                  collection={COLLECTIONS.DIARY_NOTES}
                  items={data.diaryNotes}
                  onDelete={(id) => handleDelete(COLLECTIONS.DIARY_NOTES, id)}
                />
              </TabsContent>

              <TabsContent value={COLLECTIONS.PROJECTS}>
                <DataTable
                  collection={COLLECTIONS.PROJECTS}
                  items={data.projects}
                  onDelete={(id) => handleDelete(COLLECTIONS.PROJECTS, id)}
                />
              </TabsContent>

              <TabsContent value={COLLECTIONS.FILES}>
                <DataTable
                  collection={COLLECTIONS.FILES}
                  items={data.files}
                  onDelete={(id) => handleDelete(COLLECTIONS.FILES, id)}
                />
              </TabsContent>

              <TabsContent value={COLLECTIONS.ORGANIZATIONS}>
                <DataTable
                  collection={COLLECTIONS.ORGANIZATIONS}
                  items={data.organizations}
                  onDelete={(id) => handleDelete(COLLECTIONS.ORGANIZATIONS, id)}
                />
              </TabsContent>

              <TabsContent value={COLLECTIONS.INDUSTRIES}>
                <DataTable
                  collection={COLLECTIONS.INDUSTRIES}
                  items={data.industries}
                  onDelete={(id) => handleDelete(COLLECTIONS.INDUSTRIES, id)}
                />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
