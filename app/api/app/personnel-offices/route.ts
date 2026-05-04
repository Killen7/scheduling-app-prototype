import { NextRequest, NextResponse } from 'next/server'
import { listPersonnelOffices, createPersonnelOffice } from '@/lib/api/teambuilder-service'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const result = await listPersonnelOffices({
      personnel_id: sp.get('personnel_id') ?? undefined,
      office_id: sp.get('office_id') ?? undefined,
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
    if (!body.personnel_id || !body.office_id) {
      return NextResponse.json({ error: 'personnel_id and office_id are required' }, { status: 400 })
    }
    const data = await createPersonnelOffice(body)
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
