import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || 'https://saving-app-backend-six.vercel.app'

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
    const { courseData } = body

    if (!courseData) {
      return NextResponse.json(
        { success: false, error: "Course data is required" },
        { status: 400 }
      )
    }

    if (!courseData.courseTitle) {
      return NextResponse.json(
        { success: false, error: "Course title is required" },
        { status: 400 }
      )
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('📤 Proxying create-from-structure request to backend...')
      console.log('📊 Course:', courseData.courseTitle)
      console.log('📦 Modules:', courseData.modules?.length || 0)
    }

    const response = await fetch(`${BACKEND_URL}/api/courses/create-from-structure`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({ courseData }),
    })

    const data = await response.json()

    if (!response.ok) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('❌ Backend error:', data)
      }
      return NextResponse.json(
        {
          success: false,
          error: data.error || 'Failed to create course',
          details: data.details || 'The backend server could not create this course'
        },
        { status: response.status }
      )
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ Course created successfully:', data.data?.course?._id)
    }

    return NextResponse.json(data)
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error("❌ Error creating course from structure:", error)
    }
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create course from structure",
        details: error instanceof Error ? error.message : "An unexpected error occurred"
      },
      { status: 500 }
    )
  }
}
