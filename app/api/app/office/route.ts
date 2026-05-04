import { NextResponse } from 'next/server'
import { getOffices } from '@/lib/api/teambuilder-service'

export async function GET() {
  try {
    return NextResponse.json(await getOffices())
  } catch (error) {
    return NextResponse.json(
      { error: { message: error instanceof Error ? error.message : 'Failed to load offices.' } },
      { status: 500 }
    )
  }
}
