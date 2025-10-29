export async function generateSummary(content: string): Promise<string> {
  try {
    // Call our secure server-side API route
    const response = await fetch("/api/generate-summary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    })

    if (!response.ok) {
      throw new Error("Failed to generate summary")
    }

    const data = await response.json()
    return data.text
  } catch (error) {
    console.error("Gemini API error:", error)
    return "Error generating summary"
  }
}

export async function extractMetadata(url: string) {
  try {
    // This would typically be done server-side to avoid CORS
    const response = await fetch(url)
    const html = await response.text()

    const titleMatch = html.match(/<title>(.*?)<\/title>/)
    const title = titleMatch ? titleMatch[1] : url

    const descMatch = html.match(/<meta name="description" content="(.*?)"/)
    const description = descMatch ? descMatch[1] : ""

    return { title, description }
  } catch (error) {
    return { title: url, description: "" }
  }
}
