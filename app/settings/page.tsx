"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Save, Key, Server, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const [backendUrl, setBackendUrl] = useState("")
  const [geminiApiKey, setGeminiApiKey] = useState("")
  const [saved, setSaved] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Load saved settings from localStorage
    const savedBackendUrl = localStorage.getItem("backend_url") || "https://saving-app-backend-six.vercel.app/api"
    const savedGeminiKey = localStorage.getItem("gemini_api_key") || ""
    setBackendUrl(savedBackendUrl)
    setGeminiApiKey(savedGeminiKey)
  }, [])

  const handleSave = () => {
    localStorage.setItem("backend_url", backendUrl)
    localStorage.setItem("gemini_api_key", geminiApiKey)

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)

    toast({
      title: "Settings saved",
      description: "Your configuration has been updated successfully.",
    })
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-balance">Settings</h1>
        <p className="text-lg text-muted-foreground text-pretty">Configure your backend and AI integration settings.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Backend Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-primary/10 p-2 text-primary">
                <Server className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Backend Configuration</CardTitle>
                <CardDescription>Set your backend API endpoint</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="backend-url">Backend URL</Label>
              <Input
                id="backend-url"
                type="text"
                placeholder="https://saving-app-backend-six.vercel.app/api"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">The URL of your backend API server</p>
            </div>
          </CardContent>
        </Card>

        {/* AI Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-primary/10 p-2 text-primary">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>AI Configuration</CardTitle>
                <CardDescription>Configure your Gemini API key</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gemini-key">Gemini API Key</Label>
              <Input
                id="gemini-key"
                type="password"
                placeholder="Enter your Gemini API key"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Get your API key from{" "}
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google AI Studio
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="gap-2" size="lg">
            {saved ? (
              <>
                <Check className="h-4 w-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
