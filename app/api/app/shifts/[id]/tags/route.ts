import { NextRequest, NextResponse } from 'next/server'
import { addTagToShift } from '@/lib/api/teambuilder-service'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    if (!body.tag_id) {
      return NextResponse.json({ error: 'tag_id is required' }, { status: 400 })
    }
    const data = await addTagToShift(id, body.tag_id)
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
