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
        console.log('🎯 beforeinstallprompt event fired')
        e.preventDefault()
        setDeferredPrompt(e)

        // Check if user has already dismissed the prompt
        const dismissed = localStorage.getItem('pwa-install-dismissed')
        const dismissedTime = localStorage.getItem('pwa-install-dismissed-time')

        // Show again after 7 days if dismissed
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
        const shouldShowAgain = !dismissed || (dismissedTime && parseInt(dismissedTime) < sevenDaysAgo)

        if (shouldShowAgain) {
          console.log('📱 Showing PWA install prompt')
          // Show after 3 seconds for better UX
          setTimeout(() => {
            setShowInstallPrompt(true)
          }, 3000)
        } else {
          console.log('❌ PWA install prompt dismissed by user')
        }
      }

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

      // Listen for successful app installation
      window.addEventListener('appinstalled', () => {
        console.log('✅ PWA installed successfully')
        setShowInstallPrompt(false)
        setDeferredPrompt(null)
        localStorage.removeItem('pwa-install-dismissed')
        localStorage.removeItem('pwa-install-dismissed-time')
      })

      // Check if already installed
      if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('✅ App is running in standalone mode (already installed)')
      }

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
    localStorage.setItem('pwa-install-dismissed-time', Date.now().toString())
    console.log('❌ PWA install prompt dismissed')
  }

  if (!showInstallPrompt) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in-0 duration-200">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleDismiss}
      />
      <div className="relative bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-5 w-full max-w-md mx-4 sm:mx-auto animate-in zoom-in-95 duration-200">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-8 w-8 rounded-full hover:bg-background/50"
          onClick={handleDismiss}
        >
          <X className="w-4 h-4" />
          <span className="sr-only">Close</span>
        </Button>

        {/* Icon and title */}
        <div className="flex flex-col items-center text-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-purple-600 to-pink-500 flex items-center justify-center mb-3 shadow-lg">
            <Download className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-1">
            Install SaveIt.AI
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Get quick access from your home screen. Works offline and loads instantly.
          </p>
        </div>

        {/* Features list */}
        <div className="space-y-2 mb-4 bg-background/30 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs">✓</span>
            </div>
            <span className="text-muted-foreground">Works offline</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs">✓</span>
            </div>
            <span className="text-muted-foreground">Instant loading</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs">✓</span>
            </div>
            <span className="text-muted-foreground">No app store needed</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleInstallClick}
            className="flex-1 bg-gradient-to-r from-primary via-purple-600 to-pink-500 hover:opacity-90 transition-opacity text-white font-semibold shadow-lg"
            size="lg"
          >
            <Download className="w-4 h-4 mr-2" />
            Install App
          </Button>
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="flex-1 border-border/50 hover:bg-background/50"
            size="lg"
          >
            Maybe Later
          </Button>
        </div>

        {/* Small print */}
        <p className="text-xs text-center text-muted-foreground/60 mt-3">
          Free to install • No signup required
        </p>
      </div>
    </div>
  )
}
