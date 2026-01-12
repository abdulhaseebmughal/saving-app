"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package as PackageIcon, Trash2, ExternalLink, Copy, Calendar } from "lucide-react"
import { Package } from "@/lib/api"
import { format } from "date-fns"
import { toast } from "sonner"

interface PackageCardProps {
  package: Package
  onDelete?: (id: string) => void
}

const categoryColors: Record<string, string> = {
  ui: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "state-management": "bg-purple-500/10 text-purple-600 border-purple-500/20",
  routing: "bg-green-500/10 text-green-600 border-green-500/20",
  animation: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  utility: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  testing: "bg-red-500/10 text-red-600 border-red-500/20",
  "build-tool": "bg-orange-500/10 text-orange-600 border-orange-500/20",
  database: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  authentication: "bg-teal-500/10 text-teal-600 border-teal-500/20",
  api: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  styling: "bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-500/20",
  validation: "bg-lime-500/10 text-lime-600 border-lime-500/20",
  charts: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  forms: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  icons: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  date: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  other: "bg-gray-500/10 text-gray-600 border-gray-500/20",
}

export function PackageCard({ package: pkg, onDelete }: PackageCardProps) {
  const handleCopyInstall = async () => {
    const installCmd = pkg.installCommand || `npm install ${pkg.name}`
    await navigator.clipboard.writeText(installCmd)
    toast.success("Install command copied!")
  }

  const handleDelete = () => {
    if (window.confirm(`Delete ${pkg.name}?`)) {
      onDelete?.(pkg._id)
    }
  }

  const categoryClass = categoryColors[pkg.category || 'other'] || categoryColors.other

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <PackageIcon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg leading-none mb-1">{pkg.name}</h3>
              <Badge variant="outline" className="text-xs">
                v{pkg.version}
              </Badge>
            </div>
          </div>
        </div>

        {pkg.category && (
          <Badge className={categoryClass} variant="outline">
            {pkg.category.replace('-', ' ')}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {pkg.purpose && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Purpose</p>
            <p className="text-sm">{pkg.purpose}</p>
          </div>
        )}

        {pkg.subCategory && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Sub-category</p>
            <p className="text-sm capitalize">{pkg.subCategory}</p>
          </div>
        )}

        {pkg.description && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
            <p className="text-sm text-muted-foreground line-clamp-2">{pkg.description}</p>
          </div>
        )}

        {pkg.tags && pkg.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {pkg.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {pkg.addedDate && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
            <Calendar className="h-3 w-3" />
            Added {format(new Date(pkg.addedDate), 'MMM d, yyyy')}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 flex-wrap">
        <Button
          size="sm"
          variant="outline"
          onClick={handleCopyInstall}
          className="flex-1"
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy Install
        </Button>

        {pkg.homepage && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(pkg.homepage, '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        )}

        <Button
          size="sm"
          variant="ghost"
          onClick={handleDelete}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
