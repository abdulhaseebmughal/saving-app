"use client"

import Image from "next/image"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { usePathname } from "next/navigation"
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
  Clipboard
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

export function MobileHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { logout, user } = useAuth()

  // Don't show on auth pages
  const authPages = ['/login', '/signup', '/forgot-password']
  if (authPages.includes(pathname)) {
    return null
  }

  const allLinks = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard, section: "General" },
    { href: "/board", label: "Board", icon: Clipboard, section: "General" },
    { href: "/projects", label: "Projects", icon: FolderKanban, section: "General" },
    { href: "/learning", label: "Learning", icon: GraduationCap, section: "General" },
    { href: "/files", label: "Files", icon: Upload, section: "Tools" },
    { href: "/notes", label: "Notes", icon: FileText, section: "Tools" },
    { href: "/components", label: "Components", icon: Code, section: "Tools" },
    { href: "/packages", label: "Packages", icon: Package, section: "Tools" },
    { href: "/profile", label: "Profile", icon: User, section: "Account" },
    { href: "/settings", label: "Settings", icon: Settings, section: "Account" },
  ]

  return (
    <>
      {/* Mobile Header - Only visible on mobile */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0a1628] border-b border-[#1e293b]">
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/sav-icon.png"
              alt="SaveIt.AI"
              width={32}
              height={32}
              className="rounded-lg"
              priority
            />
            <span className="text-lg font-bold text-white">SaveIt.AI</span>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white hover:bg-[#1e293b]"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Sidebar */}
      <aside
        className={cn(
          "lg:hidden fixed top-0 right-0 z-50 h-screen w-64 bg-[#0a1628] border-l border-[#1e293b] transform transition-transform duration-300",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#1e293b]">
            <div className="flex items-center gap-2">
              <Image
                src="/sav-icon.png"
                alt="SaveIt.AI"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="text-lg font-bold text-white">SaveIt.AI</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(false)}
              className="text-white hover:bg-[#1e293b]"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Info */}
          {user && (
            <div className="p-4 border-b border-[#1e293b]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#1e40af] flex items-center justify-center text-white font-semibold">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
            {/* General */}
            <div className="mb-6">
              <div className="px-4 mb-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  General
                </span>
              </div>
              <nav className="space-y-1 px-2">
                {allLinks.filter(link => link.section === "General").map((link) => {
                  const Icon = link.icon
                  const isActive = pathname === link.href
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                          isActive
                            ? "bg-[#1e40af] text-white"
                            : "text-gray-300 hover:bg-[#1e293b] hover:text-white"
                        )}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span className="text-sm font-medium">{link.label}</span>
                      </div>
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* Tools */}
            <div className="mb-6">
              <div className="px-4 mb-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Tools
                </span>
              </div>
              <nav className="space-y-1 px-2">
                {allLinks.filter(link => link.section === "Tools").map((link) => {
                  const Icon = link.icon
                  const isActive = pathname === link.href
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                          isActive
                            ? "bg-[#1e40af] text-white"
                            : "text-gray-300 hover:bg-[#1e293b] hover:text-white"
                        )}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span className="text-sm font-medium">{link.label}</span>
                      </div>
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* Account */}
            <div className="mb-6">
              <div className="px-4 mb-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Account
                </span>
              </div>
              <nav className="space-y-1 px-2">
                {allLinks.filter(link => link.section === "Account").map((link) => {
                  const Icon = link.icon
                  const isActive = pathname === link.href
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                          isActive
                            ? "bg-[#1e40af] text-white"
                            : "text-gray-300 hover:bg-[#1e293b] hover:text-white"
                        )}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span className="text-sm font-medium">{link.label}</span>
                      </div>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Logout */}
          <div className="p-4 border-t border-[#1e293b]">
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                logout()
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-all"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
