/**
 * Admin Configuration
 * Use environment variables for security
 */

export const ADMIN_CONFIG = {
  email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || '',
  password: process.env.ADMIN_PASSWORD || '', // Server-side only

  // Admin features
  features: {
    canDeleteUsers: true,
    canViewAllData: true,
    canEditAnyItem: true,
    canExportData: true,
  },

  // Keyboard shortcut
  shortcut: {
    key: 'A',
    ctrl: true,
    shift: true,
    alt: false,
  },
} as const

export type AdminConfig = typeof ADMIN_CONFIG
