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
  // Code-specific fields
  codeLanguage?: string
  framework?: string
  optimizationSuggestions?: string[]
  codeQuality?: number
  componentPreview?: boolean
  dependencies?: string[]
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
      codeLanguage: result.data.codeLanguage,
      framework: result.data.framework,
      optimizationSuggestions: result.data.optimizationSuggestions,
      codeQuality: result.data.codeQuality,
      componentPreview: result.data.componentPreview,
      dependencies: result.data.dependencies,
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
      codeLanguage: item.codeLanguage,
      framework: item.framework,
      optimizationSuggestions: item.optimizationSuggestions,
      codeQuality: item.codeQuality,
      componentPreview: item.componentPreview,
      dependencies: item.dependencies,
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

// Code-specific API functions

export async function analyzeCode(code: string) {
  try {
    const response = await fetch('/api/code/analyze', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ code }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || errorData.details || 'Failed to analyze code')
    }

    const result = await response.json()
    return result.data
  } catch (error) {
    console.error("Error analyzing code:", error)
    throw error
  }
}

export async function optimizeCode(code: string, language: string) {
  try {
    const response = await fetch('/api/code/optimize', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ code, language }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || errorData.details || 'Failed to optimize code')
    }

    const result = await response.json()
    return result.data
  } catch (error) {
    console.error("Error optimizing code:", error)
    throw error
  }
}

export async function updateThumbnail(id: string, thumbnail: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/item/${id}/thumbnail`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ thumbnail }),
    })

    if (!response.ok) {
      throw new Error('Failed to update thumbnail')
    }

    const result = await response.json()
    return result.data
  } catch (error) {
    console.error("Error updating thumbnail:", error)
    throw error
  }
}

// Package management API functions

export interface Package {
  _id: string
  name: string
  version: string
  description?: string
  purpose?: string
  category?: string
  subCategory?: string
  packageManager?: string
  installCommand?: string
  homepage?: string
  repository?: string
  npmUrl?: string
  tags?: string[]
  dependencies?: string[]
  devDependency?: boolean
  aiGenerated?: boolean
  addedDate?: string
  createdAt: string
  updatedAt?: string
}

export async function savePackage(packageData: Partial<Package>): Promise<Package> {
  try {
    const response = await fetch(`${API_BASE_URL}/packages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(packageData),
    })

    if (!response.ok) {
      throw new Error('Failed to save package')
    }

    const result = await response.json()
    return result.data
  } catch (error) {
    console.error("Error saving package:", error)
    throw error
  }
}

export async function fetchPackages(category?: string, search?: string): Promise<Package[]> {
  try {
    const params = new URLSearchParams()
    if (category) params.append('category', category)
    if (search) params.append('search', search)

    const response = await fetch(`${API_BASE_URL}/packages?${params.toString()}`, {
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error('Failed to fetch packages')
    }

    const result = await response.json()
    return result.data
  } catch (error) {
    console.error("Error fetching packages:", error)
    return []
  }
}

export async function deletePackage(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/packages/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error('Failed to delete package')
    }
  } catch (error) {
    console.error("Error deleting package:", error)
    throw error
  }
}

export async function updatePackage(id: string, updates: Partial<Package>): Promise<Package> {
  try {
    const response = await fetch(`${API_BASE_URL}/packages/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      throw new Error('Failed to update package')
    }

    const result = await response.json()
    return result.data
  } catch (error) {
    console.error("Error updating package:", error)
    throw error
  }
}
export async function extractNpmPackage(url: string): Promise<Partial<Package>> {
  try {
    const response = await fetch(`${API_BASE_URL}/packages/extract-npm`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ url }),
    })

    if (!response.ok) {
      throw new Error('Failed to extract package information')
    }

    const result = await response.json()
    return result.data
  } catch (error) {
    console.error("Error extracting NPM package:", error)
    throw error
  }
}
