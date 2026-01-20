"use client"

import { useSidebar } from "@/contexts/sidebar-context"
import { cn } from "@/lib/utils"

export function MainContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar()

  return (
    <main
      className={cn(
        "min-h-screen bg-background pt-16 lg:pt-0 transition-all duration-300",
        collapsed ? "lg:pl-20" : "lg:pl-64"
      )}
    >
      {children}
    </main>
  )
}
