import { NextRequest, NextResponse } from 'next/server'
import { deleteTag } from '@/lib/api/teambuilder-service'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await deleteTag(id)
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
