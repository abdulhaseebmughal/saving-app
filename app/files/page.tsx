"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Upload, FolderOpen, File, Trash2, Search, Plus, X, Download, Eye, FileText, FileCode, FileImage, FileVideo, FileAudio, FileArchive, FileSpreadsheet, Presentation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { AnimatePresence, motion } from "framer-motion"
import { CreateIndustryDialog } from "@/components/create-industry-dialog"
import { getAuthHeaders } from "@/lib/auth-headers"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://saving-app-backend-six.vercel.app/api'

interface Industry {
  _id: string
  name: string
  description: string
  icon: string
  color: string
  fileCount: number
}

interface FileItem {
  _id: string
  name: string
  path: string
  size: number
  type: string
  category: string
  industry?: {
    _id: string
    name: string
    icon: string
    color: string
  }
  uploadedAt: string
}

export default function FilesPage() {
  const [industries, setIndustries] = useState<Industry[]>([])
  const [files, setFiles] = useState<FileItem[]>([])
  const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([])
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateIndustry, setShowCreateIndustry] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const fetchIndustries = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/industries`, {
        headers: getAuthHeaders()
      })
      const result = await response.json()
      if (result.success) {
        setIndustries(result.data)
      }
    } catch (error) {
      console.error('Error fetching industries:', error)
    }
  }, [])

  const fetchFiles = useCallback(async () => {
    setLoading(true)
    try {
      let url = `${API_BASE_URL}/files`
      if (selectedIndustry) {
        url += `?industry=${selectedIndustry}`
      }

      const response = await fetch(url, {
        headers: getAuthHeaders()
      })
      const result = await response.json()
      if (result.success) {
        setFiles(result.data)
        setFilteredFiles(result.data)
      }
    } catch (error) {
      console.error('Error fetching files:', error)
      toast({
        title: "Error",
        description: "Failed to load files",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [selectedIndustry, toast])

  useEffect(() => {
    fetchIndustries()
  }, [fetchIndustries])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredFiles(files)
    } else {
      const filtered = files.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredFiles(filtered)
    }
  }, [searchQuery, files])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const items = Array.from(e.dataTransfer.items)
    const droppedFiles: File[] = []

    for (const item of items) {
      if (item.kind === 'file') {
        const file = item.getAsFile()
        if (file) {
          droppedFiles.push(file)
        }
      }
    }

    if (droppedFiles.length > 0) {
      await uploadFiles(droppedFiles)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length > 0) {
      uploadFiles(selectedFiles)
    }
  }

  const uploadFiles = async (filesToUpload: File[]) => {
    if (!selectedIndustry) {
      toast({
        title: "Select Industry",
        description: "Please select an industry before uploading files",
        variant: "destructive"
      })
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      filesToUpload.forEach((file) => {
        formData.append('files', file)
      })
      formData.append('industry', selectedIndustry)

      const token = localStorage.getItem('saveit_token')
      const response = await fetch(`${API_BASE_URL}/files/upload`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Upload Successful",
          description: `${filesToUpload.length} file(s) uploaded`
        })
        fetchFiles()
        fetchIndustries()
      } else {
        toast({
          title: "Upload Failed",
          description: result.error || "Failed to upload files",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload files",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDownloadFile = async (file: FileItem) => {
    try {
      const token = localStorage.getItem('saveit_token')
      const response = await fetch(`${API_BASE_URL}/files/${file._id}/download`, {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      })

      if (!response.ok) {
        throw new Error('Download failed')
      }

      // Get the file blob
      const blob = await response.blob()

      // Create download link
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Downloaded",
        description: `${file.name} downloaded successfully`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive"
      })
    }
  }

  const handleDeleteFile = async (id: string) => {
    try {
      await fetch(`${API_BASE_URL}/files/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      setFiles(files.filter(f => f._id !== id))
      fetchIndustries()
      toast({
        title: "Deleted",
        description: "File removed"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive"
      })
    }
  }

  const handleDeleteIndustry = async (id: string) => {
    if (!window.confirm('Delete this industry? Files will remain but be unorganized.')) return

    try {
      const response = await fetch(`${API_BASE_URL}/industries/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      const result = await response.json()

      if (!result.success) {
        toast({
          title: "Error",
          description: result.error || "Failed to delete industry",
          variant: "destructive"
        })
        return
      }

      setIndustries(industries.filter(ind => ind._id !== id))
      if (selectedIndustry === id) {
        setSelectedIndustry(null)
      }
      fetchFiles()
      toast({
        title: "Deleted",
        description: "Industry removed"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete industry",
        variant: "destructive"
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileIcon = (category: string) => {
    const iconProps = { className: "w-5 h-5" }
    switch (category) {
      case 'code': return <FileCode {...iconProps} />
      case 'pdf': return <FileText {...iconProps} />
      case 'document': return <FileText {...iconProps} />
      case 'spreadsheet': return <FileSpreadsheet {...iconProps} />
      case 'presentation': return <Presentation {...iconProps} />
      case 'image': return <FileImage {...iconProps} />
      case 'video': return <FileVideo {...iconProps} />
      case 'audio': return <FileAudio {...iconProps} />
      case 'archive': return <FileArchive {...iconProps} />
      case 'text': return <FileText {...iconProps} />
      default: return <File {...iconProps} />
    }
  }

  const getCategoryBadge = (category: string) => {
    const badgeColors: Record<string, string> = {
      code: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      pdf: 'bg-red-500/10 text-red-500 border-red-500/20',
      document: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      spreadsheet: 'bg-green-500/10 text-green-500 border-green-500/20',
      presentation: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      image: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      video: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
      audio: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
      archive: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      text: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
      other: 'bg-muted text-muted-foreground border-border'
    }

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${badgeColors[category] || badgeColors.other}`}>
        {category}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                File Manager
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {industries.length} industries • {files.length} files
              </p>
            </div>

            <Button
              onClick={() => setShowCreateIndustry(true)}
              variant="outline"
              className="h-9 px-3 text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">New Industry</span>
            </Button>
          </div>

          {/* Search */}
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
        </div>

        {/* Industries */}
        {industries.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Industries
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              <button
                onClick={() => setSelectedIndustry(null)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedIndustry === null
                    ? 'border-primary bg-accent'
                    : 'border-border hover:border-muted-foreground'
                }`}
              >
                <FolderOpen className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm font-medium text-foreground">All Files</div>
                <div className="text-xs text-muted-foreground">{files.length}</div>
              </button>

              <AnimatePresence>
                {industries.map((industry) => (
                  <motion.div
                    key={industry._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group relative"
                  >
                    <button
                      onClick={() => setSelectedIndustry(industry._id)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        selectedIndustry === industry._id
                          ? 'border-primary bg-accent'
                          : 'border-border hover:border-muted-foreground'
                      }`}
                    >
                      <div className="text-2xl mb-2">{industry.icon}</div>
                      <div className="text-sm font-medium text-foreground truncate">
                        {industry.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {industry.fileCount} files
                      </div>
                    </button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteIndustry(industry._id)
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Upload Area */}
        {selectedIndustry && (
          <div className="mb-8">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                isDragging
                  ? 'border-primary bg-accent'
                  : 'border-border hover:border-muted-foreground'
              }`}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Drop files here
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                or click to browse from your computer
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                variant="outline"
              >
                {uploading ? 'Uploading...' : 'Select Files'}
              </Button>
            </div>
          </div>
        )}

        {/* Files */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              {selectedIndustry
                ? industries.find(i => i._id === selectedIndustry)?.name
                : 'All Files'}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({filteredFiles.length})
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-sm text-muted-foreground">Loading files...</p>
              </div>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="flex items-center justify-center min-h-[400px] py-20 border-2 border-dashed border-border rounded-lg">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4 max-w-md px-4"
              >
                <div className="flex justify-center">
                  <FolderOpen className="w-16 h-16 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-bold text-foreground">
                  {searchQuery ? "No files found" : "No files yet"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? `No files match "${searchQuery}"`
                    : selectedIndustry
                    ? "Upload files to this industry"
                    : "Select an industry to upload files"}
                </p>
              </motion.div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence>
                {filteredFiles.map((file) => (
                  <motion.div
                    key={file._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group"
                  >
                    <div className="p-4 rounded-lg border border-border bg-card hover:border-muted-foreground transition-all hover:shadow-md">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="text-muted-foreground">{getFileIcon(file.category || 'other')}</div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm text-foreground truncate">
                              {file.name}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-primary/10 hover:text-primary flex-shrink-0"
                            onClick={() => handleDownloadFile(file)}
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
                            onClick={() => handleDeleteFile(file._id)}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {getCategoryBadge(file.category || 'other')}
                        {file.industry && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground border border-border">
                            <span>{file.industry.icon}</span>
                            <span>{file.industry.name}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <CreateIndustryDialog
        open={showCreateIndustry}
        onClose={() => setShowCreateIndustry(false)}
        onSuccess={fetchIndustries}
      />
    </div>
  )
}
