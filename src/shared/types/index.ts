/**
 * Shared TypeScript Types
 */

export interface User {
  _id: string
  email: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface Item {
  _id: string
  userId: string
  type: 'link' | 'note' | 'code' | 'component'
  content: string
  title?: string
  description?: string
  image?: string
  favicon?: string
  url?: string
  tags?: string[]
  category?: string
  createdAt: string
  updatedAt: string
}

export interface Note {
  _id: string
  userId: string
  content: string
  x: number
  y: number
  width: number
  height: number
  color: string
  zIndex: number
  createdAt: string
  updatedAt: string
}

export interface DiaryNote {
  _id: string
  userId: string
  title: string
  content: string
  mood?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export interface Project {
  _id: string
  userId: string
  name: string
  description?: string
  organizationId?: string
  createdAt: string
  updatedAt: string
}

export interface Organization {
  _id: string
  userId: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface Industry {
  _id: string
  userId: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface FileItem {
  _id: string
  userId: string
  filename: string
  url: string
  size: number
  mimeType: string
  createdAt: string
  updatedAt: string
}

export interface AdminDashboardData {
  users: User[]
  items: Item[]
  notes: Note[]
  diaryNotes: DiaryNote[]
  projects: Project[]
  files: FileItem[]
  organizations: Organization[]
  industries: Industry[]
  stats: {
    totalUsers: number
    totalItems: number
    totalNotes: number
    totalDiaryNotes: number
    totalProjects: number
    totalFiles: number
    totalOrganizations: number
    totalIndustries: number
    adminItems: number
    adminNotes: number
    adminDiaryNotes: number
    adminProjects: number
  }
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
