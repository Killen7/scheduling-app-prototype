import { NextResponse } from 'next/server'
import { getRecommendationItems } from '@/lib/api/teambuilder-service'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    return NextResponse.json(await getRecommendationItems(searchParams))
  } catch (error) {
    return NextResponse.json(
      { error: { message: error instanceof Error ? error.message : 'Failed to load recommendations.' } },
      { status: 500 }
    )
  }
}
