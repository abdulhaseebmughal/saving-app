"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { WordEditor } from "@/app/components/word-editor"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://saving-app-backend-six.vercel.app/api'

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('saveit_token') : null
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
}

interface DiaryNote {
  _id: string
  title: string
  content: string
  type?: 'note' | 'document'
}

export default function DocumentEditorPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [document, setDocument] = useState<DiaryNote | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchDocument(params.id as string)
    }
  }, [params.id])

  const fetchDocument = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/diary-notes/${id}`, {
        headers: getAuthHeaders()
      })
      if (response.ok) {
        const result = await response.json()
        const doc = result.success ? result.data : result
        setDocument(doc)
      } else {
        toast({ title: "Document not found", variant: "destructive" })
        router.push('/notes')
      }
    } catch (error) {
      console.error('Error fetching document:', error)
      toast({ title: "Error loading document", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (title: string, content: string) => {
    if (!document) return

    try {
      const response = await fetch(`${API_BASE_URL}/diary-notes/${document._id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title, content })
      })
      if (response.ok) {
        const result = await response.json()
        const updatedDoc = result.success ? result.data : result
        setDocument(updatedDoc)
      }
    } catch (error) {
      console.error('Error updating document:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!document) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Document not found</p>
          <Button onClick={() => router.push('/notes')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Notes
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen">
      {/* Back Button - Fixed Position */}
      <div className="absolute top-4 left-4 z-50">
        <Button
          onClick={() => router.push('/notes')}
          variant="secondary"
          size="sm"
          className="shadow-lg"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Notes
        </Button>
      </div>

      <WordEditor
        documentId={document._id}
        initialTitle={document.title}
        initialContent={document.content}
        onUpdate={handleUpdate}
      />
    </div>
  )
}
