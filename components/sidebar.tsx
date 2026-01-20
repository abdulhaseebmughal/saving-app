"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  FileText,
  Code,
  Settings,
  FolderKanban,
  Upload,
  User,
  Package,
  GraduationCap,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Clipboard
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useSidebar } from "@/contexts/sidebar-context"
import { cn } from "@/lib/utils"

export function Sidebar() {
  const pathname = usePathname()
  const { collapsed, setCollapsed } = useSidebar()
  const { logout, user } = useAuth()

  // Don't show sidebar on auth pages
  const authPages = ['/login', '/signup', '/forgot-password']
  if (authPages.includes(pathname)) {
    return null
  }

  const generalLinks = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/board", label: "Board", icon: Clipboard },
    { href: "/projects", label: "Projects", icon: FolderKanban },
    { href: "/learning", label: "Learning", icon: GraduationCap },
  ]

  const toolsLinks = [
    { href: "/files", label: "Files", icon: Upload },
    { href: "/notes", label: "Notes", icon: FileText },
    { href: "/components", label: "Components", icon: Code },
    { href: "/packages", label: "Packages", icon: Package },
  ]

  const bottomLinks = [
    { href: "/profile", label: "Profile", icon: User },
    { href: "/settings", label: "Settings", icon: Settings },
  ]

  return (
    <aside
      className={cn(
        "hidden lg:block fixed left-0 top-0 z-40 h-screen bg-[#030517] border-r border-[#1e293b] transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1e293b]">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/sav-icon.png"
                alt="SaveIt.AI"
                width={40}
                height={40}
                className="rounded-lg"
                priority
              />
              <span className="text-xl font-bold text-white">SaveIt.AI</span>
            </Link>
          )}
          {collapsed && (
            <Link href="/" className="mx-auto">
              <Image
                src="/sav-icon.png"
                alt="SaveIt.AI"
                width={40}
                height={40}
                className="rounded-lg"
                priority
              />
            </Link>
          )}
        </div>

        {/* Toggle Button */}
        <div className="absolute -right-3 top-20 z-50">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="bg-[#1e293b] hover:bg-[#334155] text-white rounded-full p-1.5 border border-[#334155] transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-3 scrollbar-hide">
          {/* General Section */}
          <div className="mb-5">
            {!collapsed && (
              <div className="px-4 mb-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  General
                </span>
              </div>
            )}
            <nav className="space-y-1 px-2">
              {generalLinks.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href
                return (
                  <Link key={link.href} href={link.href}>
                    <motion.div
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-all group relative",
                        isActive
                          ? "bg-[#1e40af] text-white"
                          : "text-gray-300 hover:bg-[#1e293b] hover:text-white"
                      )}
                      whileHover={{ x: 2 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Icon className={cn("h-5 w-5 flex-shrink-0", collapsed && "mx-auto")} />
                      {!collapsed && <span className="text-sm font-medium">{link.label}</span>}

                      {/* Tooltip for collapsed state */}
                      {collapsed && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-50">
                          {link.label}
                        </div>
                      )}
                    </motion.div>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Tools Section */}
          <div className="mb-5">
            {!collapsed && (
              <div className="px-4 mb-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Tools
                </span>
              </div>
            )}
            <nav className="space-y-1 px-2">
              {toolsLinks.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href
                return (
                  <Link key={link.href} href={link.href}>
                    <motion.div
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-all group relative",
                        isActive
                          ? "bg-[#1e40af] text-white"
                          : "text-gray-300 hover:bg-[#1e293b] hover:text-white"
                      )}
                      whileHover={{ x: 2 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Icon className={cn("h-5 w-5 flex-shrink-0", collapsed && "mx-auto")} />
                      {!collapsed && <span className="text-sm font-medium">{link.label}</span>}

                      {collapsed && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-50">
                          {link.label}
                        </div>
                      )}
                    </motion.div>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-[#1e293b] p-2">
          <nav className="space-y-1">
            {bottomLinks.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link key={link.href} href={link.href}>
                  <motion.div
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all group relative",
                      isActive
                        ? "bg-[#1e40af] text-white"
                        : "text-gray-300 hover:bg-[#1e293b] hover:text-white"
                    )}
                    whileHover={{ x: 2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Icon className={cn("h-5 w-5 flex-shrink-0", collapsed && "mx-auto")} />
                    {!collapsed && <span className="text-sm font-medium">{link.label}</span>}

                    {collapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-50">
                        {link.label}
                      </div>
                    )}
                  </motion.div>
                </Link>
              )
            })}

            {/* Logout Button */}
            <motion.button
              onClick={logout}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-gray-300 hover:bg-red-500/10 hover:text-red-400 group relative"
              )}
              whileHover={{ x: 2 }}
              transition={{ duration: 0.2 }}
            >
              <LogOut className={cn("h-5 w-5 flex-shrink-0", collapsed && "mx-auto")} />
              {!collapsed && <span className="text-sm font-medium">Logout</span>}

              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-50">
                  Logout
                </div>
              )}
            </motion.button>
          </nav>

          {/* User Info */}
          {!collapsed && user && (
            <div className="mt-2 p-2.5 rounded-lg bg-[#1e293b]">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-[#1e40af] flex items-center justify-center text-white text-sm font-semibold">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
