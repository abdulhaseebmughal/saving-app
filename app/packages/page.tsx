"use client"

import { useState, useEffect } from "react"
import { PackageCard } from "@/components/package-card"
import { AddPackageDialog } from "@/components/add-package-dialog-simple"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { fetchPackages, deletePackage, Package } from "@/lib/api"
import { Plus, Package2, Search, Loader2 } from "lucide-react"
import { toast } from "sonner"

const categories = [
  { value: 'all', label: 'All Packages' },
  { value: 'ui', label: 'UI Components' },
  { value: 'state-management', label: 'State Management' },
  { value: 'routing', label: 'Routing' },
  { value: 'animation', label: 'Animation' },
  { value: 'utility', label: 'Utility' },
  { value: 'testing', label: 'Testing' },
  { value: 'build-tool', label: 'Build Tool' },
  { value: 'database', label: 'Database' },
  { value: 'authentication', label: 'Authentication' },
  { value: 'api', label: 'API' },
  { value: 'styling', label: 'Styling' },
  { value: 'validation', label: 'Validation' },
  { value: 'charts', label: 'Charts' },
  { value: 'forms', label: 'Forms' },
  { value: 'icons', label: 'Icons' },
  { value: 'date', label: 'Date & Time' },
  { value: 'other', label: 'Other' },
]

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const loadPackages = async () => {
    try {
      setLoading(true)
      const category = selectedCategory === 'all' ? undefined : selectedCategory
      const fetchedPackages = await fetchPackages(category, searchQuery)
      setPackages(fetchedPackages)
    } catch (error) {
      console.error("Failed to load packages:", error)
      toast.error("Failed to load packages")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPackages()
  }, [selectedCategory, searchQuery])

  const handleDelete = async (id: string) => {
    try {
      await deletePackage(id)
      setPackages(prev => prev.filter(pkg => pkg._id !== id))
      toast.success("Package deleted successfully!")
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Failed to delete package")
    }
  }

  const handlePackageSaved = () => {
    loadPackages()
  }

  const filteredPackages = packages

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-balance">Packages</h1>
            <p className="text-lg text-muted-foreground text-pretty">
              Manage and track all your project dependencies in one place.
            </p>
          </div>
          <Button onClick={() => setShowAddDialog(true)} size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            <Package2 className="h-5 w-5" />
            Add Package
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search packages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <Badge
              key={cat.value}
              variant={selectedCategory === cat.value ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/80 transition-colors"
              onClick={() => setSelectedCategory(cat.value)}
            >
              {cat.label}
            </Badge>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredPackages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Package2 className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No packages found</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery
              ? "No packages match your search criteria."
              : "Start by adding your first package!"}
          </p>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Package
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => (
            <PackageCard
              key={pkg._id}
              package={pkg}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <AddPackageDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={handlePackageSaved}
      />
    </div>
  )
}
