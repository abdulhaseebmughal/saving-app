import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { PWARegister } from "@/components/pwa-register"
import { AuthProvider } from "@/contexts/auth-context"
import { AuthGuard } from "@/components/auth-guard"
import { AdminShortcut } from "@/components/admin-shortcut"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  preload: true,
})
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: 'swap',
  preload: false,
})

export const metadata: Metadata = {
  title: "SaveIt.AI - Smart AI-Powered Saving",
  description: "Remember, organize, and learn from everything with AI",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SaveIt.AI",
  },
  generator: 'v0.app'
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" }
  ],
  viewportFit: "cover",
  colorScheme: "dark light",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <PWARegister />
        <AuthProvider>
          <AdminShortcut />
          <AuthGuard>
            <Navbar />
            <main className="min-h-screen bg-background">{children}</main>
          </AuthGuard>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
