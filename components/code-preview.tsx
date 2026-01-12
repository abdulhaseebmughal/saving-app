"use client"

import { useState } from "react"
import { LiveProvider, LiveEditor, LiveError, LivePreview } from "react-live"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code, Eye, Sparkles, Copy, Check } from "lucide-react"
import * as React from "react"

interface CodePreviewProps {
  code: string
  language: string
  isPreviewable?: boolean
  onOptimize?: () => void
  optimizing?: boolean
}

export function CodePreview({
  code,
  language,
  isPreviewable = false,
  onOptimize,
  optimizing = false
}: CodePreviewProps) {
  const [activeTab, setActiveTab] = useState<string>(isPreviewable ? "preview" : "code")
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // For React/JSX code, we need to provide the scope
  const scope = {
    ...React,
    useState: React.useState,
    useEffect: React.useEffect,
    useRef: React.useRef,
    useMemo: React.useMemo,
    useCallback: React.useCallback,
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="capitalize">
            {language}
          </Badge>
          {isPreviewable && (
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
              <Eye className="h-3 w-3 mr-1" />
              Live Preview
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          {onOptimize && (
            <Button
              onClick={onOptimize}
              size="sm"
              variant="outline"
              disabled={optimizing}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {optimizing ? "Optimizing..." : "Optimize"}
            </Button>
          )}
          <Button onClick={handleCopy} size="sm" variant="outline">
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>

      {isPreviewable && (language === 'react' || language === 'nextjs') ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="code">
              <Code className="h-4 w-4 mr-2" />
              Code
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="mt-4">
            <Card className="p-6">
              <LiveProvider code={code} scope={scope} noInline={code.includes('render(')}>
                <LiveError className="text-red-500 text-sm mb-4 p-4 bg-red-50 rounded-lg" />
                <LivePreview className="min-h-[200px]" />
              </LiveProvider>
            </Card>
          </TabsContent>

          <TabsContent value="code" className="mt-4">
            <div className="relative">
              <LiveProvider code={code} scope={scope}>
                <LiveEditor
                  className="font-mono text-sm rounded-lg border bg-muted/30 p-4 overflow-auto max-h-[500px]"
                  style={{
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
                  }}
                />
              </LiveProvider>
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="p-4">
          <pre className="font-mono text-sm overflow-auto max-h-[500px] bg-muted/30 p-4 rounded-lg">
            <code className={`language-${language}`}>{code}</code>
          </pre>
        </Card>
      )}
    </div>
  )
}
