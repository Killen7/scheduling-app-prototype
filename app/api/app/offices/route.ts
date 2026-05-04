import { NextRequest, NextResponse } from 'next/server'
import { listOfficeEntities, createOffice } from '@/lib/api/teambuilder-service'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const result = await listOfficeEntities({
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
    if (!body.name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }
    const data = await createOffice({ name: body.name })
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
