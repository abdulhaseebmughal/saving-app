"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Send, Loader2, LinkIcon, FileText, Code } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { saveItem, type SavedItem } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface ChatInputProps {
  onItemSaved?: (item: SavedItem) => void
}

export function ChatInput({ onItemSaved }: ChatInputProps) {
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  const detectType = (content: string): "link" | "code" | "note" | "component" => {
    const urlPattern = /^https?:\/\//i
    if (urlPattern.test(content.trim())) {
      return "link"
    }

    // Check for code patterns
    const codePatterns = [
      /^(import|export|const|let|var|function|class|interface|type)\s/m,
      /^<[A-Z]/m, // JSX component
      /^\s*{/m, // JSON or object
      /^def\s|^class\s/m, // Python
    ]

    if (codePatterns.some((pattern) => pattern.test(content))) {
      return "code"
    }

    // Check for component patterns
    if (/<[A-Z][a-zA-Z0-9]*/.test(content)) {
      return "component"
    }

    return "note"
  }

  const handleSubmit = async () => {
    if (!input.trim()) return

    setIsProcessing(true)

    try {
      const type = detectType(input)

      // For notes and code, use first line as title
      let title = ""
      if (type === "note" || type === "code" || type === "component") {
        const firstLine = input.split("\n")[0].slice(0, 50)
        title = firstLine || `${type.charAt(0).toUpperCase() + type.slice(1)} Snippet`
      }

      // Save to backend - backend handles metadata extraction and AI
      const savedItem = await saveItem({
        type,
        title,
        content: input,
      })

      toast({
        title: "Saved successfully!",
        description: `Your ${type} has been saved with AI-generated metadata.`,
      })

      setInput("")

      // Notify parent component
      if (onItemSaved) {
        onItemSaved(savedItem)
      }
    } catch (error) {
      console.error("Error processing input:", error)
      toast({
        title: "Error",
        description: "Failed to save item. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <div className="rounded-xl border border-border bg-card p-4 shadow-lg">
        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
          <LinkIcon className="h-4 w-4" />
          <FileText className="h-4 w-4" />
          <Code className="h-4 w-4" />
          <span>Paste a link, note, or code snippet...</span>
        </div>

        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="https://example.com or your notes or code..."
          className="min-h-[120px] resize-none border-0 bg-transparent p-0 text-base focus-visible:ring-0"
          disabled={isProcessing}
        />

        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Press <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">⌘</kbd> +{" "}
            <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">Enter</kbd> to save
          </p>

          <Button onClick={handleSubmit} disabled={isProcessing || !input.trim()} className="gap-2">
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>

      {isProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 rounded-lg border border-border bg-card p-4"
        >
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <div className="space-y-1">
              <p className="text-sm font-medium">AI is analyzing your content...</p>
              <p className="text-xs text-muted-foreground">Generating summary and tags</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
