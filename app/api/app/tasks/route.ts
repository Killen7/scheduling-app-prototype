import { NextRequest, NextResponse } from 'next/server'
import { listTasks, createTask } from '@/lib/api/teambuilder-service'

export async function GET() {
  try {
    const data = await listTasks()
    return NextResponse.json(data)
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
    const data = await createTask(body)
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
