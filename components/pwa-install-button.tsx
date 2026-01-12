"use client"

import { useState, useEffect } from 'react'
import { Download, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    // Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
      toast({
        title: "App Installed!",
        description: "SaveIt.AI has been installed successfully.",
      })
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [toast])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast({
        title: "Already Installed",
        description: "The app is already installed or not available for installation.",
        variant: "default"
      })
      return
    }

    setIsInstalling(true)

    try {
      // Show the install prompt
      deferredPrompt.prompt()

      // Wait for the user's response
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        toast({
          title: "Installing...",
          description: "SaveIt.AI is being installed.",
        })
      } else {
        toast({
          title: "Installation Cancelled",
          description: "You can install the app later from the settings.",
          variant: "default"
        })
      }

      // Clear the prompt
      setDeferredPrompt(null)
    } catch (error) {
      console.error('Installation error:', error)
      toast({
        title: "Installation Error",
        description: "Failed to install the app. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsInstalling(false)
    }
  }

  // Don't show the button if already installed
  if (isInstalled) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="gap-2"
      >
        <Check className="w-4 h-4" />
        Installed
      </Button>
    )
  }

  // Don't show if install prompt is not available
  if (!deferredPrompt && !isInstalled) {
    return null
  }

  return (
    <Button
      onClick={handleInstallClick}
      disabled={isInstalling}
      variant="default"
      size="sm"
      className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
    >
      <Download className="w-4 h-4" />
      {isInstalling ? 'Installing...' : 'Install App'}
    </Button>
  )
}
