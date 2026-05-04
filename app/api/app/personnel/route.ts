import { NextRequest, NextResponse } from 'next/server'
import { listPersonnel, createPersonnel } from '@/lib/api/teambuilder-service'
import { ValidationError } from '@/lib/api/types'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const result = await listPersonnel({
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
    if (!body.name || !body.personnel_type) {
      return NextResponse.json({ error: 'name and personnel_type are required' }, { status: 400 })
    }
    const data = await createPersonnel(body)
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
