import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")
  const limit = searchParams.get("limit") || "10"

  if (!query) {
    return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 })
  }

  try {
    const encodedQuery = encodeURIComponent(query.trim())
    const deezerUrl = `https://api.deezer.com/search?q=${encodedQuery}&limit=${limit}`

    const response = await fetch(deezerUrl)

    if (!response.ok) {
      // Forward the error status from Deezer API
      const errorData = await response.json()
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in Deezer proxy API:", error)
    return NextResponse.json({ error: "Failed to fetch from Deezer API" }, { status: 500 })
  }
}
