/**
 * Application Constants
 */

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 30000,
} as const

export const COLLECTIONS = {
  USERS: 'users',
  ITEMS: 'items',
  NOTES: 'notes',
  DIARY_NOTES: 'diarynotes',
  PROJECTS: 'projects',
  FILES: 'files',
  ORGANIZATIONS: 'organizations',
  INDUSTRIES: 'industries',
} as const

export const AUTH_CONFIG = {
  TOKEN_KEY: 'auth_token',
  USER_KEY: 'user_data',
} as const

export const STICKY_NOTE_COLORS = [
  '#fef9c3', // Yellow
  '#bbf7d0', // Green
  '#bfdbfe', // Blue
  '#fecaca', // Red
  '#fbcfe8', // Pink
  '#ddd6fe', // Purple
  '#fed7aa', // Orange
  '#e0e7ff', // Indigo
] as const

export type Collection = typeof COLLECTIONS[keyof typeof COLLECTIONS]
