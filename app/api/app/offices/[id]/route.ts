import { NextRequest, NextResponse } from 'next/server'
import { getOfficeById, updateOffice, deleteOffice } from '@/lib/api/teambuilder-service'
import { NotFoundError } from '@/lib/api/types'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await getOfficeById(id)
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
    if (!body.name) return NextResponse.json({ error: 'name is required' }, { status: 400 })
    const data = await updateOffice(id, { name: body.name })
    return NextResponse.json(data)
  } catch (err) {
    if (err instanceof NotFoundError) return NextResponse.json({ error: err.message }, { status: 404 })
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await deleteOffice(id)
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    if (err instanceof NotFoundError) return NextResponse.json({ error: err.message }, { status: 404 })
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
