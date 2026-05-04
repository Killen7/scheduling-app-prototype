import { NextResponse } from 'next/server'
import { getScheduleV2 } from '@/lib/api/teambuilder-service'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    return NextResponse.json(await getScheduleV2(searchParams))
  } catch (error) {
    return NextResponse.json(
      { error: { message: error instanceof Error ? error.message : 'Failed to load schedule.' } },
      { status: 500 }
    )
  }
}
