import { Youtube, Instagram, Github, Twitter, Linkedin, Facebook, FileText, MessageCircle, Music, Globe } from "lucide-react"

interface PlatformIconProps {
  platform: string
  className?: string
}

const PLATFORM_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  youtube: {
    icon: Youtube,
    color: 'text-red-600',
    label: 'YouTube'
  },
  instagram: {
    icon: Instagram,
    color: 'text-pink-600',
    label: 'Instagram'
  },
  github: {
    icon: Github,
    color: 'text-gray-900 dark:text-gray-100',
    label: 'GitHub'
  },
  twitter: {
    icon: Twitter,
    color: 'text-blue-400',
    label: 'Twitter'
  },
  linkedin: {
    icon: Linkedin,
    color: 'text-blue-700',
    label: 'LinkedIn'
  },
  facebook: {
    icon: Facebook,
    color: 'text-blue-600',
    label: 'Facebook'
  },
  medium: {
    icon: FileText,
    color: 'text-gray-900 dark:text-gray-100',
    label: 'Medium'
  },
  reddit: {
    icon: MessageCircle,
    color: 'text-orange-600',
    label: 'Reddit'
  },
  tiktok: {
    icon: Music,
    color: 'text-gray-900 dark:text-gray-100',
    label: 'TikTok'
  },
  website: {
    icon: Globe,
    color: 'text-blue-500',
    label: 'Website'
  },
  other: {
    icon: Globe,
    color: 'text-gray-500',
    label: 'Link'
  }
}

export function PlatformIcon({ platform, className = "w-5 h-5" }: PlatformIconProps) {
  const config = PLATFORM_CONFIG[platform] || PLATFORM_CONFIG.other
  const Icon = config.icon

  return (
    <div className="flex items-center gap-2" title={config.label}>
      <Icon className={`${className} ${config.color}`} />
    </div>
  )
}

export function PlatformBadge({ platform }: { platform: string }) {
  const config = PLATFORM_CONFIG[platform] || PLATFORM_CONFIG.other
  const Icon = config.icon

  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-medium">
      <Icon className={`w-3.5 h-3.5 ${config.color}`} />
      <span>{config.label}</span>
    </div>
  )
}

// Category badge component
const CATEGORY_CONFIG: Record<string, { color: string; bgColor: string; label: string }> = {
  education: { color: 'text-blue-700', bgColor: 'bg-blue-100 dark:bg-blue-900/30', label: 'Education' },
  technology: { color: 'text-purple-700', bgColor: 'bg-purple-100 dark:bg-purple-900/30', label: 'Technology' },
  ai: { color: 'text-indigo-700', bgColor: 'bg-indigo-100 dark:bg-indigo-900/30', label: 'AI' },
  programming: { color: 'text-green-700', bgColor: 'bg-green-100 dark:bg-green-900/30', label: 'Programming' },
  design: { color: 'text-pink-700', bgColor: 'bg-pink-100 dark:bg-pink-900/30', label: 'Design' },
  business: { color: 'text-orange-700', bgColor: 'bg-orange-100 dark:bg-orange-900/30', label: 'Business' },
  music: { color: 'text-red-700', bgColor: 'bg-red-100 dark:bg-red-900/30', label: 'Music' },
  gaming: { color: 'text-violet-700', bgColor: 'bg-violet-100 dark:bg-violet-900/30', label: 'Gaming' },
  news: { color: 'text-gray-700', bgColor: 'bg-gray-100 dark:bg-gray-900/30', label: 'News' },
  entertainment: { color: 'text-yellow-700', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', label: 'Entertainment' },
  lifestyle: { color: 'text-teal-700', bgColor: 'bg-teal-100 dark:bg-teal-900/30', label: 'Lifestyle' },
  other: { color: 'text-gray-600', bgColor: 'bg-gray-100 dark:bg-gray-800', label: 'Other' }
}

export function CategoryBadge({ category }: { category: string }) {
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.other

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
      {config.label}
    </span>
  )
}
