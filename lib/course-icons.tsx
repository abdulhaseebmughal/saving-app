import {
  BookOpen, Code, GraduationCap, Laptop, Zap, Target, Rocket, Brain,
  Database, Shield, Palette, Globe, Cpu, Cloud, Lock, Sparkles,
  FileCode, Wrench, LucideIcon
} from 'lucide-react'

// Icon mapping
const ICON_MAP: Record<string, LucideIcon> = {
  BookOpen,
  Code,
  GraduationCap,
  Laptop,
  Zap,
  Target,
  Rocket,
  Brain,
  Database,
  Shield,
  Palette,
  Globe,
  Cpu,
  Cloud,
  Lock,
  Sparkles,
  FileCode,
  Wrench
}

// Get icon component by name
export function getCourseIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName] || BookOpen
}

// Render icon component
export function renderCourseIcon(iconName: string, className?: string) {
  const IconComponent = getCourseIcon(iconName)
  return <IconComponent className={className} />
}
