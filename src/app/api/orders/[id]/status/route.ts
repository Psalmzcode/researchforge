import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { sendStatusUpdate } from '@/lib/email'
import { createNotification } from '@/lib/notifications'
import { parseJsonBody } from '@/lib/api-error'
import { getOrderFundingBlockReason } from '@/lib/order-funding'

const schema = z.object({
  status: z.enum([
    'REVIEWING',
    'IN_PROGRESS',
    'NEEDS_CLARIFICATION',
    'PENDING_REVIEW',
    'AWAITING_CLIENT_PAYMENT',
    'COMPLETED',
    'DELIVERED',
    'CANCELLED',
  ]),
  note: z.string().optional(),
})

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = session.user as any
  if (!['ADMIN', 'RESEARCHER'].includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const parsed = parseJsonBody(schema, await req.json())
  if (!parsed.ok) return parsed.response
  const { status, note } = parsed.data

  const existing = await db.order.findUnique({
    where: { id: params.id },
    include: { client: true },
  })
  if (!existing) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  if (status === 'IN_PROGRESS') {
    const fundingBlock = await getOrderFundingBlockReason({
      id: existing.id,
      projectId: existing.projectId,
      clientId: existing.clientId,
    })
    if (fundingBlock) return NextResponse.json({ error: fundingBlock }, { status: 400 })
  }

  const order = await db.order.update({
    where: { id: params.id },
    data: { status, adminNotes: note, reviewedBy: user.id, reviewedAt: new Date() },
    include: { client: true },
  })

  await db.orderTimeline.create({ data: { orderId: order.id, status, note, userId: user.id } })
  await db.activity.create({ data: { action: `Order ${status.toLowerCase()}`, detail: order.orderNumber, userId: user.id } })

  await sendStatusUpdate(order.client.email, order.client.name || 'Client', order.orderNumber, status, note)
  await createNotification(
    order.clientId,
    `Order Update: ${order.orderNumber}`,
    `Your order is now ${status.replace('_', ' ')}`,
    'info',
    `/dashboard/client/orders/${order.id}`,
  )

  return NextResponse.json(order)
}
