/**
 * Admin Shortcut Component - Optimized
 * Keyboard shortcut: Ctrl + Shift + A
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ADMIN_CONFIG } from '@/lib/config/admin.config'

export function AdminShortcut() {
  const router = useRouter()

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const { key, ctrl, shift, alt } = ADMIN_CONFIG.shortcut

      const isMatch =
        e.key === key &&
        e.ctrlKey === ctrl &&
        e.shiftKey === shift &&
        e.altKey === alt

      if (isMatch) {
        e.preventDefault()
        router.push('/admin')
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [router])

  return null
}
