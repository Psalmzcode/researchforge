import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { createNotification, notifyAdmins } from '@/lib/notifications'
import { parseJsonBody } from '@/lib/api-error'
import { orderMessageAccessResult } from '@/lib/order-message-access'
import { audienceForNewMessage, orderMessageVisibilityWhere } from '@/lib/order-message-audience'

const NOTIFY_RESEARCHER_STATUSES = [
  'IN_PROGRESS',
  'NEEDS_CLARIFICATION',
  'PENDING_REVIEW',
  'REVIEWING',
  'COMPLETED',
  'DELIVERED',
] as const

const postSchema = z.object({
  message: z.preprocess((v) => (typeof v === 'string' ? v.trim() : v), z.string().min(1, 'Message cannot be empty.')),
  isInternal: z.boolean().default(false),
  /** When the sender is ADMIN and the note is not internal: who may read this message. */
  adminAudience: z.enum(['CLIENT', 'RESEARCHER']).optional(),
})

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = session.user as any

  const gate = await orderMessageAccessResult(params.id, user)
  if (gate === 'notfound') return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (gate === 'forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const messages = await db.orderMessage.findMany({
    where: orderMessageVisibilityWhere(params.id, user.role),
    include: { user: { select: { name: true, role: true } } },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(messages)
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = session.user as any

  const gate = await orderMessageAccessResult(params.id, user)
  if (gate === 'notfound') return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (gate === 'forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const parsed = parseJsonBody(postSchema, await req.json())
  if (!parsed.ok) return parsed.response
  const { message, isInternal: internalRequested, adminAudience } = parsed.data
  const internal = Boolean(internalRequested && user.role !== 'CLIENT')

  const audience = audienceForNewMessage({
    userRole: user.role,
    adminAudience: user.role === 'ADMIN' ? adminAudience : undefined,
  })

  const msg = await db.orderMessage.create({
    data: { orderId: params.id, userId: user.id, message, isInternal: internal, audience },
    include: { user: { select: { name: true, role: true } } },
  })

  const order = await db.order.findUnique({
    where: { id: params.id },
    select: { clientId: true, assignedTo: true, orderNumber: true, status: true },
  })

  if (order && !internal && ['CLIENT', 'RESEARCHER'].includes(user.role)) {
    await notifyAdmins(
      'New order message',
      `${user.role === 'CLIENT' ? 'Client' : 'Researcher'} — ${order.orderNumber}`,
      `/dashboard/admin/orders/${params.id}`,
    )
  }

  if (order && !internal && audience === 'CLIENT_ADMIN' && user.id !== order.clientId) {
    await createNotification(
      order.clientId,
      'New Message',
      `Reply on order ${order.orderNumber}`,
      'info',
      `/dashboard/client/orders/${params.id}`,
    )
  }
  if (
    order &&
    order.assignedTo &&
    !internal &&
    audience === 'RESEARCHER_ADMIN' &&
    user.id !== order.assignedTo &&
    (NOTIFY_RESEARCHER_STATUSES as readonly string[]).includes(order.status)
  ) {
    await createNotification(
      order.assignedTo,
      'New Message',
      `Message on order ${order.orderNumber}`,
      'info',
      `/dashboard/researcher/orders/${params.id}`,
    )
  }
  return NextResponse.json(msg, { status: 201 })
}
