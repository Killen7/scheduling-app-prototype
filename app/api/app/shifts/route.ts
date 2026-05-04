import { NextRequest, NextResponse } from 'next/server'
import { listShifts, createShift } from '@/lib/api/teambuilder-service'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const result = await listShifts({
      personnel_office_id: sp.get('personnel_office_id') ?? undefined,
      begin_date: sp.get('begin_date') ?? undefined,
      end_date: sp.get('end_date') ?? undefined,
      skip: Number(sp.get('skip') ?? 0),
      take: Number(sp.get('take') ?? 1000),
    })
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.personnel_office_id || !body.start_at || !body.end_at) {
      return NextResponse.json(
        { error: 'personnel_office_id, start_at, and end_at are required' },
        { status: 400 }
      )
    }
    const data = await createShift(body)
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
