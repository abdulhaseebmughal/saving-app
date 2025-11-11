// Backend API URL - Use environment variable or default to production
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://saving-app-backend-six.vercel.app/api';

// Get auth token from localStorage
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('saveit_token');
}

// Get auth headers
function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

export interface SavedItem {
  id: string
  type: "note" | "link" | "code" | "component"
  title: string
  content: string
  summary?: string
  tags?: string[]
  thumbnail?: string
  image?: string
  favicon?: string
  domain?: string
  author?: string
  language?: string
  contentType?: string
  readabilityScore?: number
  confidence?: number
  notes?: string
  publishedDate?: string
  createdAt: string
  updatedAt?: string
  url?: string
  platform?: string
  category?: string
}

export async function saveItem(item: Omit<SavedItem, "id" | "createdAt">): Promise<SavedItem> {
  try {
    const response = await fetch(`${API_BASE_URL}/save`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        type: item.type,
        content: item.content,
        title: item.title,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to save item')
    }

    const result = await response.json()

    // Map backend response to frontend format
    return {
      id: result.data._id,
      type: result.data.type,
      title: result.data.title,
      content: result.data.content,
      summary: result.data.summary,
      tags: result.data.tags,
      thumbnail: result.data.thumbnail || result.data.image,
      image: result.data.image,
      favicon: result.data.favicon,
      domain: result.data.domain,
      author: result.data.author,
      language: result.data.language,
      contentType: result.data.contentType,
      readabilityScore: result.data.readabilityScore,
      confidence: result.data.confidence,
      notes: result.data.notes,
      publishedDate: result.data.publishedDate,
      createdAt: result.data.createdAt,
      updatedAt: result.data.updatedAt,
      url: result.data.type === 'link' ? result.data.content : undefined,
      platform: result.data.platform,
      category: result.data.category,
    }
  } catch (error) {
    console.error("Error saving item:", error)
    throw error
  }
}

export async function fetchItems(): Promise<SavedItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/items`, {
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error('Failed to fetch items')
    }

    const result = await response.json()

    // Map backend items to frontend format
    return result.data.map((item: any) => ({
      id: item._id,
      type: item.type,
      title: item.title,
      content: item.content,
      summary: item.summary,
      tags: item.tags,
      thumbnail: item.thumbnail || item.image,
      image: item.image,
      favicon: item.favicon,
      domain: item.domain,
      author: item.author,
      language: item.language,
      contentType: item.contentType,
      readabilityScore: item.readabilityScore,
      confidence: item.confidence,
      notes: item.notes,
      publishedDate: item.publishedDate,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      url: item.type === 'link' ? item.content : undefined,
      platform: item.platform,
      category: item.category,
    }))
  } catch (error) {
    console.error("Error fetching items:", error)
    return []
  }
}

export async function deleteItem(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/item/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error('Failed to delete item')
    }
  } catch (error) {
    console.error("Error deleting item:", error)
    throw error
  }
}
