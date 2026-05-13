import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { createNotification } from '@/lib/notifications'
import { parseJsonBody } from '@/lib/api-error'
import { orderMessageAccessResult } from '@/lib/order-message-access'

const postSchema = z.object({
  message: z.preprocess((v) => (typeof v === 'string' ? v.trim() : v), z.string().min(1, 'Message cannot be empty.')),
  isInternal: z.boolean().default(false),
})

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = session.user as any

  const gate = await orderMessageAccessResult(params.id, user)
  if (gate === 'notfound') return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (gate === 'forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const messages = await db.orderMessage.findMany({
    where: {
      orderId: params.id,
      deletedAt: null,
      ...(user.role === 'CLIENT' ? { isInternal: false } : {}),
    },
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
  const { message, isInternal: internalRequested } = parsed.data
  const internal = Boolean(internalRequested && user.role !== 'CLIENT')

  const msg = await db.orderMessage.create({
    data: { orderId: params.id, userId: user.id, message, isInternal: internal },
    include: { user: { select: { name: true, role: true } } },
  })

  const order = await db.order.findUnique({
    where: { id: params.id },
    select: { clientId: true, assignedTo: true, orderNumber: true },
  })
  if (order && !internal && user.id !== order.clientId) {
    await createNotification(
      order.clientId,
      'New Message',
      `Reply on order ${order.orderNumber}`,
      'info',
      `/dashboard/client/orders/${params.id}`,
    )
  }
  if (order && order.assignedTo && !internal && user.id !== order.assignedTo) {
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
