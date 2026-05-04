import { NextRequest, NextResponse } from 'next/server'
import { getPersonnelById, updatePersonnel, deletePersonnel } from '@/lib/api/teambuilder-service'
import { NotFoundError, ValidationError } from '@/lib/api/types'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await getPersonnelById(id)
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
    const data = await updatePersonnel(id, body)
    return NextResponse.json(data)
  } catch (err) {
    if (err instanceof NotFoundError) return NextResponse.json({ error: err.message }, { status: 404 })
    if (err instanceof ValidationError) return NextResponse.json({ error: err.message }, { status: 400 })
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await deletePersonnel(id)
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    if (err instanceof NotFoundError) return NextResponse.json({ error: err.message }, { status: 404 })
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
