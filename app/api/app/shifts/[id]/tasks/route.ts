import { NextRequest, NextResponse } from 'next/server'
import { addTaskToShift } from '@/lib/api/teambuilder-service'
import { ValidationError } from '@/lib/api/types'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    if (!body.task_id) {
      return NextResponse.json({ error: 'task_id is required' }, { status: 400 })
    }
    const data = await addTaskToShift(id, body)
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
