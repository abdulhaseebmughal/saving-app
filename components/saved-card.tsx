"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ExternalLink, Trash2, Copy, Check, FileText, Code, LinkIcon, Edit2, Save, X } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { deleteItem, type SavedItem } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { CodeBlock } from "@/components/code-block"
import { PlatformBadge, CategoryBadge } from "@/components/platform-icon"

interface SavedCardProps {
  item: SavedItem
  onDelete?: (id: string) => void
}

export function SavedCard({ item, onDelete }: SavedCardProps) {
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(item.title)
  const [editTags, setEditTags] = useState(item.tags?.join(", ") || "")
  const { toast } = useToast()

  const handleCopy = () => {
    navigator.clipboard.writeText(item.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDelete = async () => {
    try {
      await deleteItem(item.id)
      toast({
        title: "Deleted",
        description: "Item has been removed",
      })
      if (onDelete) {
        onDelete(item.id)
      }
    } catch (error) {
      console.error("Delete error:", error)
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSaveEdit = async () => {
    try {
      const API_BASE_URL = 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/item/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editTitle,
          tags: editTags.split(",").map(t => t.trim()).filter(Boolean),
        }),
      })

      if (!response.ok) throw new Error('Failed to update')

      toast({
        title: "Updated",
        description: "Item has been updated successfully",
      })

      setIsEditing(false)
      // Trigger refresh by calling onDelete with the item ID
      if (onDelete) {
        onDelete(item.id)
      }
      // Reload the page to show updated data
      window.location.reload()
    } catch (error) {
      console.error("Update error:", error)
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      })
    }
  }

  const handleCancelEdit = () => {
    setEditTitle(item.title)
    setEditTags(item.tags?.join(", ") || "")
    setIsEditing(false)
  }

  const getIcon = () => {
    switch (item.type) {
      case "link":
        return <LinkIcon className="h-4 w-4" />
      case "code":
      case "component":
        return <Code className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Card className="group h-full overflow-hidden border-border bg-card transition-colors hover:border-primary/50">
        <CardHeader className="space-y-3 pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="rounded-md bg-primary/10 p-1.5 text-primary">{getIcon()}</div>
              <Badge variant="secondary" className="text-xs">
                {item.type}
              </Badge>
              {item.platform && item.type === "link" && (
                <PlatformBadge platform={item.platform} />
              )}
              {item.category && item.type === "link" && (
                <CategoryBadge category={item.category} />
              )}
            </div>
            <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              {isEditing ? (
                <>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600" onClick={handleSaveEdit}>
                    <Save className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCancelEdit}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsEditing(true)}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={handleDelete}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {item.thumbnail && (
            <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
              <Image src={item.thumbnail || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
            </div>
          )}

          {isEditing ? (
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="text-base font-semibold"
              placeholder="Title"
            />
          ) : (
            <h3 className="line-clamp-2 text-base font-semibold leading-tight text-balance">{item.title}</h3>
          )}
        </CardHeader>

        <CardContent className="space-y-3 pb-3">
          {item.type === "code" || item.type === "component" ? (
            <CodeBlock code={item.content.slice(0, 200)} maxHeight="150px" />
          ) : (
            <p className="line-clamp-3 text-sm text-muted-foreground text-pretty">{item.summary || item.content}</p>
          )}

          {isEditing ? (
            <Input
              value={editTags}
              onChange={(e) => setEditTags(e.target.value)}
              className="text-xs"
              placeholder="Tags (comma separated)"
            />
          ) : (
            item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {item.tags.slice(0, 3).map((tag, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-xs text-muted-foreground">
            {new Date(item.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
          {item.url && (
            <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs" asChild>
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                Visit
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}
