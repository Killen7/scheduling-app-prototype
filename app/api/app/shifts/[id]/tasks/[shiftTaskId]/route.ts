import { NextRequest, NextResponse } from 'next/server'
import { removeTaskFromShift } from '@/lib/api/teambuilder-service'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; shiftTaskId: string }> }
) {
  try {
    const { shiftTaskId } = await params
    await removeTaskFromShift(shiftTaskId)
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
