import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = session.user as any
  if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = z.object({ allowWatermarkedDeliverableDownload: z.boolean() }).parse(await req.json())

  const client = await db.user.findFirst({
    where: { id: params.id, role: 'CLIENT' },
  })
  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

  const updated = await db.user.update({
    where: { id: params.id },
    data: { allowWatermarkedDeliverableDownload: body.allowWatermarkedDeliverableDownload },
    select: { id: true, email: true, allowWatermarkedDeliverableDownload: true },
  })

  return NextResponse.json(updated)
}
