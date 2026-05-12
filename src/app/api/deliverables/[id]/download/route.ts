import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = session.user as any

  const deliverable = await db.deliverable.findUnique({ where: { id: params.id }, include: { order: true } })
  if (!deliverable) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Only client who owns it or admin/researcher can download
  if (user.role === 'CLIENT' && deliverable.order.clientId !== user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  if (user.role === 'CLIENT' && deliverable.order.status === 'AWAITING_CLIENT_PAYMENT') {
    return NextResponse.json(
      { error: 'Complete your installment balance to download final files. Use the on-site preview or an authorised watermarked download.' },
      { status: 403 },
    )
  }

  await db.deliverable.update({ where: { id: params.id }, data: { downloadCount: { increment: 1 } } })
  await db.activity.create({ data: { userId: user.id, action: 'Downloaded deliverable', detail: deliverable.name } })

  // Redirect to actual file URL (R2/S3 signed URL in production)
  return NextResponse.redirect(deliverable.url)
}
