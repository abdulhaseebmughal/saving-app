import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/sidebar"
import { MobileHeader } from "@/components/mobile-header"
import { PWARegister } from "@/components/pwa-register"
import { AuthProvider } from "@/contexts/auth-context"
import { SidebarProvider } from "@/contexts/sidebar-context"
import { AuthGuard } from "@/components/auth-guard"
import { Toaster } from "@/components/ui/toaster"
import { MainContent } from "@/components/main-content"

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
    statusBarStyle: "black-translucent",
    title: "SaveIt.AI",
    startupImage: [
      {
        url: "/icon-512.png",
        media: "(device-width: 768px) and (device-height: 1024px)",
      },
    ],
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  applicationName: "SaveIt.AI",
  keywords: ["save", "organize", "AI", "productivity", "learning", "notes", "courses"],
  authors: [{ name: "SaveIt.AI Team" }],
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
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SaveIt.AI" />
        <meta name="application-name" content="SaveIt.AI" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-TileImage" content="/icon-192.png" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <PWARegister />
        <AuthProvider>
          <SidebarProvider>
            <AuthGuard>
              <Sidebar />
              <MobileHeader />
              <MainContent>
                {children}
              </MainContent>
            </AuthGuard>
            <Toaster />
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
