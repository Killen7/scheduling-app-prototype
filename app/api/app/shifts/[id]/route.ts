import { NextRequest, NextResponse } from 'next/server'
import { getShiftById, updateShift, deleteShift } from '@/lib/api/teambuilder-service'
import { NotFoundError } from '@/lib/api/types'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await getShiftById(id)
    return NextResponse.json(data)
  } catch (err) {
    if (err instanceof NotFoundError) return NextResponse.json({ error: err.message }, { status: 404 })
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const data = await updateShift(id, body)
    return NextResponse.json(data)
  } catch (err) {
    if (err instanceof NotFoundError) return NextResponse.json({ error: err.message }, { status: 404 })
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await deleteShift(id)
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    if (err instanceof NotFoundError) return NextResponse.json({ error: err.message }, { status: 404 })
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
