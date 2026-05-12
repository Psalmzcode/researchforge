import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { buildWatermarkedBuffer } from '@/lib/watermark-deliverable'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = session.user as any

  const deliverable = await db.deliverable.findUnique({
    where: { id: params.id },
    include: { order: { include: { client: true } } },
  })
  if (!deliverable) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const order = deliverable.order
  if (order.status !== 'AWAITING_CLIENT_PAYMENT') {
    return NextResponse.json({ error: 'Watermarked download only applies while final payment is pending' }, { status: 400 })
  }

  if (user.role === 'CLIENT') {
    if (order.clientId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    if (!order.client.allowWatermarkedDeliverableDownload) {
      return NextResponse.json(
        { error: 'Watermarked download is not enabled for your account. Use the on-site preview or pay your balance.' },
        { status: 403 },
      )
    }
  } else if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const built = await buildWatermarkedBuffer(deliverable.url, deliverable.type)
  if (!built) {
    return NextResponse.json(
      { error: 'This file type cannot be watermarked for download. Use on-site preview.' },
      { status: 415 },
    )
  }

  const base = deliverable.name.replace(/\.[^/.]+$/, '')
  const filename = `${base}${built.filenameSuffix}`

  return new NextResponse(new Uint8Array(built.buffer), {
    status: 200,
    headers: {
      'Content-Type': built.contentType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
    },
  })
}
