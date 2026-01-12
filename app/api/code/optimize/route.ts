import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: No token provided" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { code, language } = body

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, error: "Code is required" },
        { status: 400 }
      )
    }

    if (code.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: "Code snippet is too short" },
        { status: 400 }
      )
    }

    const response = await fetch(`${BACKEND_URL}/api/code/optimize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({ code, language: language || 'javascript' }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data.error || 'Failed to optimize code',
          details: data.details || 'The AI service could not optimize this code'
        },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error optimizing code:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to optimize code",
        details: error instanceof Error ? error.message : "An unexpected error occurred"
      },
      { status: 500 }
    )
  }
}
