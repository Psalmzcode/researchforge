import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import { sendStatusUpdate } from '@/lib/email'
import { createNotification } from '@/lib/notifications'

const schema = z.object({
  status: z.enum(['REVIEWING','IN_PROGRESS','NEEDS_CLARIFICATION','PENDING_REVIEW','AWAITING_CLIENT_PAYMENT','COMPLETED','DELIVERED','CANCELLED']),
  note: z.string().optional(),
})

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = session.user as any
  if (!['ADMIN','RESEARCHER'].includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { status, note } = schema.parse(await req.json())

  const order = await db.order.update({
    where: { id: params.id },
    data: { status, adminNotes: note, reviewedBy: user.id, reviewedAt: new Date() },
    include: { client: true },
  })

  await db.orderTimeline.create({ data: { orderId: order.id, status, note, userId: user.id } })
  await db.activity.create({ data: { action: `Order ${status.toLowerCase()}`, detail: order.orderNumber, userId: user.id } })

  // Notify client
  await sendStatusUpdate(order.client.email, order.client.name || 'Client', order.orderNumber, status, note)
  await createNotification(order.clientId, `Order Update: ${order.orderNumber}`, `Your order is now ${status.replace('_',' ')}`, 'info', `/dashboard/client/orders/${order.id}`)

  return NextResponse.json(order)
}
