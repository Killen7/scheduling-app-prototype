import { NextResponse } from 'next/server'
import { getStaffAvailability } from '@/lib/api/teambuilder-service'

type StaffAvailabilityRequest = {
  officeId?: string
  dates?: Array<{ beginDate?: string; endDate?: string }>
}

export async function POST(request: Request) {
  let body: StaffAvailabilityRequest

  try {
    body = (await request.json()) as StaffAvailabilityRequest
  } catch {
    return NextResponse.json({ error: { message: 'Invalid JSON payload.' } }, { status: 400 })
  }

  const officeId = typeof body.officeId === 'string' ? body.officeId : ''
  const dates = (body.dates ?? [])
    .map((period) => ({
      beginDate: typeof period.beginDate === 'string' ? period.beginDate : '',
      endDate: typeof period.endDate === 'string' ? period.endDate : '',
    }))
    .filter((period) => period.beginDate && period.endDate)

  if (!officeId) {
    return NextResponse.json({ error: { message: 'officeId is required.' } }, { status: 400 })
  }

  if (dates.length === 0) {
    return NextResponse.json({ error: { message: 'dates is required.' } }, { status: 400 })
  }

  try {
    const availability = await getStaffAvailability({ officeId, dates })
    return NextResponse.json(availability)
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          message: error instanceof Error ? error.message : 'Failed to load staff availability.',
        },
      },
      { status: 500 }
    )
  }
}
