import { NextRequest, NextResponse } from 'next/server'
import { removeTagFromShift } from '@/lib/api/teambuilder-service'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; tagId: string }> }
) {
  try {
    const { id, tagId } = await params
    await removeTagFromShift(id, tagId)
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
