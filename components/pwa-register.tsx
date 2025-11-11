"use client"

import { useEffect, useState } from 'react'
import { X, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PWARegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register service worker
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('✅ Service Worker registered:', registration.scope)

            // Check for updates periodically
            setInterval(() => {
              registration.update()
            }, 60000) // Check every minute
          })
          .catch((error) => {
            console.error('❌ Service Worker registration failed:', error)
          })
      })

      // Listen for the beforeinstallprompt event
      const handleBeforeInstallPrompt = (e: any) => {
        e.preventDefault()
        setDeferredPrompt(e)

        // Check if user has already dismissed the prompt
        const dismissed = localStorage.getItem('pwa-install-dismissed')
        if (!dismissed) {
          setShowInstallPrompt(true)
        }
      }

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

      // Listen for successful app installation
      window.addEventListener('appinstalled', () => {
        console.log('✅ PWA installed successfully')
        setShowInstallPrompt(false)
        setDeferredPrompt(null)
      })

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      }
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice
    console.log(`User response: ${outcome}`)

    // Clear the prompt
    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  if (!showInstallPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-border rounded-lg shadow-2xl p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Install SaveIt.AI</h3>
              <p className="text-xs text-muted-foreground">Quick access from your home screen</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 -mr-2 -mt-2"
            onClick={handleDismiss}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleInstallClick}
            className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
          >
            Install Now
          </Button>
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="flex-1"
          >
            Not Now
          </Button>
        </div>
      </div>
    </div>
  )
}
